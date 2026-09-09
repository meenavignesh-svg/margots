// Legacy/serverless search gateway retained for compatible deployments.
// Canonical production API is backend.py; keep secrets server-side.
const json = (res, status, body, origin) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(x => x.trim()).filter(Boolean);
  if (origin && allowed.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.end(JSON.stringify(body));
};

async function googleSearch(q) {
  const key = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_ENGINE_ID;
  if (!key || !cx) return null;
  const u = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(key)}&cx=${encodeURIComponent(cx)}&q=${encodeURIComponent(q)}`;
  const r = await fetch(u);
  if (!r.ok) throw new Error(`Google Search ${r.status}`);
  const d = await r.json();
  return (d.items || []).slice(0, 8).map(x => ({ title: x.title, url: x.link, snippet: x.snippet }));
}

module.exports = async function (req, res) {
  const origin = req.headers.origin || '';
  if (req.method === 'OPTIONS') return json(res, 204, {}, origin);
  if (req.method !== 'POST') return json(res, 405, { success: false, data: null, error: { code: 'METHOD_NOT_ALLOWED', message: 'POST required.' } }, origin);
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const action = body.action || 'search';
    if (action !== 'search') return json(res, 400, { success: false, data: null, error: { code: 'UNKNOWN_ACTION', message: 'Unknown action.' } }, origin);
    const q = String(body.query || '').trim();
    if (!q) return json(res, 400, { success: false, data: null, error: { code: 'MISSING_QUERY', message: 'query required.' } }, origin);
    const results = await googleSearch(q);
    if (!results) return json(res, 503, { success: false, data: null, error: { code: 'SEARCH_NOT_CONFIGURED', message: 'Search provider is not configured.' } }, origin);
    return json(res, 200, { success: true, data: { query: q, results }, error: null }, origin);
  } catch (e) {
    return json(res, 500, { success: false, data: null, error: { code: 'UPSTREAM_ERROR', message: 'Upstream request failed.' } }, origin);
  }
};
