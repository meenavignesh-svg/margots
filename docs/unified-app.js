(()=>{'use strict';
const $=id=>document.getElementById(id),chat=$('chat'),input=$('input'),statusEl=$('status'),drawer=$('drawer'),panel=$('panel'),file=$('hiddenFile');
const KEYS=['gemini','groq','openrouter'],HKEY='margots_unified_history_v2';let uploaded=[];
const Bio=window.MargotsBio||null;
const Lit=window.MargotsLiterature||null;

function setStatus(t){if(statusEl)statusEl.textContent=t}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&','<':'<','>':'>','"':'"',"'":'&#39;'}[c]))}

function add(text,who='assistant',meta='MARGOTS',links=[],cls=''){
  $('welcome')?.remove();
  const d=document.createElement('div');
  d.className='msg '+(who==='user'?'user':'assistant');
  let whoCls='system';
  if(/strict|gemini/i.test(meta))whoCls='strict';
  else if(/context|groq/i.test(meta))whoCls='context';
  else if(/skeptic|openrouter/i.test(meta))whoCls='skeptic';
  else if(/deterministic|local|facts/i.test(meta))whoCls='local';
  let html=`<div class="bubble ${cls}">${who==='assistant'?`<span class="who ${whoCls}">${esc(meta)}</span>`:''}`;
  if(cls==='facts'||/DETERMINISTIC/i.test(meta))html+=`<div class="facts">${esc(text)}</div>`;
  else html+=esc(text);
  for(const l of links)html+=`<a class="source" target="_blank" rel="noopener noreferrer" href="${esc(l.url)}">${esc(l.title||l.url)}</a>`;
  html+='</div>';
  d.innerHTML=html;chat.appendChild(d);chat.scrollTop=chat.scrollHeight;return d;
}

function addAgents(results){
  $('welcome')?.remove();
  const wrap=document.createElement('div');
  wrap.className='msg assistant';
  const cols=results.length>=3?'cols-3':results.length===2?'cols-2':'';
  let html=`<div class="bubble"><span class="who system">AI INTERPRETATION — not experimental validation</span><div class="agents ${cols}">`;
  for(const r of results){
    const c=(/strict/i.test(r.label)?'strict':/context/i.test(r.label)?'context':/skeptic/i.test(r.label)?'skeptic':'');
    html+=`<div class="agent-card ${c}"><span class="who ${c}">${esc(r.label)}</span>${esc(r.text||r.error||'No response')}</div>`;
  }
  html+='</div></div>';
  wrap.innerHTML=html;chat.appendChild(wrap);chat.scrollTop=chat.scrollHeight;
}

function saveHistory(q,a){try{const h=JSON.parse(localStorage.getItem(HKEY)||'[]');h.unshift({q,a,t:new Date().toISOString()});localStorage.setItem(HKEY,JSON.stringify(h.slice(0,50)))}catch{}}
function keys(){return Object.fromEntries(KEYS.map(k=>[k,(localStorage.getItem('margots_'+k)||'').trim()]).filter(([,v])=>v))}
function openDrawer(html){panel.innerHTML=html;drawer.classList.add('open')}
function closeDrawer(){drawer.classList.remove('open')}
drawer.onclick=e=>{if(e.target===drawer)closeDrawer()};

function findSequence(text){const m=String(text).match(/\b[ACGTUN]{20,}\b/i);return m?m[0]:null}
function needsLiterature(q){return /\b(paper|pubmed|study|literature|research|journal|doi|citation|review)\b/i.test(q)||(!findSequence(q)&&q.split(/\s+/).length>=4)}
function needsAI(q){return !/^(gc|reverse complement|translate|orf)\b/i.test(q.trim())||q.length>40||needsLiterature(q)}

function localFacts(seq){
  if(Bio&&Bio.analyze)return Bio.analyze(seq);
  const s=String(seq).toUpperCase().replace(/\s+/g,'');
  const gc=((s.match(/[GC]/g)||[]).length/s.length*100).toFixed(2);
  return{layer:'DETERMINISTIC',kind:'DNA',length:s.length,gc_percent:Number(gc)};
}

function uploadText(f){return new Promise((res,rej)=>{const r=new FileReader;r.onload=()=>res(String(r.result||''));r.onerror=rej;r.readAsText(f)})}
async function handleFiles(fs){
  for(const f of fs){
    if(f.size>8*1024*1024){add(f.name+': exceeds 8 MB browser limit.','assistant','SYSTEM');continue}
    if(!/\.(fa|fasta|fna|fastq|fq|csv|tsv|txt|json|vcf|bed|gff|gff3|gb|gbk|pep|faa|seq)$/i.test(f.name)){
      add(f.name+': unsupported format. Try FASTA, FASTQ, CSV, TSV, VCF, BED, GFF, TXT, JSON.','assistant','SYSTEM');continue}
    try{
      const text=await uploadText(f);
      uploaded.push({name:f.name,size:f.size,text:text.slice(0,120000)});
      add('Uploaded '+f.name+' ('+Math.max(1,Math.round(f.size/1024))+' KB). Available as conversation context.','assistant','SYSTEM');
      if(Bio&&Bio.parseFasta&&/>/.test(text)){
        const recs=Bio.parseFasta(text).slice(0,3);
        for(const rec of recs){
          const facts=localFacts(rec.sequence);
          add(JSON.stringify({header:rec.header,...facts},null,2),'assistant','DETERMINISTIC FACTS',[],'facts');
        }
      }else{
        const seq=findSequence(text);
        if(seq)add(JSON.stringify(localFacts(seq),null,2),'assistant','DETERMINISTIC FACTS',[],'facts');
      }
    }catch{add(f.name+': could not read as text.','assistant','SYSTEM')}
  }
}
$('attach').onclick=()=>file.click();
file.onchange=()=>{handleFiles([...file.files]);file.value=''};

async function gemini(key,q,context){
  const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key='+encodeURIComponent(key),{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({contents:[{parts:[{text:
      'You are Margots. Separate facts from interpretation. Never invent citations. If literature context is empty, say so. Question: '+q+'\nContext:\n'+context}]}]})});
  if(!r.ok)throw Error('Gemini HTTP '+r.status+' (CORS/network/key/quota)');
  const j=await r.json();
  return j.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('')||'';
}
async function compatible(url,key,model,q,context){
  const r=await fetch(url,{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},
    body:JSON.stringify({model,messages:[
      {role:'system',content:'You are Margots. Do not fabricate papers or experimental facts. Label uncertainty.'},
      {role:'user',content:q+'\n\nContext:\n'+context}],temperature:.2})});
  if(!r.ok)throw Error(model+' HTTP '+r.status+' (CORS/network/key/quota)');
  const j=await r.json();
  return j.choices?.[0]?.message?.content||'';
}

async function runAgents(q,context){
  const k=keys();
  if(!Object.keys(k).length){openKeys();return null}
  setStatus('THINKING');
  const jobs=[];
  if(k.gemini)jobs.push(gemini(k.gemini,q,context).then(t=>({label:'STRICT · Gemini',text:t})).catch(e=>({label:'STRICT · Gemini',error:String(e.message||e)})));
  if(k.groq)jobs.push(compatible('https://api.groq.com/openai/v1/chat/completions',k.groq,'llama-3.3-70b-versatile',q,context).then(t=>({label:'CONTEXT · Groq',text:t})).catch(e=>({label:'CONTEXT · Groq',error:String(e.message||e)})));
  if(k.openrouter)jobs.push(compatible('https://openrouter.ai/api/v1/chat/completions',k.openrouter,'openai/gpt-4o-mini',q,context).then(t=>({label:'SKEPTIC · OpenRouter',text:t})).catch(e=>({label:'SKEPTIC · OpenRouter',error:String(e.message||e)})));
  return Promise.all(jobs);
}

function openKeys(){
  openDrawer(`<h2>API keys</h2>
<p><b>Storage:</b> keys are saved only in this browser via <code>localStorage</code> under <code>margots_gemini</code>, <code>margots_groq</code>, <code>margots_openrouter</code>. They are never sent to a Margots server.</p>
<p><b>CORS / failures:</b> model calls go browser→provider. Failures usually mean invalid key, quota, blocked network, or provider CORS/policy. Each agent fails independently.</p>
<p><b>Literature:</b> Europe PMC, OpenAlex, UniProt need no key.</p>
${KEYS.map(k=>`<div class="row"><b style="width:90px">${k}</b><input id="key_${k}" type="password" placeholder="Paste ${k} key"></div>`).join('')}
<div class="row"><button class="secondary" id="closePanel">Cancel</button><button class="primary" id="saveKeys">Save keys</button></div>`);
  KEYS.forEach(k=>{const el=$('key_'+k);if(el)el.value=localStorage.getItem('margots_'+k)||''});
  $('closePanel').onclick=closeDrawer;
  $('saveKeys').onclick=()=>{KEYS.forEach(k=>localStorage.setItem('margots_'+k,$('key_'+k).value.trim()));closeDrawer();add('API keys saved in localStorage only.','assistant','SYSTEM')};
}
$('keysBtn').onclick=openKeys;

function showHistory(){
  let h=[];try{h=JSON.parse(localStorage.getItem(HKEY)||'[]')}catch{}
  openDrawer(`<h2>History</h2>${h.length?h.map((x,i)=>`<div class="history-item" data-i="${i}"><b>${esc(x.q.slice(0,100))}</b><div style="color:#8b9bb0;font-size:11px">${new Date(x.t).toLocaleString()}</div></div>`).join(''):'<p>No saved conversations.</p>'}
<div class="row"><button class="secondary" id="closePanel">Close</button><button class="secondary" id="clearHist">Clear</button></div>`);
  $('closePanel').onclick=closeDrawer;
  $('clearHist').onclick=()=>{localStorage.removeItem(HKEY);closeDrawer()};
  panel.querySelectorAll('.history-item').forEach(el=>el.onclick=()=>{const x=h[Number(el.dataset.i)];add(x.q,'user');add(x.a);closeDrawer()});
}
$('historyBtn').onclick=showHistory;
$('clearBtn').onclick=()=>{
  chat.innerHTML=`<div class="welcome" id="welcome"><h1>Molecular intelligence</h1><p>Local sequence facts first. Independent AI agents when you need deeper reasoning.</p><div class="suggest"><button class="chip" type="button">Analyze a sequence</button><button class="chip" type="button">Explain a biotech topic</button><button class="chip" type="button">Analyze a file</button></div></div>`;
  uploaded=[];bindChips();
};

function bindChips(){
  document.querySelectorAll('.chip').forEach(b=>b.onclick=()=>{
    input.value=b.textContent.includes('sequence')
      ?'Analyze this DNA sequence: ATGAAATTTGGCGCGCGCGCGCGCATGCGCGCGCGCTAA'
      :b.textContent.includes('file')
        ?'Summarize the uploaded file using deterministic facts first.'
        :'What does recent literature say about CRISPR off-target detection methods?';
    input.focus();
  });
}
bindChips();

async function ask(q){
  q=q.trim();if(!q)return;
  add(q,'user');
  input.value='';input.style.height='auto';
  const seq=findSequence(q);
  const contextParts=uploaded.map(x=>'FILE '+x.name+':\n'+x.text.slice(0,15000));

  // 1) DETERMINISTIC layer — always when sequence present
  if(seq){
    const facts=localFacts(seq);
    add(JSON.stringify(facts,null,2),'assistant','DETERMINISTIC FACTS',[],'facts');
    contextParts.push('DETERMINISTIC_SEQUENCE_FACTS:\n'+JSON.stringify(facts));
  }

  // 2) PUBLIC LITERATURE — Europe PMC / OpenAlex / UniProt (no key)
  let litLinks=[];
  if(Lit&&needsLiterature(q)){
    setStatus('LITERATURE');
    try{
      const lit=await Lit.searchAll(q.replace(/[ACGTUN]{20,}/gi,' ').trim()||q);
      if(lit.papers&&lit.papers.length){
        litLinks=lit.papers.slice(0,8).map(p=>({title:(p.source+': '+(p.title||'').slice(0,80)),url:p.url}));
        add(Lit.formatContext(lit),'assistant','PUBLIC LITERATURE',litLinks);
        contextParts.push(Lit.formatContext(lit));
      }else{
        add('No literature hits from public APIs (or network/CORS blocked).','assistant','PUBLIC LITERATURE');
      }
      if(lit.errors&&lit.errors.length){
        add('Some literature sources failed: '+lit.errors.map(e=>e.source+': '+e.error).join('; '),'assistant','SYSTEM');
      }
    }catch(e){
      add('Literature lookup failed: '+e.message,'assistant','SYSTEM');
    }
  }

  // 3) AI INTERPRETATION — only with keys; clearly labeled
  if(needsAI(q)||!seq){
    try{
      const results=await runAgents(q,contextParts.join('\n\n'));
      if(results&&results.length){
        addAgents(results);
        saveHistory(q,results.map(r=>(r.label+': '+(r.text||r.error||''))).join('\n---\n'));
      }else if(!Object.keys(keys()).length&&seq){
        add('Deterministic facts are shown above. Add API keys for multi-agent interpretation.','assistant','SYSTEM');
      }
    }catch(e){
      add('AI step failed: '+e.message+' — check keys, quota, and network/CORS.','assistant','SYSTEM');
    }
  }else if(seq){
    add('Deterministic metrics only (no AI). Ask a broader question or add keys for interpretation.','assistant','SYSTEM');
  }
  setStatus('READY');
}

$('form').onsubmit=e=>{e.preventDefault();ask(input.value)};
input.oninput=()=>{input.style.height='auto';input.style.height=Math.min(input.scrollHeight,150)+'px'};
input.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();$('form').requestSubmit()}};
$('mic').onclick=()=>{
  const R=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!R){add('Voice input not supported in this browser.','assistant','SYSTEM');return}
  const r=new R;r.lang='en-IN';
  r.onstart=()=>setStatus('LISTENING');
  r.onresult=e=>{input.value=e.results[0][0].transcript;input.focus()};
  r.onerror=()=>setStatus('READY');r.onend=()=>setStatus('READY');r.start();
};

['dragenter','dragover'].forEach(t=>chat.addEventListener(t,e=>{e.preventDefault();chat.style.outline='2px dashed #22d3ee'}));
['dragleave','drop'].forEach(t=>chat.addEventListener(t,e=>{e.preventDefault();if(t==='drop'&&e.dataTransfer?.files?.length)handleFiles([...e.dataTransfer.files]);chat.style.outline=''}));
})();