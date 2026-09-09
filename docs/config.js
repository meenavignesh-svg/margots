/**
 * MARGOTS frontend configuration.
 *
 * Production (GitHub Pages): set window.MARGOTS_API_BASE to your deployed gateway,
 * e.g. https://margots-api.onrender.com
 *
 * Local: leave empty to use same-origin, or set http://127.0.0.1:8080
 */
(function (root) {
  'use strict';
  var stored = '';
  try {
    stored = (localStorage.getItem('margots_api_base') || '').trim();
  } catch (e) {}
  var injected = (typeof root.MARGOTS_API_BASE === 'string' && root.MARGOTS_API_BASE) || '';
  root.MARGOTS_CONFIG = {
    apiBase: (stored || injected || '').replace(/\/$/, ''),
    requestTimeoutMs: 60000,
    version: '1.1.0'
  };
})(typeof self !== 'undefined' ? self : this);
