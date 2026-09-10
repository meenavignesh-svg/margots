window.MARGOTS_CONFIG = {
  API_BASE_URL: ""
};

/* MARGOTS hero: flowing glass-like biotech helix.
   Deliberately no rungs/crossbars: the reference is used for the glossy
   blue/purple molecular aesthetic, while the hero remains an organic visual. */
(() => {
  const style = document.createElement('style');
  style.textContent = `
    .dna-stage{position:relative;isolation:isolate;overflow:visible}
    .dna-stage:before{content:"";position:absolute;inset:4% 0 4% 8%;border-radius:50%;background:radial-gradient(circle,rgba(70,128,255,.16),rgba(123,88,255,.08) 38%,rgba(42,202,218,.035) 58%,transparent 74%);filter:blur(18px);z-index:-2;animation:margotsGlow 6s ease-in-out infinite}
    .dna-stage:after{content:"";position:absolute;width:470px;height:270px;right:-15px;top:20%;border:1px solid rgba(77,128,235,.11);border-radius:50%;transform:rotate(-18deg);z-index:-1}
    .dna{width:500px;height:510px;filter:drop-shadow(0 30px 38px rgba(45,77,160,.18))}
    .dna:before,.dna:after,.dna .rungs{display:none!important}
    .dna .margots-helix{width:100%;height:100%;overflow:visible;animation:margotsFloat 7s ease-in-out infinite}
    .dna .tube{fill:none;stroke-linecap:round;stroke-width:27;filter:url(#tubeShadow)}
    .dna .tube.a{stroke:url(#tubeA)}
    .dna .tube.b{stroke:url(#tubeB)}
    .dna .shine{fill:none;stroke:rgba(255,255,255,.72);stroke-width:5;stroke-linecap:round;opacity:.72}
    .dna .shine.b{opacity:.5}
    .dna .molecule{stroke:rgba(255,255,255,.78);stroke-width:2;filter:url(#sphereShadow)}
    .dna .orbit{fill:none;stroke:rgba(68,139,238,.18);stroke-width:1.2}
    @keyframes margotsFloat{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-9px) rotate(1deg)}}
    @keyframes margotsGlow{0%,100%{opacity:.72;transform:scale(.97)}50%{opacity:1;transform:scale(1.03)}}
    @media(max-width:1000px){.dna{width:410px;height:430px}}
    @media(max-width:800px){.dna-stage{height:350px}.dna{width:330px;height:350px}.dna-stage:before{inset:0}}
    @media(prefers-reduced-motion:reduce){.dna .margots-helix,.dna-stage:before{animation:none!important}}
  `;
  document.head.appendChild(style);

  function mount(){
    const root=document.querySelector('.dna');
    if(!root)return;
    root.innerHTML=`
      <svg class="margots-helix" viewBox="0 0 500 510" role="img" aria-label="Abstract glossy molecular helix">
        <defs>
          <linearGradient id="tubeA" x1="80" y1="0" x2="410" y2="510" gradientUnits="userSpaceOnUse">
            <stop stop-color="#dffcff"/><stop offset=".14" stop-color="#55c9f1"/><stop offset=".38" stop-color="#3978ea"/><stop offset=".58" stop-color="#766aff"/><stop offset=".8" stop-color="#3acbdc"/><stop offset="1" stop-color="#c9f5ff"/>
          </linearGradient>
          <linearGradient id="tubeB" x1="410" y1="0" x2="80" y2="510" gradientUnits="userSpaceOnUse">
            <stop stop-color="#eee7ff"/><stop offset=".16" stop-color="#8764f5"/><stop offset=".38" stop-color="#438de9"/><stop offset=".6" stop-color="#a16bf2"/><stop offset=".82" stop-color="#52d3e3"/><stop offset="1" stop-color="#eee8ff"/>
          </linearGradient>
          <radialGradient id="blueSphere" cx="28%" cy="22%">
            <stop stop-color="#fff"/><stop offset=".18" stop-color="#baf6ff"/><stop offset=".58" stop-color="#438fe9"/><stop offset="1" stop-color="#4658cb" stop-opacity=".55"/>
          </radialGradient>
          <radialGradient id="purpleSphere" cx="28%" cy="22%">
            <stop stop-color="#fff"/><stop offset=".18" stop-color="#e7e0ff"/><stop offset=".58" stop-color="#9270f2"/><stop offset="1" stop-color="#5b50c9" stop-opacity=".55"/>
          </radialGradient>
          <radialGradient id="cyanSphere" cx="28%" cy="22%">
            <stop stop-color="#fff"/><stop offset=".2" stop-color="#c6fbff"/><stop offset=".58" stop-color="#28c9c7"/><stop offset="1" stop-color="#278fc9" stop-opacity=".5"/>
          </radialGradient>
          <filter id="tubeShadow" x="-80%" y="-30%" width="260%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="sphereShadow" x="-100%" y="-100%" width="300%" height="300%">
            <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#355da8" flood-opacity=".22"/>
          </filter>
        </defs>

        <!-- subtle orbital atmosphere -->
        <ellipse class="orbit" cx="250" cy="255" rx="215" ry="125" transform="rotate(-22 250 255)"/>
        <ellipse class="orbit" cx="250" cy="255" rx="185" ry="72" transform="rotate(30 250 255)" opacity=".55"/>

        <!-- two continuous glass ribbons; NO horizontal DNA rungs -->
        <path class="tube a" d="M125 18 C410 70 410 142 125 194 C-160 246 -160 318 125 370 C410 422 410 458 350 492"/>
        <path class="tube b" d="M375 18 C90 70 90 142 375 194 C660 246 660 318 375 370 C90 422 90 458 150 492"/>

        <!-- photographic glass highlights -->
        <path class="shine" d="M118 18 C396 70 396 137 126 188 C-140 239 -140 309 126 360"/>
        <path class="shine b" d="M382 18 C104 70 104 137 374 188 C640 239 640 309 374 360"/>
        <path class="shine" d="M126 370 C390 418 394 451 350 484"/>
        <path class="shine b" d="M374 370 C110 418 106 451 150 484"/>

        <!-- floating molecular spheres from the reference aesthetic -->
        <g>
          <circle class="molecule" fill="url(#blueSphere)" cx="82" cy="82" r="19"/>
          <circle class="molecule" fill="url(#purpleSphere)" cx="425" cy="112" r="15"/>
          <circle class="molecule" fill="url(#cyanSphere)" cx="63" cy="304" r="12"/>
          <circle class="molecule" fill="url(#purpleSphere)" cx="426" cy="339" r="21"/>
          <circle class="molecule" fill="url(#blueSphere)" cx="403" cy="48" r="8"/>
          <circle class="molecule" fill="url(#cyanSphere)" cx="92" cy="417" r="7"/>
          <circle class="molecule" fill="url(#purpleSphere)" cx="453" cy="216" r="7"/>
          <circle class="molecule" fill="url(#cyanSphere)" cx="43" cy="220" r="6"/>
          <circle class="molecule" fill="url(#blueSphere)" cx="103" cy="150" r="6"/>
          <circle class="molecule" fill="url(#purpleSphere)" cx="393" cy="278" r="6"/>
        </g>
        <g opacity=".25" stroke="#62b9eb" stroke-width="1.5">
          <line x1="82" y1="82" x2="125" y2="53"/><line x1="425" y1="112" x2="375" y2="137"/><line x1="426" y1="339" x2="375" y2="363"/>
        </g>
      </svg>`;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
