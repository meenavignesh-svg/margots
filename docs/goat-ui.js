(() => {
  'use strict';
  const style = document.createElement('style');
  style.textContent = `
    :root{--goat-cyan:#22d3ee;--goat-blue:#3b82f6;--goat-violet:#8b5cf6;--goat-glow:rgba(34,211,238,.28)}
    body{background-color:#020611;perspective:1200px}
    body::before{content:"";position:fixed;inset:-20%;z-index:-3;pointer-events:none;background:radial-gradient(circle at 18% 20%,rgba(34,211,238,.12),transparent 28%),radial-gradient(circle at 82% 72%,rgba(139,92,246,.10),transparent 30%);animation:goatAmbient 14s ease-in-out infinite alternate}
    .goat-grid{position:fixed;inset:0;z-index:-2;pointer-events:none;opacity:.22;background-image:linear-gradient(rgba(56,189,248,.10) 1px,transparent 1px),linear-gradient(90deg,rgba(56,189,248,.10) 1px,transparent 1px);background-size:48px 48px;transform:perspective(500px) rotateX(62deg) scale(1.8);transform-origin:50% 100%;mask-image:linear-gradient(to top,black,transparent 78%);animation:goatGrid 16s linear infinite}
    .goat-orb{position:fixed;width:8px;height:8px;border-radius:50%;background:var(--goat-cyan);box-shadow:0 0 12px var(--goat-cyan),0 0 32px rgba(34,211,238,.55);pointer-events:none;z-index:-1;animation:goatFloat var(--d,9s) ease-in-out infinite;opacity:.55}
    .topbar,.shell{transform-style:preserve-3d}
    .topbar{transition:transform .18s ease-out}
    .hero{position:relative;transform-style:preserve-3d}
    .hero h1{position:relative;transform:translateZ(34px);text-shadow:0 0 18px rgba(34,211,238,.3),0 0 55px rgba(59,130,246,.18)}
    .hero p{transform:translateZ(18px)}
    .stage{position:relative;transform-style:preserve-3d;transition:transform .18s ease-out,box-shadow .25s ease;box-shadow:0 24px 70px rgba(0,0,0,.38),0 0 55px rgba(34,211,238,.07)}
    .stage::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(115deg,rgba(255,255,255,.08),transparent 22%,transparent 72%,rgba(34,211,238,.06));mix-blend-mode:screen}
    .stage::after{content:"";position:absolute;inset:-1px;border-radius:inherit;pointer-events:none;border:1px solid rgba(103,232,249,.10);box-shadow:inset 0 0 45px rgba(34,211,238,.035)}
    .composer,.answer,.facts,.chat,.drop{transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease;background-image:linear-gradient(135deg,rgba(255,255,255,.035),transparent 35%)}
    .composer:hover,.answer:hover,.facts:hover,.chat:hover,.drop:hover{transform:translateY(-2px) translateZ(8px);border-color:rgba(103,232,249,.36);box-shadow:0 14px 38px rgba(0,0,0,.24),0 0 26px rgba(34,211,238,.06)}
    .tab,.ghost,.keys-btn,.primary,.chip,.btn-primary,.btn-secondary{transition:transform .16s ease,box-shadow .16s ease,filter .16s ease}
    .tab:hover,.ghost:hover,.keys-btn:hover,.primary:hover,.chip:hover,.btn-primary:hover,.btn-secondary:hover{transform:translateY(-2px);filter:brightness(1.08)}
    .primary:hover{box-shadow:0 0 24px rgba(34,211,238,.48),0 8px 22px rgba(0,0,0,.25)}
    .hero::after{content:"MARGOTS // BIOINTELLIGENCE";display:block;margin:13px auto 0;width:max-content;max-width:100%;padding:4px 10px;border:1px solid rgba(56,189,248,.16);border-radius:999px;color:rgba(125,211,252,.55);font:600 9px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.18em;transform:translateZ(20px);background:rgba(2,8,16,.35)}
    .stage-top{position:relative;overflow:hidden}
    .stage-top::after{content:"";position:absolute;left:-20%;top:0;width:28%;height:100%;background:linear-gradient(90deg,transparent,rgba(103,232,249,.12),transparent);transform:skewX(-20deg);animation:goatSweep 5.5s linear infinite}
    .dna-stage{filter:drop-shadow(0 0 18px rgba(34,211,238,.28)) drop-shadow(0 0 60px rgba(59,130,246,.08));transform:translate(-50%,-50%) rotateX(5deg)}
    .hud-ring{box-shadow:0 0 20px rgba(34,211,238,.035)}
    .holo{transform-style:preserve-3d;animation:goatHoloFloat 4.5s ease-in-out infinite}
    .holo-core{box-shadow:0 0 22px rgba(34,211,238,.65),0 0 70px rgba(59,130,246,.25),inset 0 0 20px rgba(255,255,255,.42);}
    .holo-ring.a{transform:rotateX(66deg) rotateZ(0deg);animation:goatOrbitA 7s linear infinite}
    .holo-ring.b{transform:rotateX(66deg) rotateZ(55deg);animation:goatOrbitB 10s linear infinite}
    .holo-ring.c{transform:rotateX(66deg) rotateZ(110deg);animation:goatOrbitC 15s linear infinite}
    .wave span{box-shadow:0 0 8px rgba(103,232,249,.5)}
    body.working .stage{box-shadow:0 24px 80px rgba(0,0,0,.42),0 0 75px rgba(34,211,238,.14)}
    body.working .stage::before{animation:goatPulse 1.4s ease-in-out infinite}
    body.working .hero h1{animation:goatTitlePulse 1.5s ease-in-out infinite}
    @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.001ms!important}.goat-grid{display:none}}
    @keyframes goatAmbient{from{transform:translate3d(-1%,0,0) scale(1)}to{transform:translate3d(1%,-1%,0) scale(1.04)}}
    @keyframes goatGrid{from{background-position:0 0}to{background-position:48px 48px}}
    @keyframes goatFloat{0%,100%{transform:translate3d(0,0,0) scale(.7);opacity:.2}50%{transform:translate3d(var(--x,30px),var(--y,-70px),0) scale(1.2);opacity:.7}}
    @keyframes goatSweep{from{left:-30%}to{left:120%}}
    @keyframes goatHoloFloat{0%,100%{transform:translateY(0) rotateX(0)}50%{transform:translateY(-6px) rotateX(3deg)}}
    @keyframes goatOrbitA{to{transform:rotateX(66deg) rotateZ(360deg)}}
    @keyframes goatOrbitB{to{transform:rotateX(66deg) rotateZ(-305deg)}}
    @keyframes goatOrbitC{to{transform:rotateX(66deg) rotateZ(360deg)}}
    @keyframes goatPulse{0%,100%{opacity:.4}50%{opacity:.95}}
    @keyframes goatTitlePulse{0%,100%{filter:brightness(1)}50%{filter:brightness(1.18)}}
  `;
  document.head.appendChild(style);

  const grid=document.createElement('div');grid.className='goat-grid';document.body.appendChild(grid);
  const frag=document.createDocumentFragment();
  for(let i=0;i<22;i++){
    const o=document.createElement('span');o.className='goat-orb';
    o.style.left=(4+Math.random()*92)+'%';o.style.top=(8+Math.random()*86)+'%';
    o.style.setProperty('--d',(7+Math.random()*9)+'s');
    o.style.setProperty('--x',(-35+Math.random()*70)+'px');
    o.style.setProperty('--y',(-45-Math.random()*80)+'px');
    o.style.animationDelay=(-Math.random()*12)+'s';frag.appendChild(o);
  }
  document.body.appendChild(frag);

  const finePointer=matchMedia('(pointer:fine)');
  const stage=document.querySelector('.stage');
  const topbar=document.querySelector('.topbar');
  let raf=0,px=0,py=0;
  function tilt(){
    raf=0;
    if(!finePointer.matches||window.matchMedia('(prefers-reduced-motion:reduce)').matches)return;
    const x=(px/window.innerWidth-.5),y=(py/window.innerHeight-.5);
    if(stage)stage.style.transform=`rotateX(${(-y*2.2).toFixed(2)}deg) rotateY(${(x*3).toFixed(2)}deg)`;
    if(topbar)topbar.style.transform=`translate3d(${(x*3).toFixed(1)}px,${(y*2).toFixed(1)}px,0)`;
  }
  window.addEventListener('pointermove',e=>{px=e.clientX;py=e.clientY;if(!raf)raf=requestAnimationFrame(tilt)},{passive:true});
  window.addEventListener('blur',()=>{if(stage)stage.style.transform='';if(topbar)topbar.style.transform=''});

  const title=document.querySelector('.hero h1');
  if(title){
    const text=title.textContent;title.setAttribute('data-text',text);
    title.addEventListener('mouseenter',()=>title.style.letterSpacing='-.025em');
    title.addEventListener('mouseleave',()=>title.style.letterSpacing='-.04em');
  }

  document.querySelectorAll('.answer').forEach((card,i)=>{
    card.style.setProperty('--card-delay',i*70+'ms');
    card.addEventListener('pointerenter',()=>card.style.zIndex='4');
    card.addEventListener('pointerleave',()=>card.style.zIndex='');
  });
})();
