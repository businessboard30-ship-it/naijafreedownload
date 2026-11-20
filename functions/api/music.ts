const ENTITIES = new Set(['musicTrack', 'musicArtist', 'album']);
export async function onRequest({ request }: { request: Request }) {
  const incoming = new URL(request.url);
  const term = (incoming.searchParams.get('term') || '').trim().slice(0, 100);
  const entity = incoming.searchParams.get('entity') || 'musicTrack';
  const country = (incoming.searchParams.get('country') || 'US').slice(0, 2).toUpperCase();
  const limit = Math.min(50, Math.max(1, Number(incoming.searchParams.get('limit')) || 25));
  const offset = Math.max(0, Number(incoming.searchParams.get('offset')) || 0);
  if (!term) return Response.json({ resultCount: 0, results: [] });
  if (!ENTITIES.has(entity)) return Response.json({ error: 'Unsupported music search type.' }, { status: 400 });
  const target = new URL('https://itunes.apple.com/search');
  target.search = new URLSearchParams({ term, entity, country, limit: String(limit), offset: String(offset) }).toString();
  const upstream = await fetch(target, { headers: { Accept: 'application/json' } });
  if (!upstream.ok) return Response.json({ error: 'Music search is temporarily unavailable.' }, { status: 502 });
  return new Response(upstream.body, { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=120, s-maxage=600' } });
}
