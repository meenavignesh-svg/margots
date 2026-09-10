(() => {
  'use strict';

  const api = () => window.MargotsAPI;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const styles = `
    .msp-shell{max-width:1320px;margin:0 auto;padding:24px clamp(16px,3vw,34px) 70px}
    .msp-top{display:flex;align-items:center;gap:14px;margin-bottom:20px;position:sticky;top:70px;z-index:18;padding:10px 0;background:linear-gradient(#f1f7fd 75%,transparent)}
    .msp-brand{font-weight:900;letter-spacing:.05em;color:#172b4d}.msp-live{display:inline-flex;align-items:center;gap:7px;padding:7px 10px;border-radius:999px;background:#e8faf5;color:#128b76;font-size:10px;font-weight:850}.msp-live:before{content:"";width:7px;height:7px;border-radius:50%;background:#20b994}
    .msp-nav{margin-left:auto;display:flex;gap:6px;flex-wrap:wrap}.msp-nav a{padding:8px 11px;border-radius:10px;color:#61738e;text-decoration:none;font-size:10px;font-weight:800}.msp-nav a:hover{background:#e8f1ff;color:#246bfd}
    .msp-grid{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(290px,.55fr);gap:18px;align-items:start}
    .msp-card{background:#fff;border:1px solid #e1e9f3;border-radius:22px;padding:20px;box-shadow:0 12px 36px rgba(37,72,120,.055);scroll-margin-top:135px}
    .msp-card+.msp-card{margin-top:18px}.msp-card h2{margin:0 0 5px;font-size:18px;letter-spacing:-.03em}.msp-card>p{margin:0 0 17px;color:#70829b;font-size:11px;line-height:1.6}
    .msp-modebar{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:15px}.msp-mode{border:1px solid #dbe5f0;background:#f9fbfe;color:#60728c;border-radius:11px;padding:9px 12px;font-size:10px;font-weight:850}.msp-mode.active{background:#eaf2ff;border-color:#bcd3fb;color:#1d63df}
    .msp-field{display:grid;gap:6px;margin:12px 0}.msp-field label{font-size:10px;font-weight:850;color:#526781}.msp-field textarea,.msp-field input,.msp-field select{width:100%;border:1px solid #dbe4ef;background:#fcfdff;border-radius:11px;padding:11px;color:#172b4d;outline:none}.msp-field textarea{min-height:118px;resize:vertical}.msp-field textarea:focus,.msp-field input:focus,.msp-field select:focus{border-color:#75a8ff;box-shadow:0 0 0 4px #3478ff12}
    .msp-actions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;margin-top:14px}.msp-primary,.msp-secondary{border-radius:11px;padding:10px 14px;font-weight:850;font-size:10px}.msp-primary{border:0;color:#fff;background:linear-gradient(100deg,#1688ff,#7251ff);box-shadow:0 10px 24px rgba(72,92,255,.18)}.msp-secondary{border:1px solid #d8e2ee;background:#fff;color:#425977}
    .msp-result{margin-top:14px;border:1px solid #e2e9f2;border-radius:16px;padding:14px;background:#fff}.msp-result h3{font-size:12px;margin:0 0 8px}.msp-facts{white-space:pre-wrap;font:10px/1.6 ui-monospace,SFMono-Regular,Consolas,monospace;background:#f7faff;border:1px solid #edf2f8;border-radius:11px;padding:11px;overflow:auto}.msp-ai{border-left:4px solid #7065ee;line-height:1.65;font-size:11px}.msp-error{border-color:#ffd1d1;background:#fff8f8}.msp-muted{color:#7587a0;font-size:10px}
    .msp-side{position:sticky;top:128px}.msp-stat{display:grid;grid-template-columns:1fr 1fr;gap:9px}.msp-mini{border:1px solid #e2e9f2;border-radius:14px;padding:12px;background:linear-gradient(145deg,#fff,#f9fbff)}.msp-mini small{display:block;color:#8a9ab0;font-size:9px}.msp-mini strong{display:block;font-size:18px;margin-top:4px}.msp-stack{display:grid;gap:10px}.msp-status{padding:12px;border-radius:14px;background:#f4fcf9;border:1px solid #dcefe9;color:#55746d;font-size:10px;line-height:1.55}.msp-status b{color:#138b78}.msp-sticky-card{margin-top:18px}.msp-searchrow{display:flex;gap:8px}.msp-searchrow input{flex:1;min-width:0;border:1px solid #dbe4ef;border-radius:11px;padding:11px;background:#fcfdff}.msp-paper{padding:12px;border:1px solid #e2e9f2;border-radius:13px;background:#fff}.msp-paper h4{font-size:11px;margin:0 0 5px}.msp-paper p{font-size:9px;color:#7587a0;line-height:1.5;margin:3px 0}.msp-paper a{font-size:9px;color:#246bfd;font-weight:800;text-decoration:none}
    .msp-keyrow{display:flex;gap:8px;align-items:center}.msp-keyrow input{flex:1}.msp-keydot{width:8px;height:8px;border-radius:50%;background:#c3cedc}.msp-keydot.on{background:#20b994;box-shadow:0 0 0 4px #20b9941c}.msp-chat{display:grid;gap:9px;max-height:390px;overflow:auto;margin:12px 0}.msp-msg{padding:10px 12px;border-radius:13px;background:#f5f8fc;font-size:10px;line-height:1.6}.msp-msg.user{background:#eaf2ff;color:#234f91}.msp-msg.ai{background:#f5f2ff;color:#423b72}
    @media(max-width:900px){.msp-grid{grid-template-columns:1fr}.msp-side{position:static}.msp-top{top:60px}.msp-nav{display:none}}
    html[data-margots-theme="dark"] .msp-card,html[data-margots-theme="dark"] .msp-mini,html[data-margots-theme="dark"] .msp-paper,html[data-margots-theme="dark"] .msp-result{background:#121c2d!important;border-color:#273752!important;color:#e9f1ff}html[data-margots-theme="dark"] .msp-field textarea,html[data-margots-theme="dark"] .msp-field input,html[data-margots-theme="dark"] .msp-field select,html[data-margots-theme="dark"] .msp-searchrow input{background:#0d1626!important;color:#e9f1ff!important;border-color:#31435f!important}html[data-margots-theme="dark"] .msp-top{background:linear-gradient(#0d1626 75%,transparent)}
  `;

  function addStyles(){if(document.getElementById('msp-styles'))return;const s=document.createElement('style');s.id='msp-styles';s.textContent=styles;document.head.appendChild(s)}

  function render(){
    const host=document.querySelector('.workspace-app');
    if(!host || document.getElementById('msp-shell'))return;
    host.innerHTML=`<div id="msp-shell" class="msp-shell">
      <div class="msp-top"><div class="msp-brand">MARGOTS WORKSPACE</div><span class="msp-live" id="mspLive">Checking backend…</span><nav class="msp-nav"><a href="#msp-analyze">Analyze</a><a href="#msp-literature">Literature</a><a href="#msp-ai">AI Lab</a><a href="#msp-session">Session</a></nav></div>
      <div class="msp-grid">
        <main>
          <section class="msp-card" id="msp-analyze"><h2>Bioinformatics analysis</h2><p>Run deterministic calculations and receive server-side AI interpretation without leaving this page.</p>
            <div class="msp-modebar"><button class="msp-mode active" data-msp-mode="sequence">DNA / RNA</button><button class="msp-mode" data-msp-mode="variant">Variant</button><button class="msp-mode" data-msp-mode="expression">Expression table</button><button class="msp-mode" data-msp-mode="free">Free analysis</button></div>
            <div id="msp-panel-sequence"><div class="msp-field"><label>SEQUENCE</label><textarea id="msp-sequence" placeholder="Paste DNA or RNA sequence…"></textarea></div><div class="msp-field"><label>QUESTION (OPTIONAL)</label><input id="msp-sequence-q" placeholder="What should MARGOTS focus on?"></div></div>
            <div id="msp-panel-variant" hidden><div class="msp-field"><label>VARIANT</label><textarea id="msp-variant" placeholder="e.g. TP53 p.R175H, genomic context, or variant description…"></textarea></div></div>
            <div id="msp-panel-expression" hidden><div class="msp-field"><label>CSV / TSV DATA</label><textarea id="msp-table" placeholder="gene,condition_a,condition_b&#10;TP53,12,18&#10;BRCA1,4,9"></textarea></div><div class="msp-field"><label>QUESTION</label><input id="msp-table-q" placeholder="What pattern should be examined?"></div></div>
            <div id="msp-panel-free" hidden><div class="msp-field"><label>CONTEXT / DATA</label><textarea id="msp-context" placeholder="Paste the biological context, observations, or data…"></textarea></div><div class="msp-field"><label>QUESTION</label><input id="msp-free-q" placeholder="Ask a specific scientific question…"></div></div>
            <div class="msp-actions"><button class="msp-secondary" id="mspExample">Load example</button><button class="msp-primary" id="mspRun">Run MARGOTS analysis</button></div>
            <div id="msp-analysis-results"><p class="msp-muted">Results will appear here.</p></div>
          </section>

          <section class="msp-card" id="msp-literature"><h2>Literature intelligence</h2><p>Search live scholarly records from Europe PMC and OpenAlex. Results open directly at the source.</p>
            <div class="msp-searchrow"><input id="msp-lit-q" placeholder="e.g. CRISPR off-target detection"><button class="msp-primary" id="mspLitRun">Search</button></div><div id="msp-lit-results" class="msp-stack" style="margin-top:12px"></div>
          </section>

          <section class="msp-card" id="msp-ai"><h2>AI Lab</h2><p>Ask the configured MARGOTS server AI about a biological problem. The server key remains server-side.</p><div id="msp-chat" class="msp-chat"></div><div class="msp-field"><label>QUESTION</label><textarea id="msp-chat-q" style="min-height:80px" placeholder="Ask MARGOTS…"></textarea></div><div class="msp-actions"><button class="msp-primary" id="mspChatSend">Ask MARGOTS</button></div></section>
        </main>

        <aside class="msp-side">
          <section class="msp-card"><h2>Live status</h2><p>Everything stays inside this workspace.</p><div class="msp-stat"><div class="msp-mini"><small>Backend</small><strong id="mspBackend">—</strong></div><div class="msp-mini"><small>Search</small><strong>LIVE</strong></div></div><div class="msp-status" id="mspStatus" style="margin-top:10px">Checking…</div></section>
          <section class="msp-card msp-sticky-card" id="msp-session"><h2>Session & keys</h2><p>Provider keys are memory-only. They are never saved to browser storage.</p><div class="msp-keyrow"><span class="msp-keydot" id="mspKeyDot"></span><span class="msp-muted" id="mspKeyStatus">No session key loaded</span></div><div class="msp-field"><label>PROVIDER</label><select id="msp-provider"><option value="openai">OpenAI</option><option value="anthropic">Anthropic</option><option value="xai">xAI</option></select></div><div class="msp-field"><label>SESSION API KEY</label><input id="msp-key" type="password" autocomplete="off" placeholder="Paste key for this session"></div><div class="msp-field"><label>MODEL (OPTIONAL)</label><input id="msp-model" autocomplete="off" placeholder="Provider default"></div><div class="msp-actions"><button class="msp-secondary" id="mspClearKey">Clear</button><button class="msp-primary" id="mspUseKey">Use for session</button></div></section>
        </aside>
      </div>
    </div>`;
    bind();
    checkHealth();
  }

  function currentMode(){return document.querySelector('.msp-mode.active')?.dataset.mspMode||'sequence'}
  function setMode(mode){document.querySelectorAll('[data-msp-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mspMode===mode));['sequence','variant','expression','free'].forEach(x=>{const p=document.getElementById('msp-panel-'+x);if(p)p.hidden=x!==mode})}

  function bind(){
    document.querySelectorAll('[data-msp-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mspMode)));
    document.getElementById('mspRun').onclick=runAnalysis;
    document.getElementById('mspExample').onclick=()=>{setMode('sequence');document.getElementById('msp-sequence').value='ATGCGATCGATCGATCGATCGATCGATCGATCGATCGATCGTAA';document.getElementById('msp-sequence-q').value='Summarize composition, ORFs, and anything unusual.'};
    document.getElementById('mspLitRun').onclick=runLiterature;
    document.getElementById('msp-lit-q').onkeydown=e=>{if(e.key==='Enter')runLiterature()};
    document.getElementById('mspChatSend').onclick=sendChat;
    document.getElementById('msp-chat-q').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChat()}};
    document.getElementById('mspUseKey').onclick=useKey;
    document.getElementById('mspClearKey').onclick=()=>{api()?.clearKey(document.getElementById('msp-provider').value);updateKeyStatus()};
    document.getElementById('msp-provider').onchange=updateKeyStatus;
    updateKeyStatus();
  }

  async function checkHealth(){
    try{const r=await api().health();const names=r.data?.ai_providers||[];document.getElementById('mspBackend').textContent='ONLINE';document.getElementById('mspLive').textContent='Backend online';document.getElementById('mspStatus').innerHTML='<b>Connected.</b> AI: '+esc(names.join(', ')||'not configured')+' · Search: '+esc(r.data?.search||'available')}catch(e){document.getElementById('mspBackend').textContent='OFFLINE';document.getElementById('mspLive').textContent='Backend unavailable';document.getElementById('mspStatus').textContent=e.message}}

  async function runAnalysis(){
    const mode=currentMode();let body={mode};
    if(mode==='sequence'){body.sequence=document.getElementById('msp-sequence').value.trim();body.question=document.getElementById('msp-sequence-q').value.trim()}
    if(mode==='variant')body.variant=document.getElementById('msp-variant').value.trim();
    if(mode==='expression'){body.text=document.getElementById('msp-table').value.trim();body.format='csv';body.question=document.getElementById('msp-table-q').value.trim()}
    if(mode==='free'){body.context=document.getElementById('msp-context').value.trim();body.question=document.getElementById('msp-free-q').value.trim()}
    const out=document.getElementById('msp-analysis-results');out.innerHTML='<div class="msp-result"><h3>Running live MARGOTS analysis…</h3><p class="msp-muted">Calculating deterministic facts and requesting server AI.</p></div>';
    try{const r=await api().analyze(body);const d=r.data||{};let html='<div class="msp-result"><h3>✓ Analysis complete</h3><div class="msp-facts">'+esc(JSON.stringify(d.facts||{},null,2))+'</div></div>';for(const [role,text] of Object.entries(d.outputs||{}))html+='<div class="msp-result msp-ai"><h3>✦ '+esc(role)+'</h3><div>'+esc(text).replace(/\n/g,'<br>')+'</div></div>';if(d.errors&&Object.keys(d.errors).length)html+='<div class="msp-result msp-error"><h3>Provider warnings</h3><div class="msp-facts">'+esc(JSON.stringify(d.errors,null,2))+'</div></div>';out.innerHTML=html}catch(e){out.innerHTML='<div class="msp-result msp-error"><h3>Analysis failed</h3><p>'+esc(e.message)+'</p></div>'}
  }

  async function runLiterature(){
    const q=document.getElementById('msp-lit-q').value.trim(),out=document.getElementById('msp-lit-results');if(!q)return;out.innerHTML='<p class="msp-muted">Searching live scholarly sources…</p>';
    try{const r=await api().search(q);const rows=r.data?.results||[];out.innerHTML=rows.length?rows.map(x=>'<article class="msp-paper"><h4>'+esc(x.title)+'</h4><p>'+esc(x.source)+' · '+esc(x.year)+'</p><p>'+esc(x.snippet||'')+'</p><a href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">Open source →</a></article>').join(''):'<p class="msp-muted">No results returned.</p>'}catch(e){out.innerHTML='<p class="msp-muted">Search failed: '+esc(e.message)+'</p>'}
  }

  async function sendChat(){
    const q=document.getElementById('msp-chat-q').value.trim();if(!q)return;const chat=document.getElementById('msp-chat');chat.insertAdjacentHTML('beforeend','<div class="msp-msg user">'+esc(q)+'</div>');document.getElementById('msp-chat-q').value='';chat.insertAdjacentHTML('beforeend','<div class="msp-msg ai" id="msp-thinking">Thinking…</div>');chat.scrollTop=chat.scrollHeight;
    try{const r=await api().ask(q);document.getElementById('msp-thinking')?.remove();const outputs=r.data?.outputs||{};const text=Object.values(outputs)[0]||'No AI response returned.';chat.insertAdjacentHTML('beforeend','<div class="msp-msg ai">'+esc(text).replace(/\n/g,'<br>')+'</div>')}catch(e){document.getElementById('msp-thinking')?.remove();chat.insertAdjacentHTML('beforeend','<div class="msp-msg ai">'+esc(e.message)+'</div>')}chat.scrollTop=chat.scrollHeight;
  }

  function updateKeyStatus(){const p=document.getElementById('msp-provider').value,loaded=api()?.hasKey(p);document.getElementById('mspKeyDot').classList.toggle('on',loaded);document.getElementById('mspKeyStatus').textContent=loaded?'Key loaded in memory only':'No session key loaded'}
  function useKey(){try{const p=document.getElementById('msp-provider').value,k=document.getElementById('msp-key').value.trim();api().setKey(p,k);document.getElementById('msp-key').value='';updateKeyStatus()}catch(e){document.getElementById('mspKeyStatus').textContent=e.message}}

  function mount(){addStyles();const start=document.querySelector('.start');const open=()=>{document.querySelector('.landing')?.classList.add('hide');document.querySelector('.workspace-app')?.classList.add('show');render();window.scrollTo({top:0,behavior:'smooth'})};if(start&&!start.dataset.mspBound){start.dataset.mspBound='1';start.addEventListener('click',open)};if(document.querySelector('.workspace-app.show'))render()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
