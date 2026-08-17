/* Margots production runtime: progressive enhancement, no credentials. */
(()=>{
'use strict';
const $=s=>document.querySelector(s);
function addButton(){
 const actions=$('.actions'); if(!actions||$('#gamesBtn')) return;
 const b=document.createElement('button'); b.className='icon'; b.id='gamesBtn'; b.type='button'; b.textContent='Games';
 b.onclick=()=>window.MargotsOpenGames?.(); actions.insertBefore(b,actions.lastElementChild);
}
function addResearch(){
 const actions=$('.actions'); if(!actions||$('#researchBtn')) return;
 const b=document.createElement('button'); b.className='icon'; b.id='researchBtn'; b.type='button'; b.textContent='Research';
 b.onclick=()=>openResearch(); actions.insertBefore(b,actions.lastElementChild);
}
function drawer(){return {root:$('#drawer'),panel:$('#panel')}}
function openResearch(){
 const d=drawer(); if(!d.root||!d.panel)return;
 d.panel.innerHTML='<h2>Research</h2><p>Search multiple public scientific indexes in parallel. No research API key is embedded in Margots.</p><div class="row"><input id="researchQ" placeholder="e.g. CRISPR off-target detection"></div><div class="row"><button class="secondary" id="researchClose">Close</button><button class="primary" id="researchRun">Search</button></div><div id="researchOut"></div>';
 d.root.classList.add('open'); $('#researchClose').onclick=()=>d.root.classList.remove('open'); $('#researchRun').onclick=runResearch;
}
async function runResearch(){
 const q=$('#researchQ')?.value.trim(), out=$('#researchOut'); if(!q||!out)return;
 out.innerHTML='<p>Searching evidence sources…</p>';
 const base=window.MARGOTS_GATEWAY_URL||'';
 try{
  const r=await fetch(base+'/v1/research/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:q})});
  if(!r.ok)throw Error('Gateway HTTP '+r.status);
  const data=await r.json();
  out.innerHTML='<p><b>'+data.count+'</b> unique evidence records.</p>'+(data.evidence||[]).slice(0,20).map(x=>`<div class="history-item"><b>${esc(x.title)}</b><div style="font-size:11px;color:#6b7280">${esc(x.source)} · ${esc(x.identifier||'no identifier')}</div><a class="source" target="_blank" rel="noopener noreferrer" href="${esc(x.url)}">Open source</a></div>`).join('')+(data.errors?.length?'<p>Some sources were unavailable; successful sources are still shown.</p>':'');
 }catch(e){out.innerHTML='<p>Research gateway is not configured for this deployment yet. Existing keyless browser literature connectors remain available.</p><p style="font-size:12px;color:#6b7280">'+esc(e.message)+'</p>'}
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function init(){addButton();addResearch();}
new MutationObserver(init).observe(document.documentElement,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
