export type SitePageId = 'our-story' | 'contact' | 'privacy-policy' | 'cookies' | 'terms' | 'delivery' | 'returns' | 'help';

export const sitePageMeta = {
  'our-story': { label: 'Our Story', intro: 'Three generations of wholesale judgement, brought to the everyday table.' },
  contact: { label: 'Contact us', intro: 'Contact BAAGH for fruit orders, Signature gifting and help with your request.' },
  'privacy-policy': { label: 'Privacy policy', intro: 'How BAAGH handles your basket, enquiry details and external services.' },
  cookies: { label: 'Cookies & storage', intro: 'How BAAGH remembers your basket in your browser.' },
  terms: { label: 'Ordering terms', intro: 'How order requests, provisional prices and confirmation work at BAAGH.' },
  delivery: { label: 'Delivery information', intro: 'Discuss delivery destinations, charges and timing with the BAAGH team.' },
  returns: { label: 'Order support', intro: 'Help with fruit quality, changes, cancellations and delivery concerns.' },
  help: { label: 'Help & FAQs', intro: 'Answers about shopping, gift enquiries and ordering through WhatsApp.' },
} as const;

export function sitePageForPath(path: string): SitePageId | undefined {
  const id = path.toLowerCase().replace(/^\/|\/+$/g, '');
  const aliases: Record<string, SitePageId> = { about: 'our-story', 'about-us': 'our-story', 'contact-us': 'contact', privacy: 'privacy-policy', 'cookie-policy': 'cookies', 'terms-and-conditions': 'terms', faq: 'help', 'shipping-policy': 'delivery', 'refund-policy': 'returns' };
  return (Object.hasOwn(aliases, id) ? aliases[id] : undefined) ?? (Object.hasOwn(sitePageMeta, id) ? id as SitePageId : undefined);
}
