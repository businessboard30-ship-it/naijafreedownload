const ALLOWED = [/^seasons\\/(now|upcoming)$/, /^top\\/anime$/, /^anime$/, /^anime\\/[0-9]+\\/(full|characters)$/, /^characters\\/[0-9]+\\/full$/];

export async function onRequest({ request }: { request: Request }) {
  const incoming = new URL(request.url);
  const path = incoming.pathname.replace(/^\/api\/anime\/?/, '').replace(/\/$/, '');
  if (!ALLOWED.some((pattern) => pattern.test(path))) return Response.json({ error: 'Anime endpoint not permitted.' }, { status: 404 });
  const params = new URLSearchParams();
  for (const [key, value] of incoming.searchParams) {
    if (['q','page','limit','filter','type','sfw','order_by','sort'].includes(key)) params.set(key, value.slice(0, 120));
  }
  for (const key of ['page','limit']) {
    if (params.has(key)) {
      const n = Number(params.get(key));
      if (!Number.isInteger(n) || n < 1 || n > (key === 'page' ? 1000 : 25)) return Response.json({ error: 'Invalid ' + key + '.' }, { status: 400 });
    }
  }
  const target = new URL('https://api.jikan.moe/v4/' + path);
  target.search = params.toString();
  const response = await fetch(target.toString(), { headers: { Accept: 'application/json' } });
  const headers = new Headers({ 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'public, max-age=120, s-maxage=300', 'Access-Control-Allow-Origin':'*' });
  if (!response.ok) return new Response(JSON.stringify({ error: response.status === 429 ? 'Anime catalogue is busy. Wait a moment and try again.' : 'Anime information is temporarily unavailable.' }), { status: response.status, headers });
  return new Response(response.body, { status: 200, headers });
}