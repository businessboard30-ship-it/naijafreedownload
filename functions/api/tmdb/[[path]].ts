interface Env { TMDB_READ_ACCESS_TOKEN?: string }

const ALLOWED = [
  /^trending\/movie\/(day|week)$/,
  /^movie\/(popular|top_rated|upcoming|now_playing)$/,
  /^discover\/movie$/,
  /^search\/movie$/,
  /^genre\/movie\/list$/,
  /^configuration\/countries$/,
  /^movie\/[0-9]+$/,
  /^movie\/[0-9]+\/credits$/,
];

export async function onRequest({ request, env }: { request: Request; env: Env }) {
  const token = env.TMDB_READ_ACCESS_TOKEN;
  if (!token) return Response.json({ error: 'Movie catalogue is being configured. Please try again later.' }, { status: 503 });

  const incoming = new URL(request.url);
  const path = incoming.pathname.replace(/^\/api\/tmdb\/?/, '').replace(/\/$/, '');
  if (!ALLOWED.some((pattern) => pattern.test(path))) {
    return Response.json({ error: 'TMDB endpoint not permitted.' }, { status: 404 });
  }

  const params = new URLSearchParams();
  for (const [key, value] of incoming.searchParams) {
    if (['page', 'query', 'language', 'region', 'with_genres', 'with_origin_country', 'sort_by', 'primary_release_year', 'year'].includes(key)) {
      params.set(key, value.slice(0, 120));
    }
  }
  if (params.has('page')) {
    const page = Number(params.get('page'));
    if (!Number.isInteger(page) || page < 1 || page > 500) return Response.json({ error: 'Invalid page.' }, { status: 400 });
  }

  const target = new URL(`https://api.themoviedb.org/3/${path}`);
  target.search = params.toString();
  const response = await fetch(target.toString(), {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  const headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=300, s-maxage=900', 'Access-Control-Allow-Origin': '*' });
  if (!response.ok) return new Response(JSON.stringify({ error: response.status === 401 ? 'TMDB credentials are invalid or not configured.' : 'Movie information is temporarily unavailable.' }), { status: response.status, headers });
  return new Response(response.body, { status: 200, headers });
}
