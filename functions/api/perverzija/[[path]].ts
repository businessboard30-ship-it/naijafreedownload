const ALLOWED_PATHS = [
  /^scenes$/,
  /^scenes\/[0-9]+$/,
  /^performers$/,
  /^performers\/[a-z0-9-]+$/,
  /^performers\/[a-z0-9-]+\/scenes$/,
  /^studios$/,
  /^studios\/[a-z0-9-]+$/,
  /^studios\/[a-z0-9-]+\/scenes$/,
  /^tags$/,
  /^tags\/[a-z0-9-]+$/,
  /^tags\/[a-z0-9-]+\/scenes$/,
  /^networks$/,
  /^stats$/,
  /^health$/,
];

const ALLOWED_QUERY = new Set([
  'q', 'kind', 'page', 'per_page', 'sort', 'performer', 'studio', 'tag',
  'released_after', 'released_before', 'added_after', 'added_before',
  'min_duration', 'max_duration', 'gender', 'name', 'ids',
]);

export async function onRequest({ request }: { request: Request }) {
  if (request.method !== 'GET') {
    return Response.json({ error: 'Method not allowed.' }, { status: 405, headers: { Allow: 'GET' } });
  }
  const incoming = new URL(request.url);
  const path = incoming.pathname.replace(/^\/api\/perverzija\/?/, '').replace(/\/$/, '');
  if (!ALLOWED_PATHS.some(pattern => pattern.test(path))) {
    return Response.json({ error: 'Catalogue endpoint not permitted.' }, { status: 404 });
  }

  const params = new URLSearchParams();
  for (const [key, value] of incoming.searchParams) {
    if (ALLOWED_QUERY.has(key)) params.set(key, value.slice(0, 160));
  }
  const target = new URL('https://api.perverzija.com/v1/' + path);
  target.search = params.toString();

  try {
    const upstream = await fetch(target.toString(), {
      headers: { Accept: 'application/json' },
    });
    const headers = new Headers({
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=180, s-maxage=300',
      'X-Content-Type-Options': 'nosniff',
    });
    if (!upstream.ok) {
      return new Response(JSON.stringify({ error: upstream.status === 429 ? 'The catalogue is receiving too many requests. Please try again shortly.' : 'The adult catalogue provider is temporarily unavailable.' }), { status: upstream.status, headers });
    }
    return new Response(upstream.body, { status: 200, headers });
  } catch {
    return Response.json({ error: 'Could not reach the adult catalogue provider.' }, { status: 502 });
  }
}
