import React, { useMemo, useState } from 'react';
import { availabilityLabel, commerce, defaultPack, everydayProducts, isOrderable, routeOf } from '../../data/catalogue';
import { FruitPhoto } from './FruitPhoto';
import { Button } from './primitives';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import './everydayShowcase.css';

export const EverydayShowcase: React.FC<{
  onNavigateRoute: (path: string) => void;
}> = ({ onNavigateRoute }) => {
  const products = useMemo(() => everydayProducts().filter((product) => product.fruitIntelligenceSlug),[]);
  const [selected,setSelected] = useState(products[0].id);
  const reduced = useReducedMotion();
  const product = products.find((entry) => entry.id === selected) ?? products[0];
  const index = products.indexOf(product);
  const pack = defaultPack(product);
  const provisional = commerce.pricesAreProvisional || product.provisional.includes('price');
  const navigate = (event: React.MouseEvent, path: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); onNavigateRoute(path);
  };
  return <section className="everyday-showcase" aria-labelledby="everyday-showcase-title">
    <div className="everyday-showcase-topline"><span>Everyday Fresh</span><a href="/signature" onClick={(event) => navigate(event,'/signature')}>Discover Signature <span aria-hidden="true">↗</span></a></div>
    <div className="everyday-showcase-composition">
      <div className="everyday-showcase-copy">
        <p className="everyday-showcase-eyebrow">The everyday collection</p>
        <h1 id="everyday-showcase-title">Everyday.<br/><em>Exceptional.</em></h1>
        <p className="everyday-showcase-description">Good fruit, clearly chosen. Pick your fruit and pack, then send your order request on WhatsApp.</p>
        <div className="everyday-showcase-actions">
          <Button variant="primary" href={routeOf(product)} onClick={(event) => navigate(event,routeOf(product))}>Choose {product.shortName} pack</Button>
          <a className="everyday-showcase-shop" href="#ready-today" onClick={(event) => {
            event.preventDefault();
            document.getElementById('ready-today')?.scrollIntoView({behavior:reduced ? 'instant' : 'smooth'});
          }}>Shop the collection <span aria-hidden="true">↗</span></a>
        </div>
        <p className="everyday-showcase-assurance">Explore at your pace. Order on WhatsApp.</p>
      </div>
      <figure className="everyday-showcase-figure">
        <FruitPhoto fruit={product.id} ratio="4 / 3" priority />
        <figcaption className="everyday-showcase-caption" aria-live="polite" aria-atomic="true">
          <div><span className="everyday-showcase-number">{String(index+1).padStart(2,'0')} / {String(products.length).padStart(2,'0')}</span><h2>{product.name}</h2><p>{product.variety} · {product.origin}</p></div>
          <div className="everyday-showcase-price">{isOrderable(product) && pack.available ? <><span>{product.priceUnit} {pack.price}</span><small>{pack.label}{provisional ? ' · provisional price' : ''}</small></> : <><span className="everyday-showcase-closed">{availabilityLabel(product.availability)}</span><small>Ask us about availability</small></>}</div>
        </figcaption>
      </figure>
    </div>
    <div className="everyday-showcase-selector" role="group" aria-label="Choose a fruit">
      {products.map((entry,i) => <button key={entry.id} type="button" aria-pressed={entry.id===product.id}
        onClick={() => setSelected(entry.id)} className={entry.id===product.id ? 'is-selected' : ''}>
        <span className="everyday-selector-index">{String(i+1).padStart(2,'0')}</span>
        <span className="everyday-selector-name">{entry.shortName}</span>
        <span className="everyday-selector-state">{availabilityLabel(entry.availability)}</span>
        <span className="everyday-selector-mark" aria-hidden="true">↗</span>
      </button>)}
    </div>
    <div className="everyday-showcase-foot"><span>Seasonal selection. Lasting attention.</span><a href={`/fruit-intelligence/${product.fruitIntelligenceSlug}`} onClick={(event) => navigate(event,`/fruit-intelligence/${product.fruitIntelligenceSlug}`)}>The art of choosing fruit <span aria-hidden="true">↗</span></a></div>
  </section>;
};
