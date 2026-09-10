window.MARGOTS_CONFIG = {
  API_BASE_URL: ""
};

/* MARGOTS production UI loader. */
(() => {
  const addCss = (href) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  };

  addCss('ui-polish.css?v=14');
  addCss('chatgpt-margots.css?v=4');
  addCss('chatgpt-layout.css?v=4');

  const favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.type = 'image/svg+xml';
  favicon.href = 'icon.svg?v=4';
  document.head.appendChild(favicon);

  const appleIcon = document.createElement('link');
  appleIcon.rel = 'apple-touch-icon';
  appleIcon.href = 'icon.svg?v=4';
  document.head.appendChild(appleIcon);

  const loadScript = (src) => {
    if (document.querySelector(`script[src="${src}"]`)) return;
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    document.head.appendChild(script);
  };

  const loadModules = () => {
    loadScript('frontend-modules.js?v=live');
    loadScript('same-page-workspace.js?v=4');
    loadScript('chatgpt-layout-boot.js?v=2');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadModules, { once: true });
  } else {
    loadModules();
  }
})();
