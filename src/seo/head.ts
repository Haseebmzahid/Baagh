import { absoluteUrl, verification } from './config';
import type { SeoPage } from './pages';

export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));
export const schemaJson = (page: SeoPage) => JSON.stringify({ '@context': 'https://schema.org', '@graph': page.schema }).replace(/</g, '\\u003c');
export function headEntries(page: SeoPage): { tag: 'meta' | 'link'; attrs: Record<string, string> }[] {
  return [
    { tag: 'meta', attrs: { name: 'description', content: page.description } },
    { tag: 'meta', attrs: { name: 'robots', content: page.index ? 'index, follow, max-image-preview:large' : 'noindex, follow' } },
    ...(page.index || page.path === '/basket' ? [{ tag: 'link' as const, attrs: { rel: 'canonical', href: absoluteUrl(page.path) } }] : []),
    ...Object.entries({ 'og:type': 'website', 'og:site_name': 'BAAGH', 'og:locale': 'en_US', 'og:title': page.title, 'og:description': page.description, ...(page.index ? { 'og:url': absoluteUrl(page.path) } : {}), 'og:image': absoluteUrl(page.image), 'og:image:alt': 'An assortment of fresh fruit — BAAGH reference photography' }).map(([property, content]) => ({ tag: 'meta' as const, attrs: { property, content } })),
    ...Object.entries({ 'twitter:card': 'summary_large_image', 'twitter:title': page.title, 'twitter:description': page.description, 'twitter:image': absoluteUrl(page.image), 'twitter:image:alt': 'An assortment of fresh fruit — BAAGH reference photography' }).map(([name, content]) => ({ tag: 'meta' as const, attrs: { name, content } })),
    ...Object.entries({ 'google-site-verification': verification.google, 'msvalidate.01': verification.bing }).filter(([, content]) => content.trim()).map(([name, content]) => ({ tag: 'meta' as const, attrs: { name, content } })),
  ];
}
export function renderHead(page: SeoPage) {
  return `<title>${escapeHtml(page.title)}</title>\n` + headEntries(page).map(({ tag, attrs }) => `<${tag} data-baagh-seo ${Object.entries(attrs).map(([key, value]) => `${key}="${escapeHtml(value)}"`).join(' ')}>`).join('\n') + (page.schema.length ? `\n<script data-baagh-seo type="application/ld+json">${schemaJson(page)}</script>` : '');
}
export function applySeo(page: SeoPage) {
  document.title = page.title;
  document.querySelectorAll('[data-baagh-seo]').forEach(element => element.remove());
  for (const { tag, attrs } of headEntries(page)) {
    const element = document.createElement(tag);
    element.setAttribute('data-baagh-seo', '');
    for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
    document.head.append(element);
  }
  if (page.schema.length) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-baagh-seo', '');
    script.textContent = schemaJson(page);
    document.head.append(script);
  }
}
