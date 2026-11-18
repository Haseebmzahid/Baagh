import { resolveRoute, type ResolvedRoute } from '../navigation/route';

export const prerenderPaths = ['/product/mangoes/chaunsa', '/everyday-fresh', '/signature', '/our-story'] as const;
export type PrerenderPath = typeof prerenderPaths[number];

export interface PrerenderBootstrap {
  version: 1;
  pathname: PrerenderPath;
  hash: '';
  route: ResolvedRoute;
}
export function routeBootstrap(pathname: PrerenderPath): PrerenderBootstrap {
  return { version: 1, pathname, hash: '', route: resolveRoute(pathname) };
}
export function chaunsaBootstrap(): PrerenderBootstrap {
  const pathname = '/product/mangoes/chaunsa';
  return { version: 1, pathname, hash: '', route: resolveRoute(pathname) };
}
export function readBootstrap(): PrerenderBootstrap | undefined {
  const element = document.getElementById('baagh-prerender');
  if (!element) return;
  const data = JSON.parse(element.textContent ?? '') as PrerenderBootstrap;
  if (data.version !== 1 || !prerenderPaths.includes(data.pathname) || data.hash !== '' ||
    JSON.stringify(data.route) !== JSON.stringify(resolveRoute(data.pathname))) throw new Error('Invalid BAAGH prerender bootstrap');
  return data;
}
