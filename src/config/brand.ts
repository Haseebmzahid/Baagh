export interface BrandLink {
  label: string;
  href: string;
  primary?: boolean;
}

export interface BrandConfig {
  name: string;
  establishedYear: string;
  tagline: string;
  heroHeadline: string;
  heroSubline: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  navLinks: BrandLink[];
  wordmarkSvg?: string;
}

export const brandConfig: BrandConfig = {
  name: 'BAAGH',
  establishedYear: '1961',
  tagline: 'Fruit you never have to doubt.',
  heroHeadline: 'Fruit you never have to doubt.',
  heroSubline: 'CHOSEN WITH GENERATIONS OF FRUIT EXPERTISE',
  primaryCtaLabel: 'EXPLORE EVERYDAY FRESH',
  secondaryCtaLabel: 'DISCOVER SIGNATURE COLLECTION',
  navLinks: [
    { label: 'Everyday Fresh', href: '/everyday-fresh' },
    { label: 'Signature', href: '/signature' },
    { label: 'Our Story', href: '/our-story' },
    { label: 'Fruit Intelligence', href: '#fruit-intelligence' },
    { label: 'Corporate', href: '/signature#corporate' },
    { label: 'WhatsApp Order', href: '/basket', primary: true }
  ]
};
