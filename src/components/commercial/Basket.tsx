import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useBasket } from '../../context/BasketContext';
import type { ResolvedBasketLine } from '../../context/BasketContext';
import { MAX_QUANTITY } from '../../basket/model';
import { formatMoney } from '../../basket/orderRequest';
import { commerce, routeOf, whatsappConfigured } from '../../data/catalogue';
import { Button, CommercialPage, Label, PageContainer, QuantityStepper } from './primitives';
import { ProductSpecimen } from './ProductSpecimen';
import { WhatsAppRequest } from './WhatsAppRequest';
import './basket.css';

type Navigate = (path: string) => void;

const money = (minor: number) => formatMoney(minor, commerce.currency);

export const BasketLauncher: React.FC<{ productPage?: boolean }> = ({ productPage }) => {
  const { count, openBasket } = useBasket();
  return <button type="button" className={`baagh-basket-launcher${productPage ? ' baagh-basket-launcher--product' : ''}`}
    onClick={openBasket} aria-haspopup="dialog" aria-controls="baagh-basket-dialog" aria-label={`Open basket, ${count} packs`}>
    <svg width="19" height="22" viewBox="0 0 22 25" fill="none" aria-hidden="true">
      <path d="M3 8h16l1 15H2L3 8Z" stroke="currentColor" /><path d="M7 9V6a4 4 0 0 1 8 0v3" stroke="currentColor" />
    </svg>
    <span>Basket</span><span className="baagh-basket-count">{count}</span>
  </button>;
};

export const BasketAnnouncements: React.FC = () => {
  const { notice } = useBasket();
  return <div className="baagh-basket-sr" role="status" aria-live="polite" aria-atomic="true">{notice}</div>;
};

function BasketItems({ onNavigate }: { onNavigate: Navigate }) {
  const { lines, setQuantity } = useBasket();
  // One reused live specimen per basket surface, not one renderer per pack.
  const liveKey = lines.find((line) => line.product && !line.product.image.src)?.key;
  return <ul className="baagh-basket-items" aria-label="Basket items">
    {lines.map((line) => <BasketItem key={line.key} line={line} live={line.key === liveKey}
      onNavigate={onNavigate} onQuantity={(quantity) => setQuantity(line.key, quantity)} />)}
  </ul>;
}

function BasketItem({ line, live, onNavigate, onQuantity }: {
  line: ResolvedBasketLine; live: boolean; onNavigate: Navigate; onQuantity: (quantity: number) => void;
}) {
  const { product, pack } = line;
  const name = product?.name ?? 'Product no longer listed';
  const label = pack?.label ?? `Pack no longer listed (${line.packId})`;
  return <li className="baagh-basket-item">
    <div className="baagh-basket-art" role={product?.image.src || live ? undefined : 'img'}
      aria-label={product?.image.src || live ? undefined : `${name} illustrated specimen`}>
      {product?.image.src ? <img src={product.image.src} alt={product.image.alt ?? name} />
        : product && live ? <ProductSpecimen product={product} ratio="1 / 1" compact />
          : <div className="baagh-basket-fruit" style={{ '--fruit-tint': product?.image.tint ?? '#88784b',
            borderRadius: product?.category === 'mangoes' ? '54% 43% 57% 41%' : '46% 48% 45% 47%',
          } as React.CSSProperties} />}
    </div>
    <div className="baagh-basket-item-info">
      <div className="baagh-basket-fact">{product?.variety ?? 'Please review'}</div>
      <h3>{product ? <a href={routeOf(product)} onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault(); onNavigate(routeOf(product));
      }}>{name}</a> : name}</h3>
      <p className="baagh-basket-pack">{label}</p>
      {!line.available && <p className="baagh-basket-warning">Unavailable. Remove this item before continuing.</p>}
      <div className="baagh-basket-item-controls">
        <QuantityStepper value={line.quantity} min={1} max={line.available ? MAX_QUANTITY : line.quantity}
          onChange={onQuantity} ariaLabel={`${name}, ${label}, quantity`} />
        <button type="button" className="baagh-basket-remove" aria-label={`Remove ${name}, ${label}`} onClick={() => onQuantity(0)}>Remove</button>
      </div>
      {line.quantity === MAX_QUANTITY && <p className="baagh-basket-limit">Maximum 9 per pack size</p>}
    </div>
    <div className="baagh-basket-line-price">
      <span>{line.unitPrice !== null ? money(line.unitPrice * line.quantity) : 'Price unavailable'}</span>
      {commerce.pricesAreProvisional && <small>Provisional</small>}
    </div>
  </li>;
}

function BasketSummary({ review, onReview, onContinue, onRequest }: {
  review?: boolean; onReview?: () => void; onContinue: () => void; onRequest: () => void;
}) {
  const { lines, subtotal, canEnquire, storageNotice } = useBasket();
  return <div className="baagh-basket-summary">
    {storageNotice && <p className="baagh-basket-warning" role="status">{storageNotice}</p>}
    <div className="baagh-basket-subtotal"><span>{canEnquire ? 'Subtotal' : 'Available items subtotal'}</span><strong>{money(subtotal)}</strong></div>
    <p className="baagh-basket-summary-note">{commerce.pricesAreProvisional ? 'Provisional prices. ' : ''}Delivery fees and final amount will be confirmed on WhatsApp.</p>
    {!canEnquire && lines.length > 0 && <p className="baagh-basket-warning">Remove unavailable items to continue.</p>}
    <div className="baagh-basket-actions">
      <Button full variant="whatsapp" disabled={!canEnquire || !whatsappConfigured}
        onClick={onRequest}>Continue to WhatsApp</Button>
      {!whatsappConfigured && <p className="baagh-basket-warning">WhatsApp ordering is awaiting the business number.</p>}
      {!review && <Button full variant="secondary" onClick={onReview}>Review basket</Button>}
      <button type="button" className="baagh-basket-continue" onClick={onContinue}>← Continue shopping</button>
    </div>
    <p className="baagh-basket-footnote">Next: delivery details and message review. Nothing is sent until you send it in WhatsApp.</p>
  </div>;
}

function BasketEmpty({ onContinue }: { onContinue: () => void }) {
  const { storageNotice } = useBasket();
  return <div className="baagh-basket-empty">
    <span className="baagh-basket-empty-mark" aria-hidden="true">B.</span>
    <Label gold>A little room for something good</Label>
    <h3>Your basket is waiting.</h3>
    <p>Explore the season and choose a pack for your table.</p>
    {storageNotice && <p className="baagh-basket-warning" role="status">{storageNotice}</p>}
    <Button variant="secondary" onClick={onContinue}>Explore Everyday Fresh</Button>
  </div>;
}

export const BasketDrawer: React.FC<{ onNavigateRoute: Navigate }> = ({ onNavigateRoute }) => {
  const { isOpen, closeBasket, lines, count, notice } = useBasket();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [requestOpen, setRequestOpen] = useState(false);

  useEffect(() => { if (!isOpen) setRequestOpen(false); }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    const padding = document.body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = padding;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [isOpen]);

  const navigate: Navigate = (path) => { closeBasket(); onNavigateRoute(path); };
  const returnToBasket = () => {
    setRequestOpen(false);
    requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLButtonElement>('.baagh-basket-close')?.focus());
  };
  if (!isOpen) return null;
  return createPortal(<dialog ref={dialogRef} id="baagh-basket-dialog" className="baagh-basket-dialog"
    aria-labelledby="baagh-basket-title" onCancel={(event) => { event.preventDefault(); closeBasket(); }}
    onClick={(event) => { if (event.target === event.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeBasket();
    } }}>
    <div className="baagh-basket-drawer-inner">
      <header className="baagh-basket-heading">
        <div><Label gold>BAAGH · Your selection</Label><h2 id="baagh-basket-title">{requestOpen ? 'Your request' : 'The basket'}<span>{count.toString().padStart(2, '0')}</span></h2></div>
        <button type="button" className="baagh-basket-close" onClick={closeBasket} aria-label="Close basket" autoFocus>×</button>
      </header>
      {requestOpen ? <div className="baagh-basket-request-scroll"><WhatsAppRequest onBack={returnToBasket} /></div> : lines.length ? <>
        <div className="baagh-basket-scroll"><p className="baagh-basket-intro">Chosen for your table.</p>
          <div className="baagh-basket-feedback" role="status">{notice}</div>
          <BasketItems onNavigate={navigate} />
        </div>
        <BasketSummary onReview={() => navigate('/basket')} onContinue={closeBasket} onRequest={() => setRequestOpen(true)} />
      </> : <BasketEmpty onContinue={() => navigate('/everyday-fresh')} />}
    </div>
  </dialog>, document.body);
};

export const BasketReview: React.FC<{ onNavigateRoute: Navigate }> = ({ onNavigateRoute }) => {
  const { lines, count } = useBasket();
  const [requestOpen, setRequestOpen] = useState(false);
  const reviewHeading = useRef<HTMLHeadingElement>(null);
  const returnToBasket = () => {
    setRequestOpen(false);
    requestAnimationFrame(() => reviewHeading.current?.focus());
  };
  return <CommercialPage><PageContainer><main className="baagh-basket-review">
    <Label gold>Your selection · {count} {count === 1 ? 'pack' : 'packs'}</Label>
    <h1 ref={reviewHeading} tabIndex={-1}>Review your basket.</h1>
    <p className="baagh-basket-review-lead">A final look, before we take care of the rest.</p>
    {requestOpen ? <WhatsAppRequest onBack={returnToBasket} /> : lines.length ? <div className="baagh-basket-review-grid"><BasketItems onNavigate={onNavigateRoute} />
      <aside aria-label="Basket summary"><BasketSummary review onContinue={() => onNavigateRoute('/everyday-fresh')} onRequest={() => setRequestOpen(true)} /></aside></div>
      : <BasketEmpty onContinue={() => onNavigateRoute('/everyday-fresh')} />}
  </main></PageContainer></CommercialPage>;
};
