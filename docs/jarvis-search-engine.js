(() => {
  'use strict';
  // Search-first orchestration. It never claims to have retrieved results it cannot access.
  const panel = document.createElement('div');
  panel.id = 'margots-search-panel';
  panel.innerHTML = `<div class="msp-head"><span>WEB INTELLIGENCE</span><b id="msp-state">READY</b></div><div id="msp-results"></div>`;
  const style = document.createElement('style');
  style.textContent = `#margots-search-panel{position:fixed;left:18px;bottom:18px;width:min(430px,calc(100vw - 36px));z-index:39;padding:12px;border:1px solid rgba(56,189,248,.22);border-radius:16px;background:rgba(3,12,24,.9);backdrop-filter:blur(18px);box-shadow:0 18px 55px rgba(0,0,0,.45);color:#dff7ff;font:12px ui-monospace,monospace}.msp-head{display:flex;justify-content:space-between;color:#67e8f9;letter-spacing:.12em}.msp-head b{font-size:10px;color:#64748b}.msp-card{margin-top:8px;padding:9px;border:1px solid rgba(56,189,248,.12);border-radius:10px}.msp-card a{color:#7dd3fc;text-decoration:none}.msp-card p{margin:4px 0;color:#91a4b8;line-height:1.4}.msp-note{color:#94a3b8;margin-top:8px}.msp-search{color:#a5f3fc}`;
  document.head.appendChild(style); document.body.appendChild(panel);
  const state=document.getElementById('msp-state'), results=document.getElementById('msp-results');
  function setState(s){state.textContent=s}
  function showGoogle(query){
    setState('SEARCH FIRST');
    results.innerHTML=`<div class="msp-card msp-search">Searching the web for: <strong>${escapeHtml(query)}</strong></div><div class="msp-note">Opening the search provider. Margots will only summarize retrieved sources when a web-search connector/API is available.</div>`;
    const url='https://www.google.com/search?q='+encodeURIComponent(query);
    window.open(url,'_blank','noopener,noreferrer');
  }
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  window.MargotsWebSearch={search(query){if(!query||!query.trim())return;showGoogle(query.trim());}};
  // Wire the JARVIS command deck if present.
  document.addEventListener('margots:research',e=>{if(e.detail?.query)window.MargotsWebSearch.search(e.detail.query)});
})();
