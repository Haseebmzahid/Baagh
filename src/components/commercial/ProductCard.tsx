import React, { useState } from 'react';
import { commercial as c } from './theme';
import {
  Fact,
  Price,
  QuantityStepper,
  SpecimenPlate,
  StateMark,
  useCommercialLayout,
  useHasPointer,
  usePrefersReducedMotion,
} from './primitives';
import {
  defaultPack,
  isOrderable,
  priceOf,
  routeOf,
  stateMarkFor,
  unavailableNote,
} from '../../data/catalogue';
import type { Product } from '../../data/catalogue';
import { fruitPhotos } from './FruitPhoto';
import './everydayShowcase.css';
import { useBasket } from '../../context/BasketContext';

/**
 * Rule 06 · The product card.
 *
 * No card border. No badge unless the fruit's state requires one. Hierarchy is
 * carried by the plate, then the name, then two mono facts, then price. The
 * CTA is quiet until hover.
 *
 * Hover (L2): plate scales 1.03 inside its frame, a raking highlight crosses
 * it, the card lifts 3px, the add action brightens to gold. 450ms, ease-out.
 *
 * Selected: gold hairline under the whole card plus a quantity stepper
 * replacing the add action. No fill, no tick.
 */

export interface ProductCardProps {
  product: Product;
  onOpen?: (product: Product) => void;
  onAdd?: (product: Product, quantity: number) => void;
  /** Mobile drops to a 3:2 landscape plate so one card fills the screen. */
  landscape?: boolean;
  /** Cached portrait from the page's shared 3D renderer. */
  portraitSrc?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpen,
  onAdd,
  landscape,
  portraitSrc = fruitPhotos[product.id],
}) => {
  const [hover, setHover] = useState(false);
  const basket = useBasket();
  const pack = defaultPack(product);
  const quantity = basket.quantityOf(product.id, pack.id);
  const { isMobile } = useCommercialLayout();
  const hasPointer = useHasPointer();
  const reduced = usePrefersReducedMotion();

  const selected = quantity > 0;
  // Availability is data. The card asks the catalogue what to show; it never
  // inspects a product's state itself.
  const orderable = isOrderable(product) && pack.available;
  const mark = stateMarkFor(product);
  const lift = hover && hasPointer && !reduced ? 1 : 0;

  const handleOpen = () => {
    if (onOpen) onOpen(product);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!orderable) return;
    if (basket.add(product.id, pack.id, 1) && onAdd) onAdd(product, 1);
  };

  const handleQuantity = (next: number) => {
    const line = basket.lines.find((candidate) => candidate.productId === product.id && candidate.packId === pack.id);
    if (line) basket.setQuantity(line.key, next);
    if (onAdd) onAdd(product, next);
  };

  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        // No card border. Structure comes from the plate and the price hairline.
        background: 'transparent',
        transform: lift ? 'translateY(-3px)' : 'translateY(0)',
        transition: `transform ${c.motion.l2.duration} ${c.motion.l2.ease}`,
        // Selected: a gold hairline under the whole card. No fill, no tick.
        borderBottom: selected
          ? `1px solid ${c.color.gold70}`
          : '1px solid transparent',
        paddingBottom: '4px',
        opacity: orderable ? 1 : 0.72,
      }}
    >
      {/* Plate — 4:5 on Deep (3:2 landscape on mobile). */}
      <button
        type="button"
        onClick={handleOpen}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        aria-label={`View ${product.name}`}
        style={{
          position: 'relative',
          display: 'block',
          width: '100%',
          padding: 0,
          border: 'none',
          background: 'transparent',
          cursor: onOpen ? 'pointer' : 'default',
        }}
      >
        <SpecimenPlate
          tint={portraitSrc || product.image.src ? '#16150f' : product.image.tint}
          ratio={landscape ? '3 / 2' : '4 / 5'}
          lift={lift}
          label={portraitSrc || product.image.src ? undefined : product.image.note}
        >{(product.image.src || portraitSrc) && <img className="everyday-product-portrait" loading="lazy" decoding="async" src={product.image.src ?? portraitSrc} alt={product.image.alt ?? `${product.name} fruit photograph`} />}</SpecimenPlate>

        {/* State mark — one word, top right. Absent by default. */}
        {mark.state !== 'steady' && (
          <span
            style={{
              position: 'absolute',
              top: '12px',
              right: '13px',
              zIndex: 2,
            }}
          >
            <StateMark state={mark.state} label={mark.label} />
          </span>
        )}
      </button>

      {/* Name — P1. Fruit then variety word only, never a marketing phrase. */}
      <h3
        style={{
          fontFamily: c.font.serif,
          fontSize: c.type.p1.size,
          fontWeight: c.type.p1.weight,
          lineHeight: c.type.p1.lineHeight,
          color: c.color.paperWarm,
          margin: '20px 0 0',
        }}
      >
        {onOpen ? (
          <a
            href={routeOf(product)}
            onClick={(e) => {
              e.preventDefault();
              handleOpen();
            }}
            style={{
              color: 'inherit',
              // Grow the hit area past 44px without moving the name: the
              // padding is cancelled by an equal negative margin.
              display: 'inline-block',
              paddingBlock: '13px',
              marginBlock: '-13px',
            }}
          >
            {product.name}
          </a>
        ) : (
          product.name
        )}
      </h3>

      {/* Two facts: variety · origin, then the season window one step quieter. */}
      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <Fact>
          {product.variety} · {product.origin}
        </Fact>
        <Fact quiet>{orderable ? product.seasonLabel : unavailableNote(product)}</Fact>
      </div>

      {/* Price row — hairline above. Price left, pack size inline, action right. */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '16px',
          borderTop: `1px solid ${c.color.hair12}`,
          marginBlockStart: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          minHeight: `${c.control.minTap}px`,
        }}
      >
        {orderable ? (
          <Price
            amount={priceOf(product)}
            note={`/ ${defaultPack(product).weightLabel}`}
            inlineNote
          />
        ) : (
          <span
            style={{
              fontFamily: c.font.mono,
              fontSize: '9px',
              letterSpacing: '.16em',
              textTransform: 'uppercase',
              color: c.color.ink42,
            }}
          >
            {unavailableNote(product)}
          </span>
        )}

        {!orderable ? (
          <NotifyAction />
        ) : selected ? (
          <QuantityStepper
            value={quantity}
            onChange={handleQuantity}
            min={0}
            ariaLabel={`Quantity of ${product.name}`}
          />
        ) : (
          <AddAction hovered={lift === 1} onClick={handleAdd} name={product.name} mobile={isMobile} />
        )}
      </div>
    </article>
  );
};

/**
 * The add action is quiet until hover, when it brightens to gold. On mobile it
 * becomes a 44px filled button rather than a text link.
 */
const AddAction: React.FC<{
  hovered: boolean;
  onClick: (e: React.MouseEvent) => void;
  name: string;
  mobile?: boolean;
}> = ({ hovered, onClick, name, mobile }) => {
  const [own, setOwn] = useState(false);
  const on = hovered || own;

  if (mobile) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`Add ${name} to basket`}
        style={{
          height: `${c.control.minTap}px`,
          padding: '0 22px',
          flex: 'none',
          background: c.color.ink,
          color: '#1d2419',
          border: 'none',
          borderRadius: c.radius.button,
          fontFamily: c.font.mono,
          fontSize: '10px',
          letterSpacing: '.18em',
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}
      >
        Add to basket
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setOwn(true)}
      onMouseLeave={() => setOwn(false)}
      onFocus={() => setOwn(true)}
      onBlur={() => setOwn(false)}
      aria-label={`Add ${name} to basket`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
        height: `${c.control.minTap}px`,
        padding: 0,
        flex: 'none',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontFamily: c.font.mono,
        fontSize: '10px',
        letterSpacing: '.18em',
        textTransform: 'uppercase',
        color: on ? c.color.goldHover : c.color.gold80,
        transition: `color ${c.motion.l2.duration} ${c.motion.l2.ease}`,
      }}
    >
      Add to basket
      <span
        aria-hidden="true"
        style={{
          transform: on ? 'translateX(3px)' : 'translateX(0)',
          transition: `transform ${c.motion.l2.duration} ${c.motion.l2.ease}`,
        }}
      >
        →
      </span>
    </button>
  );
};

/** Out of season — the card offers notification instead of an add action. */
const NotifyAction: React.FC = () => {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      style={{
        height: `${c.control.minTap}px`,
        padding: '0 18px',
        flex: 'none',
        background: 'transparent',
        border: `1px solid ${hover ? c.color.gold70 : c.color.hair22}`,
        borderRadius: c.radius.button,
        cursor: 'pointer',
        fontFamily: c.font.mono,
        fontSize: '9px',
        letterSpacing: '.18em',
        textTransform: 'uppercase',
        color: hover ? c.color.goldHover : c.color.ink42,
        transition: `color ${c.motion.l3.duration} ${c.motion.l3.ease}, border-color ${c.motion.l3.duration} ${c.motion.l3.ease}`,
      }}
    >
      Notify
    </button>
  );
};

// ---------------------------------------------------------------------------
// Rule 07 · Category tiles & collection cards
// ---------------------------------------------------------------------------

/** Category tile — a 3:4 well with the name over the image and a mono count. */
export const CategoryTile: React.FC<{
  label: string;
  note: string;
  tint: string;
  onOpen?: () => void;
  href?: string;
  /** Fixed width when the tile sits in the mobile scroll rail. */
  railWidth?: number;
  portraitSrc?: string;
}> = ({ label, note, tint, onOpen, href, railWidth, portraitSrc }) => {
  const [hover, setHover] = useState(false);
  const reduced = usePrefersReducedMotion();
  const hasPointer = useHasPointer();
  const lift = hover && hasPointer && !reduced ? 1 : 0;

  return (
    <a
      href={href ?? '#'}
      onClick={(e) => {
        if (onOpen) {
          e.preventDefault();
          onOpen();
        }
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      style={{
        position: 'relative',
        display: 'block',
        flex: railWidth ? `0 0 ${railWidth}px` : undefined,
        width: railWidth ? `${railWidth}px` : '100%',
        aspectRatio: '3 / 4',
        overflow: 'hidden',
        background: c.color.deep,
        scrollSnapAlign: railWidth ? 'start' : undefined,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(66% 54% at 46% 34%, ${portraitSrc ? '#282316' : tint} 0%, rgba(16,15,10,.6) 60%, ${c.color.deep} 100%)`,
          transform: `scale(${1 + lift * 0.03})`,
          transition: `transform ${c.motion.l2.duration} ${c.motion.l2.ease}`,
        }}
      />
      {portraitSrc && <img className="everyday-product-portrait" loading="lazy" decoding="async" src={portraitSrc} alt={`${label} fruit photograph`} style={{objectFit:'cover'}} />}
      <div aria-hidden="true" style={{position:'absolute',inset:0,background:'linear-gradient(180deg, rgba(16,15,10,0) 44%, rgba(16,15,10,.82) 100%)'}} />
      <div
        style={{
          position: 'absolute',
          left: '18px',
          right: '18px',
          bottom: '18px',
        }}
      >
        <span
          style={{
            display: 'block',
            fontFamily: c.font.serif,
            fontSize: '20px',
            fontWeight: 300,
            color: lift ? c.color.goldHover : c.color.paperWarm,
            transition: `color ${c.motion.l2.duration} ${c.motion.l2.ease}`,
          }}
        >
          {label}
        </span>
        <span
          style={{
            display: 'block',
            marginTop: '7px',
            fontFamily: c.font.mono,
            fontSize: '9px',
            letterSpacing: '.16em',
            textTransform: 'uppercase',
            color: c.color.ink42,
          }}
        >
          {note}
        </span>
      </div>
    </a>
  );
};

/**
 * Collection card — wider, 16:10, carrying one line of purpose instead of a
 * fact pair.
 */
export const CollectionCard: React.FC<{
  eyebrow?: string;
  title: string;
  purpose: string;
  meta?: string;
  tint: string;
  onOpen?: () => void;
  href?: string;
  ratio?: string;
  portraitSrc?: string;
}> = ({ eyebrow, title, purpose, meta, tint, onOpen, href, ratio = '16 / 10', portraitSrc }) => {
  const [hover, setHover] = useState(false);
  const reduced = usePrefersReducedMotion();
  const hasPointer = useHasPointer();
  const lift = hover && hasPointer && !reduced ? 1 : 0;

  return (
    <a
      href={href ?? '#'}
      onClick={(e) => {
        if (onOpen) {
          e.preventDefault();
          onOpen();
        }
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      style={{ display: 'block' }}
    >
      <div style={{ position: 'relative', width: '100%', aspectRatio: ratio, overflow: 'hidden' }}>
        <SpecimenPlate tint={portraitSrc ? '#201c13' : tint} ratio={ratio} lift={lift}>{portraitSrc && <img className="everyday-product-portrait" loading="lazy" decoding="async" src={portraitSrc} alt={`${title} fruit photograph`} />}</SpecimenPlate>
        {eyebrow && (
          <span style={{ position: 'absolute', top: '14px', left: '15px', zIndex: 2 }}>
            <span
              style={{
                fontFamily: c.font.mono,
                fontSize: '8px',
                letterSpacing: c.type.u2.letterSpacing,
                textTransform: 'uppercase',
                color: c.color.gold80,
              }}
            >
              {eyebrow}
            </span>
          </span>
        )}
      </div>

      <h3
        style={{
          fontFamily: c.font.serif,
          fontSize: c.type.p1.size,
          fontWeight: c.type.p1.weight,
          color: lift ? c.color.goldHover : c.color.paperWarm,
          margin: '18px 0 0',
          transition: `color ${c.motion.l2.duration} ${c.motion.l2.ease}`,
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontFamily: c.font.serif,
          fontSize: '15px',
          fontWeight: 300,
          lineHeight: 1.6,
          color: c.color.ink62,
          margin: '9px 0 0',
          maxWidth: '38ch',
          textWrap: 'pretty' as React.CSSProperties['textWrap'],
        }}
      >
        {purpose}
      </p>

      {meta && (
        <span
          style={{
            display: 'block',
            marginTop: '13px',
            fontFamily: c.font.mono,
            fontSize: '9px',
            letterSpacing: '.16em',
            textTransform: 'uppercase',
            color: c.color.ink42,
          }}
        >
          {meta}
        </span>
      )}
    </a>
  );
};
