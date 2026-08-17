// Margots Games panel: embeds the playable Tetris game without leaving the app.
(function(){
  'use strict';
  function openGames(){
    let drawer=document.getElementById('drawer'), panel=document.getElementById('panel');
    if(!drawer||!panel)return;
    panel.innerHTML='<h2>Games</h2><p>Take a short break. Molecular Tetris is fully playable.</p><div style="border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;background:#fff"><iframe title="Margots Tetris" src="tetris.html" style="display:block;width:100%;height:min(72vh,720px);border:0" loading="lazy"></iframe></div><div style="display:flex;gap:8px;margin-top:12px"><button class="primary" id="closeGame">Close</button><button class="secondary" id="openGameTab">Open full game</button></div>';
    drawer.classList.add('open');
    document.getElementById('closeGame').onclick=()=>drawer.classList.remove('open');
    document.getElementById('openGameTab').onclick=()=>window.open('tetris.html','_blank','noopener');
  }
  window.MargotsOpenGames=openGames;
  document.addEventListener('DOMContentLoaded',function(){
    const actions=document.querySelector('.actions');
    if(!actions || document.getElementById('gamesBtn'))return;
    const b=document.createElement('button'); b.className='icon'; b.id='gamesBtn'; b.type='button'; b.textContent='Games';
    b.title='Open games'; b.onclick=openGames;
    actions.insertBefore(b,actions.lastElementChild);
  });
})();
