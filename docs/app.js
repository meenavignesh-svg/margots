const MAX_CHARS=120000, HIST_KEY='margots_history_v2', KEYS=['gemini','groq','openrouter'];
const AGENT_SYSTEM='You are Margots, a bioinformatics analysis agent. Be precise and practical. Prefer measurable claims. When CONTEXT DATA is provided, use it. Keep answers short enough to speak aloud.';
const PROMPTS={
  strict:'Stick to measurable features in the provided data. Avoid speculation. If evidence is weak, say so.',
  context:'Interpret in biological context when relevant. Mark uncertainty clearly.',
  skeptic:'Challenge the obvious reading. Offer alternatives and list what would falsify the main interpretation.'
};
const EXAMPLES={
  dna:'ATGCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGTAA',
  rna:'AUGCGAUCGAUCGAUCGAUCGAUCGAUCGAUCGAUCGAUCGAUCGAUCGAUCGAUCGAUCGAUCGUAA',
  prot:'MKTAYIAKQRQISFVKSHFSRQLEERLGLIEVQAPILSRVGDGTQDNLSGAEKAVQVKVKALPDAQFEVVHSLAKWKRPM'
};
const CODON={
  TTT:'F',TTC:'F',TTA:'L',TTG:'L',CTT:'L',CTC:'L',CTA:'L',CTG:'L',
  ATT:'I',ATC:'I',ATA:'I',ATG:'M',GTT:'V',GTC:'V',GTA:'V',GTG:'V',
  TCT:'S',TCC:'S',TCA:'S',TCG:'S',CCT:'P',CCC:'P',CCA:'P',CCG:'P',
  ACT:'T',ACC:'T',ACA:'T',ACG:'T',GCT:'A',GCC:'A',GCA:'A',GCG:'A',
  TAT:'Y',TAC:'Y',TAA:'*',TAG:'*',CAT:'H',CAC:'H',CAA:'Q',CAG:'Q',
  AAT:'N',AAC:'N',AAA:'K',AAG:'K',GAT:'D',GAC:'D',GAA:'E',GAG:'E',
  TGT:'C',TGC:'C',TGA:'*',TGG:'W',CGT:'R',CGC:'R',CGA:'R',CGG:'R',
  AGT:'S',AGC:'S',AGA:'R',AGG:'R',GGT:'G',GGC:'G',GGA:'G',GGG:'G'
};
const COMP={A:'T',T:'A',G:'C',C:'G',U:'A'};

function buildHelix(container){
  const dna=document.createElement('div');dna.className='dna';
  for(let i=0;i<22;i++){
    const pair=document.createElement('div');pair.className='pair';
    pair.style.top=(12+i*24)+'px';pair.style.transform=`rotateY(${i*26}deg)`;
    const rung=document.createElement('div');rung.className='rung';
    const a=document.createElement('div'),b=document.createElement('div');
    if(i%2===0){a.className='base a';b.className='base b'}else{a.className='base c';b.className='base d'}
    pair.append(rung,a,b);dna.appendChild(pair);
  }
  container.appendChild(dna);
}
buildHelix(document.getElementById('dna_main'));

const $ = id => document.getElementById(id);
const els={
  modeBtns:[...document.querySelectorAll('.tab')],
  panels:{sequence:$('panel_sequence'),variant:$('panel_variant'),free:$('panel_free'),upload:$('panel_upload'),agent:$('panel_agent')},
  seq:$('seq'),seq_q:$('seq_q'),variant:$('variant'),ctx:$('ctx'),free_q:$('free_q'),upload_q:$('upload_q'),
  drop:$('drop'),file:$('file'),file_meta:$('file_meta'),run:$('run'),run_actions:$('run_actions'),status:$('status'),
  facts:$('facts'),facts_section:$('facts_section'),answers_section:$('answers_section'),main_hint:$('main_hint'),
  out_strict:$('out_strict'),out_context:$('out_context'),out_skeptic:$('out_skeptic'),
  open_keys:$('open_keys'),close_keys:$('close_keys'),save_keys:$('save_keys'),keys_modal:$('keys_modal'),keys_dot:$('keys_dot'),
  k_gemini:$('k_gemini'),k_groq:$('k_groq'),k_openrouter:$('k_openrouter'),
  chat:$('chat'),agent_q:$('agent_q'),agent_send:$('agent_send'),agent_status:$('agent_status'),
  hist_modal:$('hist_modal'),hist_list:$('hist_list'),hist_clear:$('hist_clear'),hist_close:$('hist_close'),
  export_modal:$('export_modal'),export_close:$('export_close'),exp_json:$('exp_json'),exp_txt:$('exp_txt'),exp_csv:$('exp_csv')
};

let mode='sequence', uploaded=null, lastResult=null;
let agentHistory=[{role:'system',content:AGENT_SYSTEM}];

function getKey(n){return (localStorage.getItem('margots_'+n)||'').trim()}
function loadKeys(){KEYS.forEach(k=>{els['k_'+k].value=getKey(k)});updateKeysDot()}
function saveKeys(){KEYS.forEach(k=>localStorage.setItem('margots_'+k,els['k_'+k].value.trim()));updateKeysDot()}
function updateKeysDot(){els.keys_dot.classList.toggle('on',KEYS.some(k=>getKey(k)))}
function openModal(m){m.classList.add('open')}
function closeModal(m){m.classList.remove('open')}
els.open_keys.onclick=()=>{loadKeys();openModal(els.keys_modal)};
els.close_keys.onclick=()=>closeModal(els.keys_modal);
els.save_keys.onclick=()=>{saveKeys();closeModal(els.keys_modal)};
els.keys_modal.onclick=e=>{if(e.target===els.keys_modal)closeModal(els.keys_modal)};
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal(els.keys_modal);closeModal(els.hist_modal);closeModal(els.export_modal)}});
loadKeys();

function setMode(m){
  mode=m;
  els.modeBtns.forEach(b=>b.classList.toggle('active',b.dataset.mode===m));
  Object.entries(els.panels).forEach(([n,el])=>{el.hidden=n!==m});
  const isAgent=m==='agent';
  els.run_actions.style.display=isAgent?'none':'flex';
  els.facts_section.style.display=isAgent?'none':'block';
  els.answers_section.style.display=isAgent?'none':'block';
  els.main_hint.style.display=isAgent?'none':'block';
}
els.modeBtns.forEach(btn=>btn.addEventListener('click',()=>setMode(btn.dataset.mode)));

document.querySelectorAll('[data-ex]').forEach(btn=>{
  btn.onclick=()=>{els.seq.value=EXAMPLES[btn.dataset.ex]||'';setMode('sequence')};
});
$('btn_example').onclick=()=>{els.seq.value=EXAMPLES.dna;els.seq_q.value='Summarize composition, ORFs, and anything unusual.';setMode('sequence')};

els.drop.addEventListener('click',()=>els.file.click());
['dragenter','dragover'].forEach(ev=>els.drop.addEventListener(ev,e=>{e.preventDefault();els.drop.classList.add('drag')}));
['dragleave','drop'].forEach(ev=>els.drop.addEventListener(ev,e=>{e.preventDefault();els.drop.classList.remove('drag')}));
els.drop.addEventListener('drop',e=>{const f=e.dataTransfer.files?.[0];if(f)handleFile(f)});
els.file.addEventListener('change',()=>{const f=els.file.files?.[0];if(f)handleFile(f)});

function formatBytes(n){if(n<1024)return n+' B';if(n<1048576)return (n/1024).toFixed(1)+' KB';return (n/1048576).toFixed(1)+' MB'}
function cleanSeq(s){return s.replace(/\s+/g,'').toUpperCase()}
function revComp(s){return [...s].reverse().map(c=>COMP[c]||c).join('')}
function translate(dna){
  let out='';
  for(let i=0;i+2<dna.length;i+=3){const c=dna.slice(i,i+3);out+=CODON[c]||'X'}
  return out;
}
function findORFs(dna,minLen=30){
  const stops=new Set(['TAA','TAG','TGA']);
  const orfs=[];
  for(const strand of [dna,revComp(dna)]){
    for(let frame=0;frame<3;frame++){
      let i=frame;
      while(i+2<strand.length){
        const codon=strand.slice(i,i+3);
        if(codon==='ATG'){
          let j=i+3;let aa=1;
          while(j+2<strand.length){
            const c=strand.slice(j,j+3);
            if(stops.has(c)){if(aa*3>=minLen)orfs.push({start:i,end:j+2,aa,frame,nt:aa*3});break}
            aa++;j+=3;
          }
        }
        i+=3;
      }
    }
  }
  orfs.sort((a,b)=>b.aa-a.aa);
  return orfs.slice(0,8);
}
function kmerFreq(s,k=3,top=8){
  const m={};
  for(let i=0;i<=s.length-k;i++){const kmer=s.slice(i,i+k);m[kmer]=(m[kmer]||0)+1}
  return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,top).map(([k,v])=>({k,v}));
}
function tmEstimate(s){
  if(s.length<14)return null;
  const a=(s.match(/A/g)||[]).length,t=(s.match(/T/g)||[]).length,g=(s.match(/G/g)||[]).length,c=(s.match(/C/g)||[]).length;
  if(s.length<50)return Math.round(2*(a+t)+4*(g+c));
  return Math.round(64.9+41*(g+c-16.4)/s.length);
}
function seqFacts(raw){
  const s=cleanSeq(raw);
  if(!s)return {error:'empty sequence'};
  let kind='protein';
  if(/^[ACGTN]+$/.test(s))kind='dna';
  else if(/^[ACGU]+$/.test(s))kind='rna';
  const facts={kind,length:s.length,preview:s.slice(0,180)+(s.length>180?'...':'')};
  if(kind==='dna'||kind==='rna'){
    const bases={};
    for(const ch of s)bases[ch]=(bases[ch]||0)+1;
    facts.counts=bases;
    facts.gc_percent=Math.round(((bases.G||0)+(bases.C||0))/s.length*10000)/100;
    facts.at_percent=Math.round(((bases.A||0)+(bases.T||0)+(bases.U||0))/s.length*10000)/100;
    if(kind==='dna'){
      facts.tm_wallace_c=tmEstimate(s);
      facts.reverse_complement_preview=revComp(s).slice(0,120)+(s.length>120?'...':'');
      const orfs=findORFs(s);
      facts.orfs_top=orfs;
      if(orfs[0]){
        const frameSeq=s.slice(orfs[0].start,orfs[0].end+1);
        facts.longest_orf_translation_preview=translate(frameSeq).slice(0,80);
      }
      facts.top_codons=kmerFreq(s,3,8);
    }
  } else {
    const aa={};
    for(const ch of s)aa[ch]=(aa[ch]||0)+1;
    facts.residue_counts=aa;
  }
  return facts;
}
function parseFasta(text){
  const seqs=[];let cur=null;
  for(const line of text.split(/\r?\n/)){
    if(line.startsWith('>')){if(cur)seqs.push(cur);cur={id:line.slice(1).trim(),seq:''}}
    else if(cur)cur.seq+=line.trim();
  }
  if(cur)seqs.push(cur);return seqs;
}
function tableFacts(text,sep){
  const lines=text.split(/\r?\n/).filter(Boolean);
  if(!lines.length)return {rows:0};
  const header=lines[0].split(sep);
  return {rows:Math.max(0,lines.length-1),cols:header.length,header:header.slice(0,30),preview_rows:lines.slice(0,6)};
}
function detectKind(name,text){
  const lower=(name||'').toLowerCase(),head=text.slice(0,2000);
  if(lower.endsWith('.fasta')||lower.endsWith('.fa')||lower.endsWith('.fna')||lower.endsWith('.faa')||head.startsWith('>'))return 'fasta';
  if(lower.endsWith('.fastq')||lower.endsWith('.fq')||head.startsWith('@'))return 'fastq';
  if(lower.endsWith('.vcf')||head.startsWith('##fileformat=VCF'))return 'vcf';
  if(lower.endsWith('.csv'))return 'csv';
  if(lower.endsWith('.tsv')||lower.endsWith('.bed')||lower.endsWith('.gtf')||lower.endsWith('.gff')||lower.endsWith('.gff3'))return 'tsv';
  if(lower.endsWith('.json'))return 'json';
  return 'text';
}
function buildUploadFacts(name,size,type,text,kind){
  const facts={file_name:name,file_size:formatBytes(size),mime:type||'unknown',detected_kind:kind,chars:text.length,truncated:text.length>=MAX_CHARS};
  if(kind==='fasta'){
    const seqs=parseFasta(text);
    facts.num_sequences=seqs.length;
    facts.ids=seqs.slice(0,10).map(s=>s.id);
    if(seqs[0]){
      const s=seqs[0].seq.toUpperCase().replace(/\s+/g,'');
      facts.first_length=s.length;
      facts.first_preview=s.slice(0,120)+(s.length>120?'...':'');
      Object.assign(facts,{first_seq_analysis:seqFacts(s)});
    }
  } else if(kind==='csv')Object.assign(facts,tableFacts(text,','));
  else if(kind==='tsv')Object.assign(facts,tableFacts(text,'\t'));
  else if(kind==='json'){
    try{
      const obj=JSON.parse(text);
      facts.json_type=Array.isArray(obj)?'array':typeof obj;
      if(Array.isArray(obj))facts.json_length=obj.length;
      else if(obj&&typeof obj==='object')facts.json_keys=Object.keys(obj).slice(0,40);
    }catch{facts.json_parse_error=true}
  } else if(kind==='vcf'){
    const lines=text.split(/\r?\n/);
    facts.header_lines=lines.filter(l=>l.startsWith('#')).length;
    facts.variant_lines=lines.filter(l=>l&&!l.startsWith('#')).length;
    facts.sample_variants=lines.filter(l=>l&&!l.startsWith('#')).slice(0,5);
  }
  return facts;
}
function handleFile(file){
  if(file.size>8*1024*1024){els.file_meta.textContent='File too large (max 8 MB).';uploaded=null;return}
  const reader=new FileReader();
  reader.onload=()=>{
    let text=String(reader.result||'');
    if(text.includes('\u0000')){els.file_meta.textContent='Binary file not supported.';uploaded=null;return}
    if(text.length>MAX_CHARS)text=text.slice(0,MAX_CHARS);
    const kind=detectKind(file.name,text);
    const facts=buildUploadFacts(file.name,file.size,file.type,text,kind);
    uploaded={name:file.name,size:file.size,type:file.type,text,kind,facts};
    els.file_meta.textContent=`${file.name} · ${formatBytes(file.size)} · detected as ${kind}`;
    els.facts.textContent=JSON.stringify(facts,null,2);
  };
  reader.readAsText(file);
}

async function callGemini(apiKey,system,user){
  const url=`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
  const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
    system_instruction:{parts:[{text:system}]},
    contents:[{role:'user',parts:[{text:user}]}],
    generationConfig:{temperature:0.2,maxOutputTokens:1800}
  })});
  if(!r.ok)throw new Error(await r.text());
  const data=await r.json();
  return data.candidates?.[0]?.content?.parts?.map(p=>p.text).filter(Boolean).join('')||JSON.stringify(data);
}
async function callOpenAICompatible(baseUrl,apiKey,model,system,user,extraHeaders){
  const headers={'Content-Type':'application/json','Authorization':'Bearer '+apiKey,...(extraHeaders||{})};
  const r=await fetch(baseUrl+'/chat/completions',{method:'POST',headers,body:JSON.stringify({
    model,temperature:0.2,max_tokens:1800,
    messages:[{role:'system',content:system},{role:'user',content:user}]
  })});
  if(!r.ok)throw new Error(await r.text());
  const data=await r.json();
  return data.choices?.[0]?.message?.content||JSON.stringify(data);
}
async function withFallback(prefer,system,user){
  const order=prefer==='gemini'?['gemini','groq','openrouter']:prefer==='groq'?['groq','gemini','openrouter']:['openrouter','gemini','groq'];
  let lastErr=null;
  for(const p of order){
    const key=getKey(p);
    if(!key)continue;
    try{
      if(p==='gemini')return {text:await callGemini(key,system,user),provider:'gemini'};
      if(p==='groq')return {text:await callOpenAICompatible('https://api.groq.com/openai/v1',key,'llama-3.3-70b-versatile',system,user),provider:'groq'};
      return {text:await callOpenAICompatible('https://openrouter.ai/api/v1',key,'meta-llama/llama-3.3-70b-instruct:free',system,user,{'HTTP-Referer':location.origin,'X-Title':'Margots'}),provider:'openrouter'};
    }catch(e){lastErr=e}
  }
  throw lastErr||new Error('No API key set');
}
async function callChatMessages(messages){
  const system=messages.find(m=>m.role==='system')?.content||AGENT_SYSTEM;
  const rest=messages.filter(m=>m.role!=='system');
  const userBlob=rest.map(m=>`${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
  const {text}=await withFallback('gemini',system,userBlob);
  return text;
}

function setSpeaking(on){document.body.classList.toggle('speaking',on);if(on)els.agent_status.textContent='Speaking…'}
function stopSpeech(){if(window.speechSynthesis)window.speechSynthesis.cancel();setSpeaking(false)}
async function speak(text){
  stopSpeech();
  const clean=String(text||'').replace(/\s+/g,' ').trim().slice(0,1800);
  if(!clean||!window.speechSynthesis)return;
  setSpeaking(true);
  const u=new SpeechSynthesisUtterance(clean);u.rate=1.02;
  u.onend=()=>{setSpeaking(false);els.agent_status.textContent='Idle · waiting for your question'};
  u.onerror=()=>setSpeaking(false);
  window.speechSynthesis.speak(u);
}
function addBubble(role,text){
  const div=document.createElement('div');div.className='bubble '+role;
  const who=document.createElement('span');who.className='who';who.textContent=role==='user'?'You':'Agent';
  div.appendChild(who);div.appendChild(document.createTextNode(text));
  els.chat.appendChild(div);els.chat.scrollTop=els.chat.scrollHeight;
}
function agentContextBlock(){
  const parts=[];
  if(lastResult?.facts)parts.push('LAST LOCAL FACTS:\n'+JSON.stringify(lastResult.facts).slice(0,4000));
  if(uploaded)parts.push('UPLOADED FILE: '+uploaded.name+' ('+uploaded.kind+')\n'+JSON.stringify(uploaded.facts).slice(0,3000));
  const seq=els.seq.value.trim();
  if(seq)parts.push('SEQUENCE IN EDITOR:\n'+JSON.stringify(seqFacts(seq)).slice(0,3000));
  return parts.join('\n\n');
}
async function agentSend(){
  const q=els.agent_q.value.trim();
  if(!q)return;
  if(!KEYS.some(k=>getKey(k))){openModal(els.keys_modal);return}
  els.agent_q.value='';
  addBubble('user',q);
  const ctx=agentContextBlock();
  const content=ctx?`CONTEXT DATA\n${ctx}\n\nUSER QUESTION\n${q}`:q;
  agentHistory.push({role:'user',content});
  els.agent_send.disabled=true;document.body.classList.add('working');els.agent_status.textContent='Thinking…';
  try{
    const reply=await callChatMessages(agentHistory);
    agentHistory.push({role:'assistant',content:reply});
    addBubble('agent',reply);
    document.body.classList.remove('working');
    await speak(reply);
  }catch(e){
    addBubble('agent','Error: '+e.message);els.agent_status.textContent='Error';document.body.classList.remove('working');
  }
  els.agent_send.disabled=false;
}
els.agent_send.addEventListener('click',agentSend);
els.agent_q.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();agentSend()}});

function buildPayload(){
  if(mode==='sequence'){
    const seq=els.seq.value.trim();const facts=seqFacts(seq);
    const q=els.seq_q.value.trim()||'What can be reliably said about this sequence?';
    return {facts,user:`Measured facts:\n${JSON.stringify(facts,null,2)}\n\nQuestion: ${q}\n\nSequence (truncated):\n${cleanSeq(seq).slice(0,3500)}`};
  }
  if(mode==='variant')return {facts:{source:'user text only'},user:`Variant description:\n${els.variant.value.trim()}\n\nComment on possible molecular effect and what still needs external database checks.`};
  if(mode==='upload'){
    if(!uploaded)return {facts:{error:'no file'},user:'No file uploaded.'};
    const q=els.upload_q.value.trim()||'Analyze this file and report the strongest defensible findings.';
    return {facts:uploaded.facts,user:`File analysis request.\nQuestion: ${q}\n\nMeasured facts:\n${JSON.stringify(uploaded.facts,null,2)}\n\nFile content (truncated):\n${uploaded.text.slice(0,20000)}`};
  }
  return {facts:{},user:`Context:\n${els.ctx.value.trim()}\n\nQuestion:\n${els.free_q.value.trim()}`};
}

function pushHistory(entry){
  let h=[];
  try{h=JSON.parse(localStorage.getItem(HIST_KEY)||'[]')}catch{}
  h.unshift(entry);h=h.slice(0,20);
  localStorage.setItem(HIST_KEY,JSON.stringify(h));
}

els.run.addEventListener('click',async()=>{
  if(!KEYS.some(k=>getKey(k))){els.status.innerHTML='<span class="err">Add free-tier API keys first.</span>';openModal(els.keys_modal);return}
  if(mode==='upload'&&!uploaded){els.status.innerHTML='<span class="err">Upload a file first.</span>';return}
  const {facts,user}=buildPayload();
  els.facts.textContent=JSON.stringify(facts,null,2);
  els.out_strict.textContent='…';els.out_context.textContent='…';els.out_skeptic.textContent='…';
  els.run.disabled=true;els.status.textContent='Running…';document.body.classList.add('working');
  const out={strict:'',context:'',skeptic:''};
  const jobs=[
    withFallback('gemini',PROMPTS.strict,user).then(r=>{out.strict=r.text;els.out_strict.textContent=`[${r.provider}]\n`+r.text}).catch(e=>{out.strict='Error: '+e.message;els.out_strict.textContent=out.strict}),
    withFallback('groq',PROMPTS.context,user).then(r=>{out.context=r.text;els.out_context.textContent=`[${r.provider}]\n`+r.text}).catch(e=>{out.context='Error: '+e.message;els.out_context.textContent=out.context}),
    withFallback('openrouter',PROMPTS.skeptic,user).then(r=>{out.skeptic=r.text;els.out_skeptic.textContent=`[${r.provider}]\n`+r.text}).catch(e=>{out.skeptic='Error: '+e.message;els.out_skeptic.textContent=out.skeptic})
  ];
  await Promise.all(jobs);
  document.body.classList.remove('working');els.run.disabled=false;els.status.innerHTML='<span class="ok">Done</span>';
  lastResult={ts:Date.now(),mode,facts,answers:out};
  pushHistory({ts:lastResult.ts,mode,preview:JSON.stringify(facts).slice(0,120),answers:out,facts});
});

$('btn_history').onclick=()=>{
  let h=[];try{h=JSON.parse(localStorage.getItem(HIST_KEY)||'[]')}catch{}
  els.hist_list.innerHTML='';
  if(!h.length)els.hist_list.innerHTML='<div class="hist-item">No runs yet.</div>';
  h.forEach((item)=>{
    const d=document.createElement('div');d.className='hist-item';
    d.innerHTML=`<div class="t">${new Date(item.ts).toLocaleString()} · ${item.mode}</div>${(item.preview||'').slice(0,100)}`;
    d.onclick=()=>{
      lastResult=item;
      els.facts.textContent=JSON.stringify(item.facts||{},null,2);
      els.out_strict.textContent=item.answers?.strict||'—';
      els.out_context.textContent=item.answers?.context||'—';
      els.out_skeptic.textContent=item.answers?.skeptic||'—';
      closeModal(els.hist_modal);
    };
    els.hist_list.appendChild(d);
  });
  openModal(els.hist_modal);
};
els.hist_close.onclick=()=>closeModal(els.hist_modal);
els.hist_clear.onclick=()=>{localStorage.removeItem(HIST_KEY);els.hist_list.innerHTML='<div class="hist-item">Cleared.</div>'};

$('btn_export').onclick=()=>openModal(els.export_modal);
els.export_close.onclick=()=>closeModal(els.export_modal);
function download(name,text,mime){
  const blob=new Blob([text],{type:mime});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
els.exp_json.onclick=()=>{
  if(!lastResult){alert('Run something first.');return}
  download('margots-result.json',JSON.stringify(lastResult,null,2),'application/json');
};
els.exp_txt.onclick=()=>{
  if(!lastResult){alert('Run something first.');return}
  const t=`MARGOTS RESULT\n${new Date(lastResult.ts).toISOString()}\nMODE: ${lastResult.mode}\n\nFACTS\n${JSON.stringify(lastResult.facts,null,2)}\n\nSTRICT\n${lastResult.answers.strict}\n\nCONTEXT\n${lastResult.answers.context}\n\nSKEPTIC\n${lastResult.answers.skeptic}\n`;
  download('margots-result.txt',t,'text/plain');
};
els.exp_csv.onclick=()=>{
  if(!lastResult){alert('Run something first.');return}
  const esc=s=>`"${String(s||'').replace(/"/g,'""')}"`;
  const rows=['slot,text',`strict,${esc(lastResult.answers.strict)}`,`context,${esc(lastResult.answers.context)}`,`skeptic,${esc(lastResult.answers.skeptic)}`];
  download('margots-result.csv',rows.join('\n'),'text/csv');
};
$('btn_copy_all').onclick=async()=>{
  const t=[els.out_strict.textContent,els.out_context.textContent,els.out_skeptic.textContent].join('\n\n---\n\n');
  try{await navigator.clipboard.writeText(t);els.status.innerHTML='<span class="ok">Copied</span>'}catch{els.status.innerHTML='<span class="err">Copy failed</span>'}
};

$('btn_share').onclick=async()=>{
  if(!lastResult){alert('Run something first.');return}
  const payload={m:lastResult.mode,f:lastResult.facts,a:lastResult.answers,t:lastResult.ts};
  const b64=btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  const url=location.origin+location.pathname+'#r='+b64;
  try{await navigator.clipboard.writeText(url);els.status.innerHTML='<span class="ok">Share link copied</span>'}catch{prompt('Copy share link:',url)}
};
(function loadShare(){
  const h=location.hash||'';
  if(!h.startsWith('#r='))return;
  try{
    const payload=JSON.parse(decodeURIComponent(escape(atob(h.slice(3)))));
    lastResult={ts:payload.t||Date.now(),mode:payload.m||'sequence',facts:payload.f||{},answers:payload.a||{}};
    els.facts.textContent=JSON.stringify(lastResult.facts,null,2);
    els.out_strict.textContent=lastResult.answers.strict||'—';
    els.out_context.textContent=lastResult.answers.context||'—';
    els.out_skeptic.textContent=lastResult.answers.skeptic||'—';
    els.status.innerHTML='<span class="ok">Loaded shared result</span>';
  }catch{}
})();
