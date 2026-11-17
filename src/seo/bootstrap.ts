import { resolveRoute, type ResolvedRoute } from '../navigation/route';

export interface PrerenderBootstrap {
  version: 1;
  pathname: '/product/mangoes/chaunsa';
  hash: '';
  route: ResolvedRoute;
}
export function chaunsaBootstrap(): PrerenderBootstrap {
  const pathname = '/product/mangoes/chaunsa';
  return { version: 1, pathname, hash: '', route: resolveRoute(pathname) };
}
export function readBootstrap(): PrerenderBootstrap | undefined {
  const element = document.getElementById('baagh-prerender');
  if (!element) return;
  const data = JSON.parse(element.textContent ?? '') as PrerenderBootstrap;
  if (data.version !== 1 || data.pathname !== '/product/mangoes/chaunsa' || data.hash !== '' ||
    JSON.stringify(data.route) !== JSON.stringify(resolveRoute(data.pathname))) throw new Error('Invalid BAAGH prerender bootstrap');
  return data;
}
