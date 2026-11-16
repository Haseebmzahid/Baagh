import { categoryLabel, getProduct, products, routeOf } from '../data/catalogue';
import { sitePageMeta, type SitePageId } from '../data/sitePageRegistry';
import { resolveRoute, type ResolvedRoute } from '../navigation/route';
import { absoluteUrl } from './config';

export interface SeoPage {
  path: string;
  title: string;
  description: string;
  label: string;
  image: string;
  index: boolean;
  schema: Record<string, unknown>[];
}
const organization = { '@type': 'Organization', '@id': absoluteUrl('/#organization'), name: 'BAAGH', url: absoluteUrl('/') };
const website = { '@type': 'WebSite', '@id': absoluteUrl('/#website'), name: 'BAAGH', url: absoluteUrl('/'), publisher: { '@id': organization['@id'] }, inLanguage: 'en' };

function page(path: string, label: string, title: string, description: string): SeoPage {
  return { path, label, title, description, image: '/images/fruit/mixed.webp', index: true,
    schema: [organization, website, { '@type': 'WebPage', '@id': absoluteUrl(`${path}#webpage`), url: absoluteUrl(path), name: title, description, isPartOf: { '@id': website['@id'] } }] };
}
function breadcrumbs(items: { name: string; path: string }[]) {
  return { '@type': 'BreadcrumbList', itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: absoluteUrl(item.path) })) };
}

export function seoForRoute(route: ResolvedRoute): SeoPage {
  if (route.view === 'journey') return page('/', 'BAAGH', 'BAAGH — Fruit you never have to doubt.', 'Discover BAAGH through its fruit journey, Everyday Fresh collection, Signature gifting and interactive Fruit Intelligence guides.');
  if (route.view === 'everyday-fresh') return page('/everyday-fresh', 'Everyday Fresh', 'Everyday Fresh — Fruit Collection | BAAGH', 'Explore the BAAGH Everyday Fresh fruit collection. Compare fruit and pack options, learn about each selection and prepare a WhatsApp order request.');
  if (route.view === 'signature') return page('/signature', 'Signature', 'Signature — Fruit Gifting | BAAGH', 'Explore BAAGH Signature fruit gifting, presentation boxes and corporate gifting enquiries. Discuss your occasion and requirements with the BAAGH team.');
  if (route.view === 'information' && route.page) {
    const content = sitePageMeta[route.page];
    const result = page(`/${route.page}`, content.label, `${content.label} | BAAGH`, content.intro);
    result.schema.push(breadcrumbs([{ name: 'BAAGH', path: '/everyday-fresh' }, { name: content.label, path: result.path }]));
    return result;
  }
  if (route.view === 'product' && route.product) {
    const product = getProduct(route.product.categorySlug, route.product.slug);
    if (product) {
      const result = page(routeOf(product), product.name, `${product.name} — Everyday Fresh | BAAGH`, `Explore ${product.name} in the BAAGH Everyday Fresh collection. Review fruit details and pack options, and discover its Fruit Intelligence guide.`);
      result.schema.push({ '@type': 'Product', '@id': absoluteUrl(`${result.path}#product`), name: product.name, description: product.shortDescription, url: absoluteUrl(result.path), brand: { '@type': 'Brand', name: 'BAAGH' }, ...(product.image.src ? { image: absoluteUrl(product.image.src) } : {}) });
      result.schema.push(breadcrumbs([{ name: 'Everyday Fresh', path: '/everyday-fresh' }, { name: categoryLabel(product.category), path: '/everyday-fresh' }, { name: product.name, path: result.path }]));
      return result;
    }
  }
  if (route.view === 'fruit-intelligence') {
    const product = products.find(item => item.fruitIntelligenceSlug === route.fruit);
    if (product) return page(`/fruit-intelligence/${route.fruit}`, product.name, `${product.name} — Fruit Intelligence | BAAGH`, `Explore ${product.name} with BAAGH Fruit Intelligence. Inspect its outer characteristics and inner anatomy through an interactive study or the reading view.`);
  }
  const result = page(route.view === 'basket' ? '/basket' : '/404', route.view === 'basket' ? 'Your basket' : 'Page not found', `${route.view === 'basket' ? 'Your basket' : 'Page not found'} | BAAGH`, route.view === 'basket' ? 'Review your BAAGH fruit selections and prepare an order request.' : 'This BAAGH page could not be found. Explore Everyday Fresh or return to the fruit journey.');
  result.index = false;
  result.schema = [];
  return result;
}

export const publicPages = [
  seoForRoute({ view: 'journey' }), seoForRoute({ view: 'everyday-fresh' }), seoForRoute({ view: 'signature' }),
  ...products.map(product => seoForRoute({ view: 'product', product: { categorySlug: product.category, slug: product.slug } })),
  ...products.filter(product => product.fruitIntelligenceSlug).map(product => seoForRoute({ view: 'fruit-intelligence', fruit: product.fruitIntelligenceSlug })),
  ...(Object.keys(sitePageMeta) as SitePageId[]).map(id => seoForRoute({ view: 'information', page: id })),
];

// Existing aliases keep their behaviour and point to one canonical page.
export const aliasPaths = ['/about', '/about-us', '/contact-us', '/privacy', '/cookie-policy', '/terms-and-conditions', '/faq', '/shipping-policy', '/refund-policy', '/fruit-intelligence', ...products.map(product => `/everyday-fresh/${product.category}/${product.slug}`)];
export const seoForPath = (path: string) => seoForRoute(resolveRoute(path));
