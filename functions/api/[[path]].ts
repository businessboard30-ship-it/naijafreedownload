// Catch-all so unknown API paths return JSON 404 instead of the SPA HTML.
export const onRequest = () =>
  Response.json({ error: 'Unknown API endpoint.' }, { status: 404, headers: { 'cache-control': 'no-store' } });
