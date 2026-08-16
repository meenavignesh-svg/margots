(()=>{'use strict';
const loadUnified=()=>{if(document.getElementById('margots-unified-loader'))return;const s=document.createElement('script');s.id='margots-unified-loader';s.src='unified-chat.js?v=3';s.async=false;document.head.appendChild(s)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loadUnified,{once:true});else loadUnified();
})();