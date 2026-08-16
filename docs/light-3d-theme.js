(() => {
  'use strict';
  const style=document.createElement('style');
  style.id='margots-light-3d';
  style.textContent=`
  :root{--bg:#f4fbff;--panel:rgba(255,255,255,.78);--text:#10243b;--muted:#58708a;--line:rgba(14,116,144,.16);--line-strong:rgba(14,165,233,.34);--cyan:#0284c7;--ok:#059669;--err:#e11d48;--surface:rgba(240,249,255,.82)}
  body{color:var(--text);background:radial-gradient(circle at 50% 28%,rgba(125,211,252,.34),transparent 28%),radial-gradient(circle at 12% 80%,rgba(167,243,208,.24),transparent 24%),linear-gradient(135deg,#f8fdff 0%,#edf8ff 48%,#f8fffd 100%);transition:background .5s,color .5s}
  .dna-bg{opacity:.92;filter:drop-shadow(0 12px 40px rgba(2,132,199,.08))}
  .hud-ring{border-color:rgba(2,132,199,.16);box-shadow:0 0 50px rgba(14,165,233,.05)}
  .dna-stage{opacity:.27;filter:drop-shadow(0 10px 24px rgba(2,132,199,.22))}
  .pair .rung{background:linear-gradient(90deg,#0284c7,#cbd5e1,#06b6d4);box-shadow:0 0 9px rgba(2,132,199,.3)}
  .pair .base.a,.pair .base.c{background:#06b6d4}.pair .base.b,.pair .base.d{background:#0284c7}
  .topbar,.shell{filter:drop-shadow(0 14px 28px rgba(15,23,42,.07))}
  .mark{background:radial-gradient(circle at 30% 30%,#a5f3fc,#0284c7);box-shadow:0 0 20px rgba(14,165,233,.3)}
  .pill,.ghost,.keys-btn{background:rgba(255,255,255,.72);color:#075985;box-shadow:0 7px 20px rgba(15,23,42,.05)}
  .stage{background:rgba(255,255,255,.72);border-color:rgba(14,165,233,.2);box-shadow:0 25px 70px rgba(15,23,42,.1),0 0 45px rgba(14,165,233,.06);transform-style:preserve-3d}
  .stage-top{background:rgba(239,250,255,.78);border-color:rgba(14,165,233,.14)}
  .composer,.answer,.facts,.chat,.hist-item,.drop{background:rgba(255,255,255,.62);border-color:rgba(14,116,144,.15);box-shadow:0 10px 25px rgba(15,23,42,.045)}
  input,textarea,select{background:rgba(255,255,255,.8);color:#10243b;box-shadow:inset 0 1px 4px rgba(15,23,42,.025)}
  .primary{background:linear-gradient(100deg,#06b6d4,#0284c7);color:#fff;box-shadow:0 10px 24px rgba(2,132,199,.25)}
  .answer h3,.agent-status{color:#0369a1}.answer .body{color:#203a54}.facts{color:#29445d}
  .holo-core{background:radial-gradient(circle at 35% 30%,#fff,#a5f3fc 24%,#22d3ee 54%,#0284c7 100%);box-shadow:0 8px 24px rgba(2,132,199,.28),0 0 60px rgba(34,211,238,.2),inset 0 0 18px rgba(255,255,255,.8)}
  .holo-ring{border-color:rgba(2,132,199,.32)}
  .holo-beam{background:linear-gradient(180deg,rgba(14,165,233,.2),transparent)}
  .modal-backdrop{background:rgba(226,242,250,.68)}.modal{background:rgba(255,255,255,.94);color:#10243b;box-shadow:0 25px 80px rgba(15,23,42,.16)}
  #margots-search-panel{background:rgba(255,255,255,.9)!important;color:#123!important;border-color:rgba(2,132,199,.2)!important;box-shadow:0 20px 55px rgba(15,23,42,.12)!important}
  #margots-3d-depth{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
  .m3d-orb{position:absolute;border-radius:50%;filter:blur(1px);background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.95),rgba(56,189,248,.22) 32%,rgba(14,165,233,.05) 65%,transparent 70%);animation:m3float 9s ease-in-out infinite}
  .m3d-orb.o1{width:260px;height:260px;left:4%;top:16%}.m3d-orb.o2{width:340px;height:340px;right:3%;top:48%;animation-delay:-3s}.m3d-orb.o3{width:180px;height:180px;right:25%;top:8%;animation-delay:-6s}
  @keyframes m3float{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-20px,15px)}}
  @media(max-width:700px){.m3d-orb{opacity:.45}.m3d-orb.o2{width:220px;height:220px}}
  @media(prefers-reduced-motion:reduce){.m3d-orb{animation:none}.dna,.hud-ring,.holo-ring{animation:none}}
  `;
  document.head.appendChild(style);
  const depth=document.createElement('div'); depth.id='margots-3d-depth';
  depth.innerHTML='<div class="m3d-orb o1"></div><div class="m3d-orb o2"></div><div class="m3d-orb o3"></div>';
  document.body.prepend(depth);
  const stage=document.querySelector('.stage');
  if(stage && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    window.addEventListener('pointermove',e=>{const x=(e.clientX/innerWidth-.5),y=(e.clientY/innerHeight-.5);stage.style.transform=`perspective(1200px) rotateX(${(-y*2.2).toFixed(2)}deg) rotateY(${(x*3).toFixed(2)}deg)`},{passive:true});
    window.addEventListener('pointerleave',()=>stage.style.transform='');
  }
})();
