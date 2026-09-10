window.MARGOTS_CONFIG = {
  API_BASE_URL: "",
  GOOGLE_CLIENT_ID: ""
};

/* MARGOTS UI boot: keep the existing page functional, but open the real workspace immediately. */
(() => {
  'use strict';

  const addCss = (href) => {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  };

  addCss('ui-polish.css?v=15');
  addCss('chatgpt-margots.css?v=5');
  addCss('chatgpt-layout.css?v=5');
  addCss('google-login.css?v=1');

  const favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.type = 'image/svg+xml';
  favicon.href = 'icon.svg?v=5';
  document.head.appendChild(favicon);

  const appleIcon = document.createElement('link');
  appleIcon.rel = 'apple-touch-icon';
  appleIcon.href = 'icon.svg?v=5';
  document.head.appendChild(appleIcon);

  const loadScript = (src) => {
    if (document.querySelector(`script[src="${src}"]`)) return;
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    document.head.appendChild(script);
  };

  const openWorkspace = () => {
    const landing = document.querySelector('.landing');
    const app = document.querySelector('.workspace-app');
    if (!landing || !app) return false;
    landing.classList.add('hide');
    app.classList.add('show');
    return true;
  };

  const boot = () => {
    loadScript('frontend-modules.js?v=live');
    loadScript('same-page-workspace.js?v=5');
    loadScript('chatgpt-layout-boot.js?v=3');
    loadScript('google-login.js?v=1');

    /* Do not wait for a Start button: MARGOTS is the workspace. */
    openWorkspace();
    setTimeout(openWorkspace, 50);
    setTimeout(openWorkspace, 250);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
