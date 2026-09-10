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

  addCss('ui-polish.css?v=12');
  addCss('chatgpt-margots.css?v=2');

  const favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.type = 'image/svg+xml';
  favicon.href = 'icon.svg?v=2';
  document.head.appendChild(favicon);

  const appleIcon = document.createElement('link');
  appleIcon.rel = 'apple-touch-icon';
  appleIcon.href = 'icon.svg?v=2';
  document.head.appendChild(appleIcon);

  const loadModules = () => {
    if (window.MARGOTSModules) return;
    const script = document.createElement('script');
    script.src = 'frontend-modules.js?v=live';
    script.defer = true;
    document.head.appendChild(script);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadModules, { once: true });
  } else {
    loadModules();
  }
})();
