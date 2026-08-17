(()=>{
const style=document.createElement('style');
style.id='margots-live-light-ui';
style.textContent=`
:root{--bg0:#fff!important;--bg1:#f7f7f8!important;--text:#171717!important;--muted:#6b7280!important;--cyan:#10a37f!important;--blue:#0d9488!important;--line:#e5e7eb!important;--glass:#fff!important}
html,body{background:#fff!important;color:#171717!important}
body{background-image:none!important}
body::before,.ambient{display:none!important}
.top{height:60px!important;background:rgba(255,255,255,.96)!important;border-bottom:1px solid #e5e7eb!important;backdrop-filter:blur(14px)!important}
.brand{letter-spacing:.02em!important;color:#171717!important}
.brand .logo{background:linear-gradient(135deg,#10a37f,#0ea5e9)!important;box-shadow:0 4px 16px rgba(16,163,127,.18)!important}
.icon{background:#fff!important;color:#404040!important;border-color:#e5e7eb!important;box-shadow:none!important}
.main{width:min(860px,100%)!important}
.chat{scrollbar-color:#d1d5db transparent!important}
.core{width:72px!important;height:72px!important;margin-bottom:20px!important;background:linear-gradient(135deg,#10a37f,#0ea5e9)!important;box-shadow:0 10px 28px rgba(16,163,127,.18)!important}
.core::before,.core::after{border-color:rgba(16,163,127,.18)!important}
.welcome h1{color:#171717!important;text-shadow:none!important;font-weight:650!important}
.welcome p{color:#6b7280!important}
.chip{background:#fff!important;color:#404040!important;border-color:#e5e7eb!important}
.chip:hover{background:#f7f7f8!important;border-color:#cfd4d9!important;transform:none!important}
.bubble{background:#f7f7f8!important;color:#171717!important;border:0!important;box-shadow:none!important;backdrop-filter:none!important;border-radius:18px!important}
.user .bubble{background:#eef7f4!important}
.who{color:#6b7280!important}.source{color:#0b7f66!important}
.composer-wrap{left:0!important;right:0!important;bottom:16px!important}
.composer{background:#fff!important;border:1px solid #d1d5db!important;border-radius:18px!important;box-shadow:0 8px 30px rgba(0,0,0,.08)!important;backdrop-filter:none!important}
.composer textarea{color:#171717!important}.composer textarea::placeholder{color:#9ca3af!important}
.composer button{background:#f3f4f6!important;color:#374151!important;border-color:#e5e7eb!important}.composer .send{background:#111827!important;color:#fff!important}
.panel{background:#fff!important;color:#171717!important;border-color:#e5e7eb!important;box-shadow:0 -20px 60px rgba(0,0,0,.12)!important}.panel p{color:#6b7280!important}
.human{right:-18px!important;opacity:.10!important;transform:scale(.68)!important;transform-origin:bottom right!important;filter:grayscale(.2)!important}
.human.active,.human.talk{opacity:.16!important}
@media(max-width:900px){.human{display:none!important}}
`;
document.head.appendChild(style);
})();