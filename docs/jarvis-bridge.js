/* Margots ↔ J.A.R.V.I.S browser-safe bridge
 * Based on the user's jarvis-ai-assistant project.
 * Browser-safe actions only: search, open supported web destinations, and voice-triggered commands.
 * Desktop automation, WhatsApp control and OS-level actions remain server/desktop-only because browsers cannot safely execute them.
 */
(() => {
  'use strict';
  const sites = {
    google: 'https://www.google.com/search?q=',
    youtube: 'https://www.youtube.com/results?search_query=',
    github: 'https://github.com/search?q=',
    wikipedia: 'https://en.wikipedia.org/wiki/Special:Search?search=',
    reddit: 'https://www.reddit.com/search/?q='
  };

  function jarvisIntent(text) {
    const q = String(text || '').trim();
    if (!q) return null;
    const m = q.match(/^\s*(?:jarvis[,:]?\s*)?(?:search|find|look up)\s+(.+)$/i);
    if (m) return { type: 'search', query: m[1] };
    const o = q.match(/^\s*(?:jarvis[,:]?\s*)?open\s+(youtube|github|wikipedia|reddit|google)\s*$/i);
    if (o) return { type: 'open', site: o[1].toLowerCase() };
    return null;
  }

  function runJarvisIntent(intent) {
    if (!intent) return false;
    if (intent.type === 'search') {
      window.open(sites.google + encodeURIComponent(intent.query), '_blank', 'noopener,noreferrer');
      return true;
    }
    if (intent.type === 'open') {
      const base = sites[intent.site];
      if (!base) return false;
      window.open(intent.site === 'google' ? 'https://www.google.com' : base.replace(/search\?q=$|results\?search_query=$|search\/$|Special:Search\?search=$/, ''), '_blank', 'noopener,noreferrer');
      return true;
    }
    return false;
  }

  window.MargotsJarvis = { intent: jarvisIntent, run: runJarvisIntent, sites };
})();
