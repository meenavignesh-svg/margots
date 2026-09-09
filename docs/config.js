window.MARGOTS_CONFIG = {
  // Production: set this to your deployed Flask API HTTPS URL (e.g. Render).
  // Example: "https://margots-api.onrender.com"
  // Leave empty for local same-origin testing only.
  // Until this is set, the live GitHub Pages UI will show BACKEND OFFLINE.
  API_BASE_URL: ""
};

/* Premium hero art: a smooth molecular double-helix, not a ladder. */
(() => {
  const style = document.createElement('style');
  style.textContent = `
    .dna-stage{isolation:isolate}
    .dna-stage::before{content:"";position:absolute;width:430px;height:430px;border-radius:50%;background:radial-gradient(circle,rgba(50,139,255,.13) 0,rgba(76,91,255,.07) 34%,rgba(22,184,170,.035) 58%,transparent 72%);filter:blur(5px);animation:margotsPulse 5s ease-in-out infinite;z-index:-2}
    .dna-stage::after{content:"";position:absolute;width:390px;height:390px;border:1px solid rgba(62,117,232,.13);border-radius:50%;box-shadow:0 0 0 34px rgba(62,117,232,.025),0 0 0 76px rgba(22,184,170,.018);animation:margotsOrbit 18s linear infinite;z-index:-1}
    .dna{width:390px;height:430px;transform:none;filter:drop-shadow(0 24px 35px rgba(48,92,180,.14));}
    .dna:before,.dna:after{display:none!important}
    .dna .margots-helix{width:100%;height:100%;overflow:visible}
    .dna .helix-glow{fill:none;stroke:url(#helixGradient);stroke-width:15;stroke-linecap:round;opacity:.10;filter:blur(8px)}
    .dna .helix-line{fill:none;stroke:url(#helixGradient);stroke-width:5;stroke-linecap:round}
    .dna .helix-line.alt{stroke:url(#helixGradient2)}
    .dna .base{stroke:#fff;stroke-width:3;stroke-linecap:round;filter:drop-shadow(0 3px 5px rgba(55,100,180,.16))}
    .dna .node{stroke:#fff;stroke-width:2.5;filter:drop-shadow(0 3px 6px rgba(47,100,200,.18))}
    .dna .rungs{display:none!important}
    .dna svg{animation:margotsFloat 6s ease-in-out infinite}
    @keyframes margotsFloat{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-8px) rotate(1deg)}}
    @keyframes margotsPulse{0%,100%{transform:scale(.96);opacity:.72}50%{transform:scale(1.04);opacity:1}}
    @keyframes margotsOrbit{to{transform:rotate(360deg)}}
    @media(max-width:800px){.dna-stage{height:340px}.dna{width:300px;height:330px}.dna-stage::before{width:310px;height:310px}.dna-stage::after{width:290px;height:290px}}
    @media(prefers-reduced-motion:reduce){.dna svg,.dna-stage::before,.dna-stage::after{animation:none!important}}
  `;
  document.head.appendChild(style);

  function mountHelix(){
    const root=document.querySelector('.dna');
    if(!root) return;
    root.innerHTML=`
      <svg class="margots-helix" viewBox="0 0 390 430" role="img" aria-label="Abstract molecular double helix">
        <defs>
          <linearGradient id="helixGradient" x1="40" y1="20" x2="350" y2="410" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#2dbcf0"/><stop offset=".45" stop-color="#6568ff"/><stop offset=".72" stop-color="#17b8aa"/><stop offset="1" stop-color="#8757ff"/>
          </linearGradient>
          <linearGradient id="helixGradient2" x1="350" y1="20" x2="40" y2="410" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#8b5cf6"/><stop offset=".4" stop-color="#27b9ef"/><stop offset=".72" stop-color="#21bfa8"/><stop offset="1" stop-color="#6d62ff"/>
          </linearGradient>
          <linearGradient id="baseGradient" x1="0" y1="0" x2="1" y2="0">
            <stop stop-color="#36bde9"/><stop offset=".5" stop-color="#7560ff"/><stop offset="1" stop-color="#22bca8"/>
          </linearGradient>
        </defs>
        <path class="helix-glow" d="M112 24 C292 70 292 142 112 190 C-68 238 -68 310 112 358 C292 406 292 418 278 422"/>
        <path class="helix-glow" d="M278 24 C98 70 98 142 278 190 C458 238 458 310 278 358 C98 406 98 418 112 422"/>
        <path class="helix-line" d="M112 24 C292 70 292 142 112 190 C-68 238 -68 310 112 358 C292 406 292 418 278 422"/>
        <path class="helix-line alt" d="M278 24 C98 70 98 142 278 190 C458 238 458 310 278 358 C98 406 98 418 112 422"/>
        <g fill="url(#baseGradient)">
          <line class="base" x1="136" y1="49" x2="254" y2="49"/>
          <line class="base" x1="169" y1="86" x2="221" y2="86"/>
          <line class="base" x1="208" y1="123" x2="182" y2="123"/>
          <line class="base" x1="238" y1="160" x2="152" y2="160"/>
          <line class="base" x1="221" y1="197" x2="169" y2="197"/>
          <line class="base" x1="173" y1="234" x2="217" y2="234"/>
          <line class="base" x1="152" y1="271" x2="238" y2="271"/>
          <line class="base" x1="169" y1="308" x2="221" y2="308"/>
          <line class="base" x1="208" y1="345" x2="182" y2="345"/>
          <line class="base" x1="254" y1="382" x2="136" y2="382"/>
        </g>
        <g>
          <circle class="node" fill="#39bde9" cx="112" cy="24" r="9"/><circle class="node" fill="#8060ff" cx="278" cy="24" r="9"/>
          <circle class="node" fill="#4d8dff" cx="169" cy="86" r="7"/><circle class="node" fill="#23b9a8" cx="221" cy="86" r="7"/>
          <circle class="node" fill="#765dff" cx="112" cy="190" r="8"/><circle class="node" fill="#2bbde9" cx="278" cy="190" r="8"/>
          <circle class="node" fill="#22bca8" cx="169" cy="308" r="7"/><circle class="node" fill="#795dff" cx="221" cy="308" r="7"/>
          <circle class="node" fill="#3abdec" cx="112" cy="358" r="8"/><circle class="node" fill="#8060ff" cx="278" cy="358" r="8"/>
        </g>
      </svg>`;
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mountHelix,{once:true});
  else mountHelix();
})();
