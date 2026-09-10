(() => {
  'use strict';
  const start = () => {
    if (!document.querySelector('#mx-shell') || document.querySelector('#cg-sidebar')) return false;
    if (document.querySelector('script[data-margots-chat-layout]')) return true;
    const s = document.createElement('script');
    s.src = 'chatgpt-layout.js?v=4';
    s.defer = true;
    s.dataset.margotsChatLayout = '1';
    document.head.appendChild(s);
    return true;
  };

  const observe = () => {
    if (start()) return;
    const observer = new MutationObserver(() => {
      if (start()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 15000);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observe, { once: true });
  } else {
    observe();
  }
})();
