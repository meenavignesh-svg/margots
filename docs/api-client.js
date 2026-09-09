(() => {
  'use strict';
  const configured = String(window.MARGOTS_CONFIG?.API_BASE_URL || '').trim().replace(/\/$/, '');
  const API_BASE_URL = configured || (location.protocol === 'http:' || location.protocol === 'https:' ? location.origin : 'http://127.0.0.1:8000');
  const TIMEOUT_MS = 45000;

  async function request(path, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeout || TIMEOUT_MS);
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        signal: controller.signal,
      });
      let payload;
      try { payload = await response.json(); } catch { throw new Error(`Server returned invalid JSON (HTTP ${response.status}).`); }
      if (!response.ok || payload?.success === false) {
        const error = payload?.error;
        const message = error?.message || `Request failed (HTTP ${response.status}).`;
        const e = new Error(message); e.code = error?.code || `HTTP_${response.status}`; e.status = response.status; throw e;
      }
      return payload;
    } catch (error) {
      if (error.name === 'AbortError') { const e = new Error('Request timed out. Check the backend or try again.'); e.code = 'TIMEOUT'; throw e; }
      if (error instanceof TypeError) { const e = new Error('MARGOTS backend is unreachable. Check the API URL, HTTPS, CORS, and deployment status.'); e.code = 'NETWORK_ERROR'; throw e; }
      throw error;
    } finally { clearTimeout(timer); }
  }

  window.MargotsAPI = {
    baseUrl: API_BASE_URL,
    health: () => request('/health', { method: 'GET' }),
    analyze: (body) => request('/api/analyze', { method: 'POST', body: JSON.stringify(body) }),
    search: (query) => request('/api/search', { method: 'POST', body: JSON.stringify({ query }) }),
  };
})();
