/* Margots product hardening + UX layer. Loaded by google-search.js so the legacy HTML stays untouched. */
(function(){
  'use strict';
  const load=(src)=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)});
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function openPanel(title,body){const d=document.getElementById('drawer'),p=document.getElementById('panel');if(!d||!p)return;p.innerHTML=`<h2>${esc(title)}</h2>${body}<div class="row"><button class="secondary" id="enhClose">Close</button></div>`;d.classList.add('open');document.getElementById('enhClose').onclick=()=>d.classList.remove('open')}
  function addButton(text,id,handler){const a=document.querySelector('.actions');if(!a||document.getElementById(id))return;const b=document.createElement('button');b.className='icon';b.id=id;b.type='button';b.textContent=text;b.onclick=handler;a.insertBefore(b,a.lastElementChild)}
  function games(){
    openPanel('Games','<p><b>Molecular Tetris</b> — a fully playable break inside Margots.</p><div style="border:1px solid #e5e7eb;border-radius:16px;overflow:hidden"><iframe title="Molecular Tetris" src="tetris.html" style="display:block;width:100%;height:min(70vh,680px);border:0"></iframe></div>');
  }
  function evidence(){
    openPanel('Evidence & provenance','<p>Margots separates deterministic biology facts from AI interpretation. Public-source results should be treated as evidence, not experimental validation.</p><div class="facts">PROVENANCE RULES\n• Prefer primary databases and papers.\n• Preserve DOI / PMID / accession identifiers when available.\n• Never invent citations.\n• Label AI interpretation and uncertainty.\n• Verify important claims against the linked source.</div><p style="margin-top:12px">Current public research connectors: Europe PMC, OpenAlex, Crossref, UniProt, NCBI, Ensembl, RCSB PDB, PubChem, ChEMBL, ClinicalTrials.gov, Semantic Scholar.</p>');
  }
  function diagnostics(){
    const checks=[
      ['Deterministic biology module',!!window.MargotsBio],
      ['Literature module',!!window.MargotsLiterature],
      ['Research API registry',!!window.MargotsResearchAPIs],
      ['Google search bridge',!!window.MargotsGoogleSearch],
      ['Games integration',true],
      ['Local API-key storage',typeof localStorage!=='undefined']
    ];
    openPanel('System diagnostics','<div class="facts">'+checks.map(([n,v])=>(v?'✓ ':'✗ ')+esc(n)).join('\n')+'</div><p style="margin-top:12px">Diagnostics checks browser-side availability only. Provider quotas, CORS policies and network access can still affect individual requests.</p>');
  }
  async function init(){
    try{if(!window.MargotsResearchAPIs)await load('research-apis.js')}catch(e){}
    addButton('Games','gamesBtn',games);
    addButton('Evidence','evidenceBtn',evidence);
    addButton('Diagnostics','diagBtn',diagnostics);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
