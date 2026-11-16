import { sitePageForPath, type SitePageId } from '../data/sitePageRegistry.ts';

export type ViewMode = 'journey' | 'fruit-intelligence' | 'everyday-fresh' | 'product' | 'basket' | 'signature' | 'not-found' | 'information';
export interface ProductRoute { categorySlug: string; slug: string }
export interface ResolvedRoute { view: ViewMode; fruit?: string; product?: ProductRoute; page?: SitePageId }

/** Resolve before first render: a direct shop visit must not boot the journey. */
export function resolveRoute(pathname: string, hash = '', queryFruit: string | null = null): ResolvedRoute {
  const path = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  const fragment = hash.toLowerCase();
  const fruits = ['chaunsa','kinnow','apple','anaar'];
  if (fragment === '#story') return {view:'information',page:'our-story'};
  if (fragment === '#journey') return {view:'journey'};
  if (fragment === '#everyday-fresh') return {view:'everyday-fresh'};
  if (fragment === '#signature' || fragment === '#signature-collection') return {view:'signature'};
  if (fragment === '#basket' || fragment === '#order') return {view:'basket'};
  if (fragment === '#fruit-intelligence' || fruits.includes(fragment.slice(1))) return {view:'fruit-intelligence',fruit:fruits.includes(fragment.slice(1)) ? fragment.slice(1) : 'chaunsa'};
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 3 && ['product','everyday-fresh'].includes(parts[0])) return {view:'product',product:{categorySlug:parts[1],slug:parts[2]}};
  if (path === '/everyday-fresh') return {view:'everyday-fresh'};
  if (path === '/signature') return {view:'signature'};
  if (path === '/basket') return {view:'basket'};
  const page = sitePageForPath(path);
  if (page) return {view:'information',page};
  if (path === '/fruit-intelligence' || (parts.length === 2 && parts[0] === 'fruit-intelligence' && fruits.includes(parts[1]))) return {view:'fruit-intelligence',fruit:fruits.includes(parts[1]) ? parts[1] : 'chaunsa'};
  if (path === '/' && queryFruit && fruits.includes(queryFruit)) return {view:'fruit-intelligence',fruit:queryFruit};
  return {view:path === '/' ? 'journey' : 'not-found'};
}

/** Category hashes remain shareable and restore correctly with Back/Forward. */
export function collectionFromHash(hash: string, filters: readonly { id: string }[]): { filter: string; target?: string } {
  const category = hash.toLowerCase().replace(/^#/, '');
  if (category === 'boxes' || category === 'family') return { filter: 'all', target: 'boxes' };
  if (category === 'ready-today') return { filter: 'all', target: 'ready-today' };
  if (filters.some(filter => filter.id === category)) return { filter: category, target: 'ready-today' };
  return { filter: 'all' };
}
