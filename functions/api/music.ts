const ENTITIES = new Set(['musicTrack', 'musicArtist', 'album']);
const CHARTS = new Set(['songs', 'albums']);

async function handle(request: Request) {
  const incoming = new URL(request.url);
  const term = (incoming.searchParams.get('term') || '').trim().slice(0, 100);
  const entity = incoming.searchParams.get('entity') || 'musicTrack';
  const country = (incoming.searchParams.get('country') || 'GH').slice(0, 2).toLowerCase();
  const limit = Math.min(50, Math.max(1, Number(incoming.searchParams.get('limit')) || 25));
  const offset = Math.max(0, Number(incoming.searchParams.get('offset')) || 0);
  const chart = incoming.searchParams.get('chart') || '';

  const lookup = incoming.searchParams.get('lookup') || '';
  if (lookup) {
    if (!/^\d{1,15}$/.test(lookup)) return Response.json({ error: 'Invalid music id.' }, { status: 400 });
    const target = new URL('https://itunes.apple.com/lookup');
    target.search = new URLSearchParams({ id: lookup, country: country.toUpperCase(), entity: incoming.searchParams.get('entity') === 'song' ? 'song' : '' }).toString();
    const upstream = await fetch(target, { headers: { Accept: 'application/json' } });
    if (!upstream.ok) return Response.json({ error: 'Music details are temporarily unavailable.' }, { status: 502 });
    const found = await upstream.json() as { resultCount?: number };
    if (!found.resultCount) return Response.json({ error: 'No music item with that id.' }, { status: 404 });
    return Response.json(found, { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=3600' } });
  }

  if (!/^[a-z]{2}$/.test(country)) return Response.json({ error: 'Choose a valid two-letter store region.' }, { status: 400 });

  if (chart) {
    if (!CHARTS.has(chart)) return Response.json({ error: 'Unsupported chart type.' }, { status: 400 });
    const target = new URL(`https://rss.applemarketingtools.com/api/v2/${country}/music/most-played/${limit}/${chart}.json`);
    const upstream = await fetch(target, { headers: { Accept: 'application/json' } });
    if (!upstream.ok) return Response.json({ error: 'Music charts are temporarily unavailable for this region.' }, { status: 502 });
    const payload = await upstream.json() as { feed?: { results?: Array<Record<string, unknown>> } };
    const results = (payload.feed?.results || []).map((item) => ({
      trackId: item.id,
      trackName: item.name,
      artistName: item.artistName,
      artworkUrl100: item.artworkUrl100,
      trackViewUrl: item.url,
      collectionViewUrl: item.url,
      primaryGenreName: Array.isArray(item.genres) ? (item.genres[0] as { name?: string })?.name : undefined,
    }));
    return Response.json({ resultCount: results.length, results }, { headers: { 'Cache-Control': 'public, max-age=120, s-maxage=600' } });
  }

  if (!term) return Response.json({ resultCount: 0, results: [] });
  if (!ENTITIES.has(entity)) return Response.json({ error: 'Unsupported music search type.' }, { status: 400 });
  const target = new URL('https://itunes.apple.com/search');
  target.search = new URLSearchParams({ term, entity, country: country.toUpperCase(), limit: String(limit), offset: String(offset) }).toString();
  const upstream = await fetch(target, { headers: { Accept: 'application/json' } });
  if (!upstream.ok) return Response.json({ error: 'Music search is temporarily unavailable.' }, { status: 502 });
  return new Response(upstream.body, { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=120, s-maxage=600' } });
}

export async function onRequest({ request }: { request: Request }) {
  try { return await handle(request); }
  catch { return Response.json({ error: 'Music information is temporarily unavailable.' }, { status: 502 }); }
}
