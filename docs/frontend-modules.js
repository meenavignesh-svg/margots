(() => {
  'use strict';

  const api = () => window.MargotsAPI;
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function installStyles() {
    if ($('margots-module-styles')) return;
    const s = document.createElement('style');
    s.id = 'margots-module-styles';
    s.textContent = `
      .m-module-results{margin-top:16px;display:grid;gap:10px}
      .m-module-result{padding:14px;border:1px solid #e3eaf3;border-radius:15px;background:#fff}
      .m-module-result h4{margin:0 0 6px;color:#172b4d;font-size:13px}
      .m-module-result p{margin:4px 0;color:#687b96;font-size:11px;line-height:1.55}
      .m-module-result a{color:#246bfd;text-decoration:none;font-weight:700}
      .m-module-row{display:flex;gap:9px;align-items:center;flex-wrap:wrap}
      .m-module-row input,.m-module-row select{flex:1;min-width:180px;border:1px solid #dbe4ef;border-radius:11px;padding:11px;background:#fbfdff;color:#172b4d}
      .m-module-pill{display:inline-flex;padding:5px 8px;border-radius:999px;background:#eef6ff;color:#246bfd;font-size:10px;font-weight:800}
      html[data-margots-theme="dark"] body{background:#0d1422!important;color:#e9f1ff}
      html[data-margots-theme="dark"] .nav,html[data-margots-theme="dark"] .appbar,html[data-margots-theme="dark"] .mode-card,html[data-margots-theme="dark"] .result,html[data-margots-theme="dark"] .m-module-result,html[data-margots-theme="dark"] .drawer{background:#121c2d!important;color:#e9f1ff}
      html[data-margots-theme="dark"] .cap,html[data-margots-theme="dark"] .workspace-preview{background:#121c2d!important;border-color:#273752!important}
      html[data-margots-theme="dark"] .hero,html[data-margots-theme="dark"] .workspace-section{background:#0d1626!important}
      html[data-margots-theme="dark"] .hero-copy,html[data-margots-theme="dark"] .section-head p,html[data-margots-theme="dark"] .cap p,html[data-margots-theme="dark"] .muted{color:#9fb0c8!important}
      html[data-margots-theme="dark"] .field textarea,html[data-margots-theme="dark"] .field input,html[data-margots-theme="dark"] .field select,html[data-margots-theme="dark"] .m-module-row input,html[data-margots-theme="dark"] .m-module-row select{background:#0d1626!important;color:#e9f1ff!important;border-color:#31435f!important}
    `;
    document.head.appendChild(s);
  }

  function openDrawer(title, body) {
    const drawer = $('drawer'), panel = $('panel');
    if (!drawer || !panel) return;
    panel.innerHTML = `<h2>${title}</h2>${body}`;
    drawer.classList.add('open');
  }

  function closeDrawer() { $('drawer')?.classList.remove('open'); }

  function theme() {
    const root = document.documentElement;
    const dark = root.getAttribute('data-margots-theme') !== 'dark';
    root.setAttribute('data-margots-theme', dark ? 'dark' : 'light');
    const button = $('themeBtn');
    if (button) button.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  async function settings() {
    const base = api()?.baseUrl || '(same origin / not configured)';
    openDrawer('MARGOTS settings', `
      <p class="muted">Frontend settings are local to this page. AI provider keys are session-only and are never persisted.</p>
      <div class="m-module-result"><h4>Backend</h4><p><span class="m-module-pill">API</span> ${esc(base)}</p><button class="secondary" id="mHealth">Check live backend</button><p id="mHealthResult" class="muted"></p></div>
      <div class="m-module-result"><h4>Theme</h4><button class="secondary" id="mTheme">Toggle light / dark</button></div>
      <div class="m-module-result"><h4>Session keys</h4><p>Loaded provider keys: ${['openai','anthropic','xai'].filter(p => api()?.hasKey(p)).join(', ') || 'none'}</p><button class="secondary" id="mClearKeys">Clear all session keys</button></div>
      <div class="actions"><button class="secondary" id="mClose">Close</button></div>`);
    $('mClose').onclick=closeDrawer;
    $('mTheme').onclick=theme;
    $('mClearKeys').onclick=()=>{api()?.clearKey();settings()};
    $('mHealth').onclick=async()=>{const out=$('mHealthResult');out.textContent='Checking…';try{const r=await api().health();out.textContent=`✓ Healthy · AI: ${(r.data?.ai_providers||[]).join(', ')||'not configured'} · Search: ${r.data?.search||'unknown'}`}catch(e){out.textContent='✕ '+e.message}};
  }

  function keys() {
    const providers = api()?.providers || {};
    openDrawer('API keys · session only', `
      <p class="muted"><b>Your key never goes to MARGOTS.</b> It stays in JavaScript memory and is sent directly to the selected provider. It is cleared on page lifecycle end/reload.</p>
      <div class="field"><label>PROVIDER</label><select id="mProvider">${Object.entries(providers).map(([k,v])=>`<option value="${k}">${esc(v.label)}</option>`).join('')}</select></div>
      <div class="field"><label>API KEY</label><input id="mKey" type="password" autocomplete="off" placeholder="Paste provider key"></div>
      <div class="field"><label>MODEL (OPTIONAL)</label><input id="mModel" autocomplete="off" placeholder="Provider default"></div>
      <div class="actions"><button class="secondary" id="mClear">Clear</button><button class="primary" id="mUse">Use for this session</button></div>
      <p id="mKeyStatus" class="muted"></p>`);
    const update=()=>{const p=$('mProvider').value;$('mModel').placeholder=providers[p]?.defaultModel||'Provider default';$('mKeyStatus').textContent=api().hasKey(p)?'✓ Key loaded in memory':'No key loaded'};
    $('mProvider').onchange=update;
    $('mUse').onclick=()=>{try{api().setKey($('mProvider').value,$('mKey').value);$('mKey').value='';update()}catch(e){$('mKeyStatus').textContent=e.message}};
    $('mClear').onclick=()=>{api().clearKey($('mProvider').value);update()};
    update();
  }

  async function literature() {
    openDrawer('Literature intelligence', `
      <p class="muted">Searches live scholarly sources through the MARGOTS backend: Europe PMC and OpenAlex. Results are real external records, not placeholders.</p>
      <div class="m-module-row"><input id="mLitQuery" placeholder="e.g. CRISPR off-target detection"><button class="primary" id="mLitSearch">Search literature</button></div>
      <div id="mLitResults" class="m-module-results"></div>`);
    const run=async()=>{const q=$('mLitQuery').value.trim();if(!q)return;$('mLitResults').innerHTML='<p class="muted">Searching live sources…</p>';try{const response=await api().search(q);const results=response.data?.results||[];$('mLitResults').innerHTML=results.length?results.map(r=>`<article class="m-module-result"><h4>${esc(r.title)}</h4><p>${esc(r.source)} · ${esc(r.year)}</p><p>${esc(r.snippet||'')}</p><a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">Open source →</a></article>`).join(''):'<p class="muted">No live results returned.</p>'}catch(e){$('mLitResults').innerHTML='<p class="muted">Search failed: '+esc(e.message)+'</p>'}};
    $('mLitSearch').onclick=run;
    $('mLitQuery').onkeydown=e=>{if(e.key==='Enter')run()};
  }

  async function backendAnalyze(mode) {
    const results=$('results');
    if(!results)return;
    const body={mode};
    if(mode==='sequence'){body.sequence=$('sequence')?.value.trim();body.question=$('sequenceQuestion')?.value.trim()}
    else if(mode==='expression'){body.text=$('tableText')?.value.trim();body.question=$('tableQuestion')?.value.trim()}
    else if(mode==='variant'){body.variant=$('variant')?.value.trim()}
    else {body.context=$('context')?.value.trim();body.question=$('freeQuestion')?.value.trim()}
    results.innerHTML='<div class="result"><h3>Live MARGOTS backend</h3><p class="muted">Calculating + asking the configured trained model…</p></div>';
    try{
      const response=await api().analyze(body);
      const data=response.data||{};
      const facts=data.facts||{};
      const outputs=data.outputs||{};
      let html='<div class="result"><h3>✓ Real backend analysis</h3><div class="facts">'+esc(JSON.stringify(facts,null,2))+'</div></div>';
      for(const [role,text] of Object.entries(outputs)) html+=`<div class="result ai"><h3>✦ ${esc(role)} · trained model</h3><div>${esc(text).replace(/\n/g,'<br>')}</div></div>`;
      if(data.errors&&Object.keys(data.errors).length) html+=`<div class="result error"><h3>Provider warnings</h3><div class="facts">${esc(JSON.stringify(data.errors,null,2))}</div></div>`;
      results.innerHTML=html;
    }catch(e){results.innerHTML='<div class="result error"><h3>Backend request failed</h3><p>'+esc(e.message)+'</p></div>'}
  }

  function captureClicks() {
    document.addEventListener('click', e => {
      const target=e.target.closest('button,a');
      if(!target)return;
      const text=(target.textContent||'').trim().toLowerCase();
      const aria=(target.getAttribute('aria-label')||'').toLowerCase();
      if(target.id==='themeBtn'||aria.includes('theme')){e.preventDefault();e.stopImmediatePropagation();theme();return}
      if(target.id==='keysBtn'||target.id==='mobileKeys'||aria.includes('api key')||text==='api key'||text==='keys'){e.preventDefault();e.stopImmediatePropagation();keys();return}
      if(aria.includes('settings')||text==='settings'){e.preventDefault();e.stopImmediatePropagation();settings();return}
      if(aria.includes('literature')||text==='literature'||text.includes('literature intelligence')){e.preventDefault();e.stopImmediatePropagation();literature();return}
      if(target.matches('[data-run]')){e.preventDefault();e.stopImmediatePropagation();backendAnalyze(target.getAttribute('data-run'));return}
    }, true);
  }

  function boot(){installStyles();captureClicks();window.MARGOTSModules={theme,settings,keys,literature,backendAnalyze};}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
