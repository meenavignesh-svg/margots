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

  addCss('ui-polish.css?v=13');
  addCss('chatgpt-margots.css?v=3');
  addCss('chatgpt-layout.css?v=3');

  const favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.type = 'image/svg+xml';
  favicon.href = 'icon.svg?v=3';
  document.head.appendChild(favicon);

  const appleIcon = document.createElement('link');
  appleIcon.rel = 'apple-touch-icon';
  appleIcon.href = 'icon.svg?v=3';
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
    loadScript('chatgpt-layout-boot.js?v=1');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadModules, { once: true });
  } else {
    loadModules();
  }
})();
