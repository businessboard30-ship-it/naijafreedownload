// Serves real build assets; a missing asset must be a genuine 404, never the
// SPA index.html with a 200 status (which browsers reject as a JS MIME error).
interface Env { ASSETS: { fetch: (req: Request) => Promise<Response> } }

export const onRequest = async ({ request, env }: { request: Request; env: Env }) => {
  const res = await env.ASSETS.fetch(request);
  const type = res.headers.get('content-type') ?? '';
  if (res.status === 404 || type.includes('text/html')) {
    return new Response('Not found', {
      status: 404,
      headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
    });
  }
  return res;
};
