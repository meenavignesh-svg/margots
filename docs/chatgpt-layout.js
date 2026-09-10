(() => {
  'use strict';
  const ready = (fn) => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, {once:true}) : fn();

  ready(() => {
    const host = document.querySelector('#mx-shell');
    if (!host || document.querySelector('#cg-sidebar')) return;

    const sidebar = document.createElement('aside');
    sidebar.id = 'cg-sidebar';
    sidebar.innerHTML = `
      <div class="cg-brand"><img src="icon.svg?v=2" alt="MARGOTS"><div><strong>MARGOTS</strong><small>Bioinformatics Intelligence</small></div></div>
      <button class="cg-new" data-cg-action="new"><span>＋</span> New chat</button>
      <nav class="cg-nav" aria-label="MARGOTS workspace">
        <button data-cg-target="mx-analyze" data-cg-mode="sequence"><span>🧬</span> DNA / RNA Analysis</button>
        <button data-cg-target="mx-analyze" data-cg-mode="variant"><span>✣</span> Variant Analysis</button>
        <button data-cg-target="mx-analyze" data-cg-mode="expression"><span>▥</span> Expression Analysis</button>
        <button data-cg-target="mx-analyze" data-cg-mode="free"><span>⌬</span> Research Question</button>
        <button data-cg-target="mx-literature"><span>▤</span> Literature Search</button>
        <button data-cg-target="mx-ai"><span>✦</span> AI Lab</button>
      </nav>
      <div class="cg-divider"></div>
      <nav class="cg-nav cg-secondary">
        <button data-cg-target="mx-ai"><span>◌</span> Saved chats</button>
        <button data-cg-target="mx-analyze"><span>□</span> Projects</button>
        <button data-cg-target="mx-session"><span>⚙</span> Settings</button>
      </nav>
      <div class="cg-spacer"></div>
      <div class="cg-backend"><i></i><div><b>Backend online</b><small>Render · AI services</small></div></div>
      <div class="cg-profile"><img src="icon.svg?v=2" alt=""><div><b>MARGOTS user</b><small>Research workspace</small></div><span>⌄</span></div>
    `;

    const top = document.createElement('header');
    top.id = 'cg-topbar';
    top.innerHTML = `
      <button class="cg-mobile" aria-label="Open navigation">☰</button>
      <div class="cg-search"><span>⌕</span><input id="cgSearch" placeholder="Search MARGOTS…" autocomplete="off"><kbd>Ctrl K</kbd></div>
      <div class="cg-top-actions"><span class="cg-online"><i></i> Backend Online</span><button data-cg-target="mx-session">⚙</button><button aria-label="Theme">☾</button></div>
    `;

    host.prepend(top);
    host.prepend(sidebar);

    const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({behavior:'smooth', block:'start'});
    const setMode = (m) => {
      const button = document.querySelector(`.mx-mode[data-mode="${m}"]`);
      if (button) button.click();
    };

    sidebar.querySelectorAll('[data-cg-target]').forEach(btn => btn.addEventListener('click', () => {
      if (btn.dataset.cgMode) setMode(btn.dataset.cgMode);
      scrollTo(btn.dataset.cgTarget);
      sidebar.classList.remove('open');
    }));
    top.querySelectorAll('[data-cg-target]').forEach(btn => btn.addEventListener('click', () => scrollTo(btn.dataset.cgTarget)));

    sidebar.querySelector('[data-cg-action="new"]').addEventListener('click', () => {
      ['mxSeq','mxVar','mxTable','mxContext','mxSeqQ','mxTableQ','mxFreeQ','mxLitQ','mxChatQ'].forEach(id => { const e=document.getElementById(id); if(e) e.value=''; });
      const r=document.getElementById('mxResults'); if(r) r.innerHTML='<p class="mx-muted">New research session. Add biological data or a question to begin.</p>';
      const c=document.getElementById('mxChat'); if(c) c.innerHTML='';
      setMode('sequence');
      scrollTo('mx-analyze');
    });

    const search = document.getElementById('cgSearch');
    search?.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      const q = search.value.trim().toLowerCase();
      if (!q) return;
      const routes = [['dna','mx-analyze','sequence'],['rna','mx-analyze','sequence'],['sequence','mx-analyze','sequence'],['variant','mx-analyze','variant'],['expression','mx-analyze','expression'],['research','mx-analyze','free'],['literature','mx-literature'],['paper','mx-literature'],['ai','mx-ai'],['chat','mx-ai'],['settings','mx-session']];
      const hit = routes.find(([term]) => q.includes(term));
      if (hit) { if(hit[2]) setMode(hit[2]); scrollTo(hit[1]); } else scrollTo('mx-ai');
    });

    top.querySelector('.cg-mobile')?.addEventListener('click', () => sidebar.classList.toggle('open'));
  });
})();
