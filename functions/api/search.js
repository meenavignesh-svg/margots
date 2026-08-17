export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const q = (url.searchParams.get('q') || '').trim();
  if (!q) return new Response(JSON.stringify({ error: 'Missing query' }), { status: 400, headers: { 'content-type': 'application/json' } });
  const key = context.env.GOOGLE_API_KEY;
  const cx = context.env.GOOGLE_CX;
  if (!key || !cx) return new Response(JSON.stringify({ error: 'Search service is not configured' }), { status: 503, headers: { 'content-type': 'application/json' } });
  const endpoint = new URL('https://www.googleapis.com/customsearch/v1');
  endpoint.searchParams.set('key', key);
  endpoint.searchParams.set('cx', cx);
  endpoint.searchParams.set('q', q.slice(0, 300));
  endpoint.searchParams.set('safe', 'active');
  endpoint.searchParams.set('num', '8');
  const r = await fetch(endpoint);
  const data = await r.json();
  if (!r.ok) return new Response(JSON.stringify({ error: 'Google search failed', detail: data?.error?.message || 'Unknown error' }), { status: 502, headers: { 'content-type': 'application/json' } });
  const items = (data.items || []).map(x => ({ title: x.title, url: x.link, snippet: x.snippet, displayLink: x.displayLink }));
  return new Response(JSON.stringify({ query: q, items }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=60' } });
}