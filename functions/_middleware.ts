/**
 * Runs in front of every non-static request on Cloudflare Pages.
 *  - Unknown page addresses get a real HTTP 404 (the single-page app would otherwise answer 200).
 *  - Known pages get their own title, description, canonical URL, robots directive and crawlable
 *    fallback content in the HTML, before any JavaScript runs.
 *  - Missing files (anything with an extension) get a real 404 instead of the app shell.
 */
import { planFor, escapeHtml } from '../src/lib/prerender';

declare const HTMLRewriter: any;
interface Env { ASSETS: { fetch: (input: Request | string | URL) => Promise<Response> } }

export const onRequest = async ({ request, env, next }: { request: Request; env: Env; next: () => Promise<Response> }) => {
  const url = new URL(request.url);
  const path = url.pathname;

  if (!['GET', 'HEAD'].includes(request.method) || path.startsWith('/api/')) return next();
  // Google Search Console verification file (the platform redirects /googleXXXX.html to /googleXXXX).
  if (/^\/google[0-9a-f]{16}$/.test(path)) return next();

  if (/\.[a-z0-9]+$/i.test(path) && !path.endsWith('.html')) {
    const res = await next();
    if (res.status === 404 || (res.headers.get('content-type') ?? '').includes('text/html')) {
      return new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' } });
    }
    return res;
  }
  if (path.endsWith('.html')) return next();

  if (path.length > 1 && path.endsWith('/')) {
    url.pathname = path.replace(/\/+$/, '') || '/';
    return Response.redirect(url.toString(), 301);
  }

  const shell = await env.ASSETS.fetch(new URL('/', url));
  if (!shell.ok) return shell;
  const plan = planFor(path); // canonical always points at the production origin
  const headers = new Headers(shell.headers);
  headers.set('cache-control', plan.status === 404 ? 'public, max-age=60' : 'public, max-age=0, must-revalidate');
  if (plan.robots.startsWith('noindex')) headers.set('x-robots-tag', 'noindex');

  const setContent = (value: string) => ({ element: (e: any) => e.setAttribute('content', value) });
  const rewritten = new HTMLRewriter()
    .on('title', { element: (e: any) => e.setInnerContent(plan.title) })
    .on('meta[name="description"]', setContent(plan.description))
    .on('meta[name="robots"]', setContent(plan.robots))
    .on('meta[property="og:title"]', setContent(plan.title))
    .on('meta[property="og:description"]', setContent(plan.description))
    .on('head', {
      element: (e: any) => e.append(
        `<link rel="canonical" href="${escapeHtml(plan.canonical)}"><meta property="og:url" content="${escapeHtml(plan.canonical)}"><meta name="twitter:card" content="summary">`,
        { html: true },
      ),
    })
    .on('div#root', { element: (e: any) => e.setInnerContent(plan.bodyHtml, { html: true }) })
    .transform(new Response(shell.body, { status: plan.status, headers }));
  return request.method === 'HEAD' ? new Response(null, { status: plan.status, headers: rewritten.headers }) : rewritten;
};
