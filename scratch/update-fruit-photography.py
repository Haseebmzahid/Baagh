from pathlib import Path
base=Path('src/components/commercial')
(base/'FruitPhoto.tsx').write_text('''import React from 'react';
import './fruitPhoto.css';

/** Licensed reference photography, never a claim about a particular crop or pack. */
export const fruitPhotos: Record<string, string> = {
  chaunsa: '/images/fruit/mango.webp',
  kinnow: '/images/fruit/citrus.webp',
  apple: '/images/fruit/apple.jpg',
  anaar: '/images/fruit/pomegranate.webp',
  mixed: '/images/fruit/mixed.webp',
};

export const FruitPhoto: React.FC<{
  fruit?: string; ratio?: string; priority?: boolean; alt?: string;
}> = ({ fruit = 'mixed', ratio = '4 / 5', priority = false, alt }) => (
  <div className="fruit-photo" style={{ aspectRatio: ratio }}>
    <img key={fruit} src={fruitPhotos[fruit] ?? fruitPhotos.mixed}
      alt={alt ?? ({ chaunsa: 'Ripe mangoes', kinnow: 'Fresh citrus fruit', apple: 'Red apples on a dark cloth', anaar: 'Pomegranates and citrus fruit' }[fruit] ?? 'An assortment of fresh fruit')}
      loading={priority ? 'eager' : 'lazy'} decoding="async" />
  </div>
);
''')
(base/'fruitPhoto.css').write_text('''.fruit-photo { position:relative; width:100%; overflow:hidden; background:#211e17; }
.fruit-photo img { display:block; width:100%; height:100%; position:absolute; inset:0; object-fit:cover; transition:transform 600ms cubic-bezier(.2,.7,.3,1); animation:fruitPhotoReveal 400ms ease-out; }
@media(hover:hover) and (prefers-reduced-motion:no-preference) { .fruit-photo:hover img { transform:scale(1.035); } }
@keyframes fruitPhotoReveal { from {opacity:.35} to {opacity:1} }
.everyday-product-portrait { object-fit:cover; }
.signature-photo-hero { position:absolute; inset:0; }
.signature-photo-hero .fruit-photo { height:100%; }
.signature-photo-hero::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,rgba(16,15,10,.92),rgba(16,15,10,.25)),linear-gradient(0deg,#100f0a,transparent 65%); }
.shopping-guide { padding:22px 0; margin-bottom:16px; border-bottom:1px solid rgba(244,238,226,.14); color:#e8ddc9; font:16px/1.7 Georgia,serif; }
.shopping-guide a { color:#e8cfa0; text-decoration:underline; text-underline-offset:4px; }
.collection-shop-link { display:inline-flex; align-items:center; min-height:44px; margin-top:12px; color:#e8cfa0; font:13px/1.5 sans-serif; text-decoration:underline; text-underline-offset:4px; }
@media(max-width:760px) { .signature-photo-hero::after { background:linear-gradient(0deg,rgba(16,15,10,.98),rgba(16,15,10,.2)),linear-gradient(90deg,rgba(16,15,10,.4),transparent); } }
@media(prefers-reduced-motion:reduce) { .fruit-photo img { animation:none; transition:none; } }
''')
p=base/'EverydayShowcase.tsx';s=p.read_text(encoding='utf-8');s=s.replace("import { CommerceStage } from './CommerceStage';\nimport type { CommerceStudy } from './commerceStageScene';", "import { FruitPhoto } from './FruitPhoto';")
s=s.replace('  onPortrait: (id: string, source: string) => void;\n','').replace('({ onNavigateRoute, onPortrait })','({ onNavigateRoute })')
s=s.replace("  const studies = useMemo<CommerceStudy[]>(() => products.map((product) => ({id:product.id,fruit:product.fruitIntelligenceSlug!})),[products]);\n",'')
s=s.replace('<CommerceStage product={product} studies={studies} onPortrait={onPortrait}/>','<FruitPhoto fruit={product.id} ratio="4 / 3" priority />')
s=s.replace('A closer look at good fruit. Thoughtfully chosen for the everyday table.','Good fruit, clearly chosen. Pick your fruit and pack, then send your order request on WhatsApp.').replace('Explore {product.shortName}','Choose {product.shortName} pack').replace('Choose a fruit study','Choose a fruit').replace('Explore the fruit study','Ask us about availability')
p.write_text(s, encoding='utf-8')
p=base/'EverydayFresh.tsx';s=p.read_text(encoding='utf-8');s=s.replace('useCallback, useMemo, useState','useMemo, useState');s=s.replace("import { EverydayShowcase }", "import { FruitPhoto, fruitPhotos } from './FruitPhoto';\nimport { EverydayShowcase }")
s=s.replace('  const [portraits, setPortraits] = useState<Record<string,string>>({});\n  const onPortrait = useCallback((id: string, source: string) => setPortraits((previous) => ({...previous,[id]:source})),[]);','  const portraits = fruitPhotos;')
s=s.replace(' onPortrait={onPortrait}','').replace('<SeasonSection />','<p className="shopping-guide">1. Choose your fruit &nbsp; → &nbsp; 2. Select a pack &nbsp; → &nbsp; 3. <a href="/basket" onClick={(event) => { event.preventDefault(); onNavigateRoute(\'/basket\'); }}>Review basket</a> &amp; request on WhatsApp.<br /><small>Our team confirms availability, final prices and delivery before your order is confirmed. Reference fruit photography; actual fruit and packaging may vary.</small></p>')
s=s.replace('<CategoriesSection onNavigateRoute={onNavigateRoute} portraits={portraits} />','<CategoriesSection onNavigateRoute={onNavigateRoute} portraits={portraits} />')
s=s.replace('<FinalCtaSection onNavigateRoute={onNavigateRoute} />','<SeasonSection />\n\n        <FinalCtaSection onNavigateRoute={onNavigateRoute} />')
s=s.replace('portraits[productsInCategory(cat.id)[0]?.id ?? boxes[0].productIds[0]]','portraits[productsInCategory(cat.id)[0]?.id ?? \'mixed\']')
s=s.replace('three-dimensional study','reference fruit photograph')
s=s.replace('<SpecimenPlate tint={primary.tint} ratio={isMobile ? \'3 / 2\' : \'16 / 10\'} />', '<FruitPhoto fruit="mixed" ratio={isMobile ? \'3 / 2\' : \'16 / 10\'} />')
s=s.replace('<SpecimenPlate tint={b.tint} ratio="1 / 1" />','<FruitPhoto fruit={b.productIds.length === 1 ? b.productIds[0] : \'mixed\'} ratio="1 / 1" />')
p.write_text(s, encoding='utf-8')
# The same photo follows the customer from discovery to pack selection and basket.
(base/'ProductSpecimen.tsx').write_text('''import React from 'react';
import type { Product } from '../../data/catalogue';
import { FruitPhoto } from './FruitPhoto';

export interface ProductSpecimenProps { product: Product; ratio?: string; compact?: boolean; }
export const ProductSpecimen: React.FC<ProductSpecimenProps> = ({ product, ratio = '1 / 1', compact = false }) => (
  <FruitPhoto fruit={product.id} ratio={ratio} priority={!compact} />
);
''')
p=base/'ProductCard.tsx';s=p.read_text(encoding='utf-8');s=s.replace("import { useBasket }", "import { fruitPhotos } from './FruitPhoto';\nimport './everydayShowcase.css';\nimport { useBasket }")
s=s.replace('  portraitSrc,\n}) => {','  portraitSrc = fruitPhotos[product.id],\n}) => {',1)
s=s.replace('fruit study','fruit photograph').replace('src={product.image.src ?? portraitSrc} alt=', 'loading="lazy" decoding="async" src={product.image.src ?? portraitSrc} alt=')
s=s.replace('src={portraitSrc} alt=', 'loading="lazy" decoding="async" src={portraitSrc} alt=')
s=s.replace('color: on ? c.color.goldHover : c.color.ink42,','color: on ? c.color.goldHover : c.color.gold80,').replace('        Add\n','        Add to basket\n').replace('      Add\n','      Add to basket\n')
p.write_text(s, encoding='utf-8')
p=base/'Signature.tsx';s=p.read_text(encoding='utf-8');s=s.replace('  SpecimenPlate,\n','');s=s.replace("import { PresentationBox }", "import { FruitPhoto } from './FruitPhoto';\nimport { ProductCard } from './ProductCard';\nimport { PresentationBox }")
s=s.replace('  boxSpecification,','  boxSpecification,\n  signatureProducts,\n  routeOf,')
s=s.replace('<CollectionsSection />','''<p className="shopping-guide">Choose fruit &amp; a pack below, add to your basket, then send a WhatsApp request. Our team confirms prices, availability and delivery.<br /><small>Reference fruit photography; actual fruit and packaging may vary. Gift boxes are available by enquiry.</small></p>
        <Section id="signature-fruit" title="Choose your fruit" lead="Select a fruit to see pack sizes, or add the displayed pack straight to your basket.">
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap:'28px'}}>
            {signatureProducts().map(product => <ProductCard key={product.id} product={product} onOpen={entry => onNavigateRoute(routeOf(entry))} />)}
          </div>
        </Section>
        <CollectionsSection />''')
s=s.replace('      {/* The drifting plate.', '      <div className="signature-photo-hero"><FruitPhoto fruit="mixed" ratio="auto" priority /></div>\n      {/* The drifting plate.')
s=s.replace('rgba(24,18,11,.72)', 'rgba(24,18,11,.12)').replace('rgba(217,155,52,.30)','rgba(217,155,52,.05)')
s=s.replace('href="#collections"','href="#signature-fruit"',1).replace("document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' });", "document.getElementById('signature-fruit')?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' });",1).replace('            View collections','            Choose fruit & packs')
s=s.replace('<SpecimenPlate tint={collection.tint} ratio="4 / 3" lift={lift} drift />','<FruitPhoto fruit={collection.productIds.length > 1 ? \'mixed\' : collection.productIds[0]} ratio="4 / 3" />')
s=s.replace('  const lift = hover && hasPointer && !reduced ? 1 : 0;\n\n  return (\n    <article\n      onMouseEnter', '  const lift = hover && hasPointer && !reduced ? 1 : 0;\n\n  return (\n    <article\n      onMouseEnter',1)
s=s.replace("style={{ position: 'relative' }}\n    >", "style={{ position: 'relative', transform: lift ? 'translateY(-3px)' : undefined, transition: reduced ? 'none' : 'transform 450ms ease' }}\n    >",1)
s=s.replace('<SpecimenPlate tint={collection.tint} ratio="1 / 1" />', '<FruitPhoto fruit={collection.productIds.length > 1 ? \'mixed\' : collection.productIds[0]} ratio="1 / 1" />')
s=s.replace('<SpecimenPlate tint={collection.tint} ratio="4 / 5" drift />', '<FruitPhoto fruit={collection.productIds.length > 1 ? \'mixed\' : collection.productIds[0]} ratio="4 / 5" />')
s=s.replace('<SpecimenPlate tint={box.tint} ratio="4 / 5" lift={lift} label="Packaging placeholder" />', '<FruitPhoto fruit={box.productIds.length > 1 ? \'mixed\' : box.productIds[0]} ratio="4 / 5" />')
s=s.replace('''<SpecimenPlate
          tint={seasonalClosure.tint}
          ratio={stacked ? '3 / 2' : '4 / 3'}
          drift
          label={seasonalClosure.plateNote}
        />''', '''<FruitPhoto fruit="anaar" ratio={stacked ? '3 / 2' : '4 / 3'} />''')
# Each editorial collection has an explicit, honest enquiry path.
s=s.replace('{collection.purpose}', '{collection.purpose}<br /><a className="collection-shop-link" href={whatsappHref(`Hello BAAGH — I would like to enquire about ${collection.title}. Please confirm contents, availability and price.`)} target="_blank" rel="noopener noreferrer">Enquire about this collection ↗</a>')
s=s.replace('{collection.title}\n      </h3>', '{collection.title}\n      </h3>\n      <a className="collection-shop-link" href="#signature-fruit">Choose fruit &amp; packs ↑</a>')
p.write_text(s, encoding='utf-8')
