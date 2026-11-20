const ANILIST = 'https://graphql.anilist.co';

const MEDIA_FIELDS = `
  id
  title { romaji english native }
  coverImage { large extraLarge }
  description(asHtml: false)
  averageScore
  episodes
  status
  format
  season
  seasonYear
  startDate { year month day }
  genres
  siteUrl
  studios(isMain: true) { nodes { name } }
`;

function dateText(d: any) {
  if (!d?.year) return null;
  return [d.year, d.month, d.day].filter(Boolean).join('-');
}

function mediaItem(m: any) {
  return {
    mal_id: m.id,
    url: m.siteUrl,
    title: m.title?.romaji || m.title?.english || 'Untitled anime',
    title_english: m.title?.english || null,
    title_japanese: m.title?.native || null,
    synopsis: m.description || null,
    images: { jpg: { large_image_url: m.coverImage?.extraLarge || m.coverImage?.large, image_url: m.coverImage?.large } },
    score: m.averageScore == null ? null : m.averageScore / 10,
    year: m.seasonYear || m.startDate?.year || null,
    season: m.season?.toLowerCase() || null,
    episodes: m.episodes,
    status: m.status,
    type: m.format,
    genres: (m.genres || []).map((name: string) => ({ name })),
    aired: { from: dateText(m.startDate), string: dateText(m.startDate) },
    studios: (m.studios?.nodes || []).map((s: any) => ({ name: s.name })),
  };
}

function characterItem(c: any) {
  return {
    mal_id: c.id,
    name: c.name?.full || 'Unknown character',
    name_kanji: c.name?.native || null,
    about: c.description || null,
    images: { jpg: { image_url: c.image?.large } },
    anime: (c.media?.nodes || []).map((m: any) => ({
      role: 'Appears in',
      anime: { mal_id: m.id, title: m.title?.english || m.title?.romaji || 'Untitled anime', images: { jpg: { image_url: m.coverImage?.large } } },
    })),
    voices: (c.voiceActors || []).map((v: any) => ({
      language: v.languageV2 || 'Voice actor',
      person: { mal_id: v.id, name: v.name?.full || 'Unknown voice actor' },
    })),
  };
}

const MEDIA_QUERY = `query ($page:Int,$perPage:Int,$search:String,$season:MediaSeason,$seasonYear:Int,$sort:[MediaSort],$id:Int) {
  Page(page:$page,perPage:$perPage) {
    pageInfo { currentPage lastPage hasNextPage total }
    media(id:$id,search:$search,season:$season,seasonYear:$seasonYear,sort:$sort,type:ANIME,isAdult:false) { ${MEDIA_FIELDS} }
  }
}`;

async function gql(query: string, variables: Record<string, unknown>) {
  const response = await fetch(ANILIST, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const body: any = await response.json().catch(() => ({}));
  if (!response.ok || body.errors?.length) {
    const status = response.status || body.errors?.[0]?.status || 502;
    const message = status === 429 ? 'AniList is rate-limiting requests. Please wait a moment and try again.' :
      status === 403 ? 'AniList is temporarily restricting API access. Please try again later.' :
      body.errors?.[0]?.message || 'AniList is temporarily unavailable.';
    throw new Response(JSON.stringify({ error: message }), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  }
  return body.data;
}

function json(data: unknown, status = 200, cache = 300) {
  return Response.json(data, { status, headers: { 'Cache-Control': `public, max-age=60, s-maxage=${cache}, stale-while-revalidate=300` } });
}

export async function onRequest({ request }: { request: Request }) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed.' }, 405, 0);
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/anime\/?/, '').replace(/\/$/, '');
  const page = Math.max(1, Math.min(100, Number(url.searchParams.get('page') || 1)));
  const perPage = Math.max(1, Math.min(24, Number(url.searchParams.get('limit') || 24)));
  const q = (url.searchParams.get('q') || '').slice(0, 100);

  try {
    if (path === 'seasons/now' || path === 'seasons/upcoming' || path === 'top/anime' || path === 'anime') {
      const vars: any = { page, perPage, sort: ['POPULARITY_DESC'] };
      if (path === 'seasons/now') {
        const now = new Date();
        const month = now.getUTCMonth() + 1;
        vars.seasonYear = now.getUTCFullYear();
        vars.season = month <= 3 ? 'WINTER' : month <= 6 ? 'SPRING' : month <= 9 ? 'SUMMER' : 'FALL';
        vars.sort = ['POPULARITY_DESC'];
      } else if (path === 'seasons/upcoming') {
        const now = new Date();
        const month = now.getUTCMonth() + 1;
        const season = month <= 3 ? 'SPRING' : month <= 6 ? 'SUMMER' : month <= 9 ? 'FALL' : 'WINTER';
        vars.seasonYear = month === 12 ? now.getUTCFullYear() + 1 : now.getUTCFullYear();
        vars.season = season;
        vars.sort = ['POPULARITY_DESC'];
      } else if (path === 'top/anime') {
        vars.sort = url.searchParams.get('order_by') === 'score' ? ['SCORE_DESC'] : ['POPULARITY_DESC'];
      } else {
        vars.search = q;
        vars.sort = ['SEARCH_MATCH'];
      }
      const data = await gql(MEDIA_QUERY, vars);
      const p = data.Page.pageInfo;
      return json({ data: data.Page.media.map(mediaItem), pagination: { last_visible_page: p.lastPage, has_next_page: p.hasNextPage } });
    }

    const animeFull = path.match(/^anime\/(\d+)\/full$/);
    if (animeFull) {
      const data = await gql(`query ($id:Int) { Media(id:$id,type:ANIME) { ${MEDIA_FIELDS} } }`, { id: Number(animeFull[1]) });
      return data.Media ? json({ data: mediaItem(data.Media) }) : json({ error: 'Anime not found.' }, 404);
    }

    const animeCharacters = path.match(/^anime\/(\d+)\/characters$/);
    if (animeCharacters) {
      const data = await gql(`query ($id:Int) { Media(id:$id,type:ANIME) { characters(page:1,perPage:25,sort:ROLE) { edges { role node { id name { full native } image { large } description(asHtml:false) } voiceActors(language:JAPANESE) { id name { full } languageV2 } } } } }`, { id: Number(animeCharacters[1]) });
      const edges = data.Media?.characters?.edges || [];
      return json({ data: edges.map((e: any) => ({ role: e.role, character: { mal_id: e.node.id, name: e.node.name?.full, images: { jpg: { image_url: e.node.image?.large } } }, voice_actors: (e.voiceActors || []).map((v: any) => ({ language: v.languageV2, person: { mal_id: v.id, name: v.name?.full } })) })) });
    }

    if (path === 'characters') {
      const data = await gql(`query ($page:Int,$perPage:Int,$search:String) { Page(page:$page,perPage:$perPage) { characters(search:$search,sort:SEARCH_MATCH) { id name { full native } image { large } description(asHtml:false) } } }`, { page, perPage, search: q });
      return json({ data: (data.Page.characters || []).map((c: any) => characterItem(c)) });
    }

    const characterFull = path.match(/^characters\/(\d+)\/full$/);
    if (characterFull) {
      const data = await gql(`query ($id:Int) { Character(id:$id) { id name { full native } image { large } description(asHtml:false) media(page:1,perPage:30,sort:POPULARITY_DESC) { nodes { id title { english romaji } coverImage { large } } } } }`, { id: Number(characterFull[1]) });
      return data.Character ? json({ data: characterItem(data.Character) }) : json({ error: 'Character not found.' }, 404);
    }

    return json({ error: 'Anime endpoint not found.' }, 404, 0);
  } catch (error: any) {
    if (error instanceof Response) return error;
    return json({ error: 'AniList could not complete this request. Please try again shortly.' }, 502, 0);
  }
}
