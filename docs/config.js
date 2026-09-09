window.MARGOTS_CONFIG = {
  // Production: set this to your deployed Flask API HTTPS URL (e.g. Render).
  // Public URL only — never put an AI provider key here.
  API_BASE_URL: ""
};

/* MARGOTS hero visual — glossy 3D-style biotech DNA inspired by the supplied reference.
   Built locally as SVG/CSS so the website does not depend on an external image URL. */
(() => {
  const style = document.createElement('style');
  style.textContent = `
    .dna-stage{position:relative;isolation:isolate;overflow:visible}
    .dna-stage::before{content:"";position:absolute;width:520px;height:520px;right:0;top:50%;transform:translateY(-50%);border-radius:50%;background:radial-gradient(circle,rgba(72,122,255,.17) 0,rgba(125,94,255,.10) 30%,rgba(54,194,218,.055) 52%,transparent 72%);filter:blur(8px);z-index:-3;animation:margotsGlow 6s ease-in-out infinite}
    .dna-stage::after{content:"";position:absolute;width:500px;height:330px;right:-20px;top:16%;border-radius:50%;border:1px solid rgba(72,129,239,.10);box-shadow:0 0 0 45px rgba(93,114,240,.025),0 0 0 100px rgba(35,190,198,.018);transform:rotate(-18deg);z-index:-2;animation:margotsOrbit 20s linear infinite}
    .dna{width:480px;height:500px;transform:translateX(8px);filter:drop-shadow(0 28px 35px rgba(44,82,170,.18));}
    .dna:before,.dna:after,.dna .rungs{display:none!important}
    .dna .margots-helix{width:100%;height:100%;overflow:visible;animation:margotsDNAFloat 7s ease-in-out infinite;}
    .dna .soft-glow{fill:none;stroke:url(#dnaBlue);stroke-linecap:round;opacity:.20;filter:blur(11px)}
    .dna .soft-glow.two{stroke:url(#dnaPurple)}
    .dna .strand{fill:none;stroke:url(#dnaBlue);stroke-width:10;stroke-linecap:round;filter:url(#glassGlow)}
    .dna .strand.two{stroke:url(#dnaPurple)}
    .dna .strand.highlight{fill:none;stroke:rgba(255,255,255,.72);stroke-width:2.4;stroke-linecap:round;opacity:.75}
    .dna .strand.highlight.two{stroke:rgba(255,255,255,.55)}
    .dna .pair{stroke:url(#pairGrad);stroke-width:8;stroke-linecap:round;opacity:.86;filter:url(#glassGlowSmall)}
    .dna .pair.core{stroke:rgba(255,255,255,.82);stroke-width:2.2;opacity:.9;filter:none}
    .dna .sphere{stroke:rgba(255,255,255,.78);stroke-width:2;filter:url(#sphereShadow)}
    .dna .micro{opacity:.82;filter:url(#sphereShadow)}
    .dna .orbit{fill:none;stroke:rgba(64,142,237,.23);stroke-width:1.2}
    .dna .orbit.purple{stroke:rgba(133,91,245,.18)}
    .dna .particle{filter:url(#sphereShadow)}
    @keyframes margotsDNAFloat{0%,100%{transform:translate3d(0,0,0) rotate(-1deg)}50%{transform:translate3d(0,-9px,0) rotate(1deg)}}
    @keyframes margotsGlow{0%,100%{opacity:.72;transform:translateY(-50%) scale(.97)}50%{opacity:1;transform:translateY(-50%) scale(1.04)}}
    @keyframes margotsOrbit{to{transform:rotate(342deg)}}
    @media(max-width:1000px){.dna{width:400px;height:430px;transform:none}.dna-stage::before{width:420px;height:420px}}
    @media(max-width:800px){.dna-stage{height:350px}.dna{width:330px;height:350px}.dna-stage::before{width:340px;height:340px;right:50%;transform:translate(50%,-50%)}.dna-stage::after{width:330px;height:230px;right:50%;transform:translateX(50%) rotate(-18deg)}}
    @media(prefers-reduced-motion:reduce){.dna .margots-helix,.dna-stage::before,.dna-stage::after{animation:none!important}}
  `;
  document.head.appendChild(style);

  function mountHelix(){
    const root=document.querySelector('.dna');
    if(!root) return;
    root.innerHTML=`
      <svg class="margots-helix" viewBox="0 0 480 500" role="img" aria-label="Glossy molecular DNA double helix">
        <defs>
          <linearGradient id="dnaBlue" x1="90" y1="20" x2="390" y2="480" gradientUnits="userSpaceOnUse">
            <stop stop-color="#d9fbff"/><stop offset=".12" stop-color="#5ed7f4"/><stop offset=".34" stop-color="#3279ee"/><stop offset=".58" stop-color="#7b69ff"/><stop offset=".82" stop-color="#36c8e2"/><stop offset="1" stop-color="#a7e9ff"/>
          </linearGradient>
          <linearGradient id="dnaPurple" x1="390" y1="20" x2="90" y2="480" gradientUnits="userSpaceOnUse">
            <stop stop-color="#d9d1ff"/><stop offset=".16" stop-color="#8563ff"/><stop offset=".38" stop-color="#439cf3"/><stop offset=".62" stop-color="#a86df2"/><stop offset=".84" stop-color="#54cdea"/><stop offset="1" stop-color="#e4dcff"/>
          </linearGradient>
          <linearGradient id="pairGrad" x1="0" y1="0" x2="1" y2="0">
            <stop stop-color="#55d9f2"/><stop offset=".45" stop-color="#7180ff"/><stop offset="1" stop-color="#9e6dff"/>
          </linearGradient>
          <radialGradient id="blueSphere" cx="32%" cy="25%" r="75%">
            <stop stop-color="#ffffff" stop-opacity=".98"/><stop offset=".16" stop-color="#a9efff" stop-opacity=".96"/><stop offset=".55" stop-color="#398ce9" stop-opacity=".84"/><stop offset="1" stop-color="#3658d6" stop-opacity=".55"/>
          </radialGradient>
          <radialGradient id="purpleSphere" cx="30%" cy="24%" r="76%">
            <stop stop-color="#ffffff" stop-opacity=".98"/><stop offset=".18" stop-color="#ded6ff" stop-opacity=".96"/><stop offset=".55" stop-color="#8c6af3" stop-opacity=".84"/><stop offset="1" stop-color="#5d50cc" stop-opacity=".52"/>
          </radialGradient>
          <radialGradient id="cyanSphere" cx="30%" cy="24%" r="76%">
            <stop stop-color="#ffffff" stop-opacity=".98"/><stop offset=".2" stop-color="#baf9ff"/><stop offset=".58" stop-color="#25c8c5" stop-opacity=".78"/><stop offset="1" stop-color="#2199cf" stop-opacity=".46"/>
          </radialGradient>
          <filter id="glassGlow" x="-60%" y="-20%" width="220%" height="140%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="glassGlowSmall" x="-40%" y="-80%" width="180%" height="260%"><feGaussianBlur stdDeviation="1.8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="sphereShadow" x="-80%" y="-80%" width="260%" height="260%"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#315fb8" flood-opacity=".20"/></filter>
        </defs>

        <!-- soft atmospheric orbital structure -->
        <ellipse class="orbit" cx="245" cy="250" rx="205" ry="120" transform="rotate(-22 245 250)"/>
        <ellipse class="orbit purple" cx="245" cy="250" rx="190" ry="82" transform="rotate(32 245 250)"/>

        <!-- broad translucent glow behind the helix -->
        <path class="soft-glow" stroke-width="34" d="M125 24 C405 76 405 142 125 194 C-155 246 -155 314 125 366 C405 418 405 450 355 478"/>
        <path class="soft-glow two" stroke-width="34" d="M355 24 C75 76 75 142 355 194 C635 246 635 314 355 366 C75 418 75 450 125 478"/>

        <!-- glossy outer strands -->
        <path class="strand" d="M125 24 C405 76 405 142 125 194 C-155 246 -155 314 125 366 C405 418 405 450 355 478"/>
        <path class="strand two" d="M355 24 C75 76 75 142 355 194 C635 246 635 314 355 366 C75 418 75 450 125 478"/>
        <path class="strand highlight" d="M119 25 C393 76 393 139 123 191 C-142 242 -142 309 123 360"/>
        <path class="strand highlight two" d="M361 25 C87 76 87 139 357 191 C622 242 622 309 357 360"/>

        <!-- depth-rich base pairs -->
        <g>
          <line class="pair" x1="143" y1="50" x2="337" y2="50"/><line class="pair core" x1="143" y1="50" x2="337" y2="50"/>
          <line class="pair" x1="187" y1="87" x2="293" y2="87"/><line class="pair core" x1="187" y1="87" x2="293" y2="87"/>
          <line class="pair" x1="244" y1="124" x2="236" y2="124"/><line class="pair core" x1="244" y1="124" x2="236" y2="124"/>
          <line class="pair" x1="292" y1="161" x2="188" y2="161"/><line class="pair core" x1="292" y1="161" x2="188" y2="161"/>
          <line class="pair" x1="302" y1="198" x2="178" y2="198"/><line class="pair core" x1="302" y1="198" x2="178" y2="198"/>
          <line class="pair" x1="255" y1="235" x2="225" y2="235"/><line class="pair core" x1="255" y1="235" x2="225" y2="235"/>
          <line class="pair" x1="188" y1="272" x2="292" y2="272"/><line class="pair core" x1="188" y1="272" x2="292" y2="272"/>
          <line class="pair" x1="178" y1="309" x2="302" y2="309"/><line class="pair core" x1="178" y1="309" x2="302" y2="309"/>
          <line class="pair" x1="236" y1="346" x2="244" y2="346"/><line class="pair core" x1="236" y1="346" x2="244" y2="346"/>
          <line class="pair" x1="293" y1="383" x2="187" y2="383"/><line class="pair core" x1="293" y1="383" x2="187" y2="383"/>
          <line class="pair" x1="337" y1="420" x2="143" y2="420"/><line class="pair core" x1="337" y1="420" x2="143" y2="420"/>
        </g>

        <!-- molecular nodes -->
        <g>
          <circle class="sphere" fill="url(#blueSphere)" cx="125" cy="24" r="12"/><circle class="sphere" fill="url(#purpleSphere)" cx="355" cy="24" r="12"/>
          <circle class="sphere" fill="url(#cyanSphere)" cx="187" cy="87" r="9"/><circle class="sphere" fill="url(#purpleSphere)" cx="293" cy="87" r="9"/>
          <circle class="sphere" fill="url(#purpleSphere)" cx="125" cy="194" r="11"/><circle class="sphere" fill="url(#blueSphere)" cx="355" cy="194" r="11"/>
          <circle class="sphere" fill="url(#cyanSphere)" cx="178" cy="309" r="9"/><circle class="sphere" fill="url(#purpleSphere)" cx="302" cy="309" r="9"/>
          <circle class="sphere" fill="url(#blueSphere)" cx="125" cy="366" r="11"/><circle class="sphere" fill="url(#purpleSphere)" cx="355" cy="366" r="11"/>
          <circle class="sphere" fill="url(#cyanSphere)" cx="187" cy="420" r="8"/><circle class="sphere" fill="url(#purpleSphere)" cx="293" cy="420" r="8"/>
        </g>

        <!-- floating molecular particles like the reference -->
        <g class="micro">
          <circle fill="url(#blueSphere)" cx="62" cy="94" r="17"/><circle fill="url(#purpleSphere)" cx="421" cy="118" r="14"/>
          <circle fill="url(#cyanSphere)" cx="72" cy="307" r="10"/><circle fill="url(#purpleSphere)" cx="418" cy="330" r="18"/>
          <circle fill="url(#blueSphere)" cx="393" cy="60" r="7"/><circle fill="url(#cyanSphere)" cx="87" cy="408" r="6"/>
          <circle fill="url(#purpleSphere)" cx="445" cy="215" r="6"/><circle fill="url(#cyanSphere)" cx="38" cy="222" r="5"/>
          <circle fill="url(#blueSphere)" cx="102" cy="150" r="5"/><circle fill="url(#purpleSphere)" cx="382" cy="274" r="5"/>
        </g>
        <g opacity=".65">
          <line x1="62" y1="94" x2="125" y2="70" stroke="#6bbde9" stroke-opacity=".35"/>
          <line x1="421" y1="118" x2="355" y2="145" stroke="#866ef3" stroke-opacity=".30"/>
          <line x1="418" y1="330" x2="355" y2="365" stroke="#53cbdc" stroke-opacity=".30"/>
        </g>
      </svg>`;
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mountHelix,{once:true});
  else mountHelix();
})();
