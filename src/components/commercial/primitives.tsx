import React, { useState } from 'react';
import { commercial as c, layoutFor } from './theme';
import type { ProductState } from './theme';
import { useViewportTier } from '../../hooks/useViewportTier';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { whatsappConfigured, whatsappHref } from '../../data/catalogue';

/**
 * Commercial primitives — Stage 02, approved.
 * Reference: Design prototype/commercial/BAAGH Commercial System (1).html
 */

/** Re-exported under the name the commercial layer uses. */
export const usePrefersReducedMotion = useReducedMotion;

/** Layout figures + tier booleans, read once per component. */
export function useCommercialLayout() {
  const { tier, width } = useViewportTier();
  const L = layoutFor(tier);
  return {
    tier,
    width,
    ...L,
    isMobile: tier === 'mobile',
    isTablet: tier === 'tablet',
    isDesktop: tier === 'desktop',
  };
}

/** True where a fine pointer can hover — tilt is disabled on touch. */
export function useHasPointer(): boolean {
  const [has, setHas] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return true;
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  });

  React.useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const onChange = () => setHas(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return has;
}

// ---------------------------------------------------------------------------
// Page shell
// ---------------------------------------------------------------------------

export const PageContainer: React.FC<{
  children: React.ReactNode;
  wide?: boolean;
}> = ({ children, wide }) => {
  const { margin } = useCommercialLayout();
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: wide ? '100%' : `${c.layout.maxWidth}px`,
        margin: '0 auto',
        padding: `0 ${margin}px`,
      }}
    >
      {children}
    </div>
  );
};

/**
 * The film grain that carries across from the journey. One fixed layer per
 * commercial page — never one per section.
 */
const GRAIN_SVG =
  "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxODAiIGhlaWdodD0iMTgwIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC45IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI24pIi8+PC9zdmc+')";

export const CommercialGrain: React.FC = () => (
  <div
    aria-hidden="true"
    style={{
      position: 'fixed',
      inset: 0,
      zIndex: 3,
      pointerEvents: 'none',
      backgroundImage: GRAIN_SVG,
      backgroundRepeat: 'repeat',
      backgroundSize: '180px 180px',
      opacity: 0.07,
      mixBlendMode: 'overlay',
    }}
  />
);

/**
 * Page root for every commercial route. Owns the canvas colour, the grain and
 * the header clearance, so the pages themselves stay composition-only.
 */
export const CommercialPage: React.FC<{
  children: React.ReactNode;
  deep?: boolean;
}> = ({ children, deep }) => {
  const { isMobile } = useCommercialLayout();
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        background: deep ? c.color.deep : c.color.canvas,
        overflowX: 'hidden',
        paddingTop: isMobile ? '64px' : '86px',
      }}
    >
      <CommercialGrain />
      {children}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Section — numbered editorial header
// ---------------------------------------------------------------------------

export interface SectionProps {
  index?: string;
  eyebrow?: string;
  title?: string;
  /** Mono rule line under the title, as the system sheet sets it. */
  note?: string;
  /** Italic serif aside (B2). */
  lead?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
  /** Cancel the page margin so a rail can bleed to the viewport edge. */
  bleed?: boolean;
  id?: string;
}

export const Section: React.FC<SectionProps> = ({
  index,
  eyebrow,
  title,
  note,
  lead,
  action,
  children,
  bleed,
  id,
}) => {
  const { section, margin, isMobile } = useCommercialLayout();

  return (
    <section id={id} style={{ padding: `${section}px 0 0` }}>
      {eyebrow && (
        <span
          style={{
            display: 'block',
            fontFamily: c.font.mono,
            fontSize: c.type.eyebrow.size,
            letterSpacing: c.type.eyebrow.letterSpacing,
            textTransform: 'uppercase',
            color: c.color.gold,
            marginBottom: '20px',
          }}
        >
          {eyebrow}
        </span>
      )}

      {(index || title || action) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: isMobile ? '16px' : '32px',
            flexWrap: 'wrap',
            marginBottom: note || lead ? '14px' : '44px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: isMobile ? '14px' : '22px' }}>
            {index && (
              <span
                style={{
                  fontFamily: c.font.mono,
                  fontSize: c.type.eyebrow.size,
                  letterSpacing: c.type.eyebrow.letterSpacing,
                  color: c.color.gold,
                  flex: 'none',
                }}
              >
                {index}
              </span>
            )}
            {title && (
              <h2
                style={{
                  fontFamily: c.font.serif,
                  fontSize: c.type.d2.size,
                  fontWeight: c.type.d2.weight,
                  lineHeight: c.type.d2.lineHeight,
                  letterSpacing: c.type.d2.letterSpacing,
                  color: c.color.paperWarm,
                  margin: 0,
                  textWrap: 'pretty' as React.CSSProperties['textWrap'],
                }}
              >
                {title}
              </h2>
            )}
          </div>
          {action}
        </div>
      )}

      {note && (
        <p
          style={{
            fontFamily: c.font.mono,
            fontSize: c.type.u1.size,
            lineHeight: 1.9,
            letterSpacing: '.06em',
            color: c.color.ink50,
            maxWidth: '580px',
            margin: '0 0 44px',
          }}
        >
          {note}
        </p>
      )}

      {lead && (
        <p
          style={{
            fontFamily: c.font.serif,
            fontSize: c.type.b2.size,
            fontWeight: c.type.b2.weight,
            fontStyle: 'italic',
            lineHeight: c.type.b2.lineHeight,
            color: 'rgba(244,239,228,.66)',
            maxWidth: '600px',
            margin: '0 0 44px',
            textWrap: 'pretty' as React.CSSProperties['textWrap'],
          }}
        >
          {lead}
        </p>
      )}

      <div style={bleed ? { marginInline: `-${margin}px` } : undefined}>{children}</div>
    </section>
  );
};

// ---------------------------------------------------------------------------
// Rule 04 · Buttons
// One primary per view. WhatsApp is a peer of primary, never louder.
// Squared 2px corners; mono labels at .18em; 52px desktop / 56px mobile.
// ---------------------------------------------------------------------------

export type ButtonVariant = 'primary' | 'secondary' | 'whatsapp' | 'tertiary';

export interface ButtonProps {
  variant?: ButtonVariant;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  full?: boolean;
  disabled?: boolean;
  /** Renders the tertiary arrow that travels 4px on hover. */
  arrow?: boolean;
  ariaLabel?: string;
  compact?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  href,
  onClick,
  children,
  full,
  disabled,
  arrow,
  ariaLabel,
  compact,
}) => {
  const [hover, setHover] = useState(false);
  const { isMobile } = useCommercialLayout();
  const on = hover && !disabled;

  const height = compact
    ? c.control.minTap
    : isMobile
      ? c.control.heightMobile
      : c.control.heightDesktop;

  const base: React.CSSProperties = {
    fontFamily: c.font.mono,
    fontSize: '10px',
    fontWeight: 400,
    letterSpacing: '.18em',
    textTransform: 'uppercase',
    height: `${height}px`,
    minHeight: `${c.control.minTap}px`,
    padding: variant === 'tertiary' ? '0' : `0 ${compact ? 22 : 34}px`,
    borderRadius: variant === 'tertiary' ? 0 : c.radius.button,
    display: full ? 'flex' : 'inline-flex',
    width: full ? '100%' : undefined,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    textDecoration: 'none',
    border: '1px solid transparent',
    boxSizing: 'border-box',
    transition: `background-color ${c.motion.l3.duration} ${c.motion.l3.ease}, color ${c.motion.l3.duration} ${c.motion.l3.ease}, border-color ${c.motion.l3.duration} ${c.motion.l3.ease}, opacity ${c.motion.l3.duration} ${c.motion.l3.ease}`,
    opacity: disabled ? 0.42 : 1,
    whiteSpace: 'nowrap',
  };

  const skin: Record<ButtonVariant, React.CSSProperties> = {
    // Cream fill, hover to gold.
    primary: {
      backgroundColor: on ? c.color.gold : c.color.ink,
      color: '#1d2419',
    },
    // Hairline outline, fills faintly on hover.
    secondary: {
      backgroundColor: on ? c.color.fill06 : 'transparent',
      color: on ? c.color.goldHover : c.color.ink70,
      borderColor: on ? c.color.gold70 : c.color.hair22,
    },
    // Leaf, not platform green. Sits beside primary.
    whatsapp: {
      backgroundColor: on ? c.color.leafHover : c.color.leaf,
      color: c.color.ink,
    },
    // Text, arrow travels 4px on hover.
    tertiary: {
      backgroundColor: 'transparent',
      color: on ? c.color.goldHover : c.color.gold,
      justifyContent: full ? 'flex-start' : undefined,
      height: 'auto',
      minHeight: `${c.control.minTap}px`,
    },
  };

  const content = (
    <>
      {children}
      {(arrow || variant === 'tertiary') && (
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            transform: on ? 'translateX(4px)' : 'translateX(0)',
            transition: `transform 160ms ${c.motion.ease}`,
          }}
        >
          →
        </span>
      )}
    </>
  );

  const style = { ...base, ...skin[variant] };
  const handlers = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    onFocus: () => setHover(true),
    onBlur: () => setHover(false),
  };

  if (href && !disabled) {
    return (
      <a href={href} onClick={onClick} style={style} aria-label={ariaLabel} {...handlers}>
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={style}
      {...handlers}
    >
      {content}
    </button>
  );
};

/**
 * The WhatsApp action. Ordering is WhatsApp-primary, so this appears on every
 * commercial page — but until a real business number is configured in
 * src/data/catalogue.ts the link must not navigate anywhere, or it would jump
 * the reader to the top of the page mid-order.
 */
export const WhatsAppButton: React.FC<{
  /** The message the deep link should carry. */
  message: string;
  children?: React.ReactNode;
  full?: boolean;
  compact?: boolean;
}> = ({ message, children = 'Order on WhatsApp', full, compact }) => (
  <Button
    variant="whatsapp"
    full={full}
    compact={compact}
    href={whatsappHref(message)}
    onClick={whatsappConfigured ? undefined : (e) => e.preventDefault()}
    ariaLabel={whatsappConfigured ? undefined : 'WhatsApp ordering — number pending configuration'}
  >
    {children}
  </Button>
);

// ---------------------------------------------------------------------------
// Rule 05 · Price
// PKR sits in mono, small and quiet. The figure sits in Newsreader. Pack size
// is a separate line, never bracketed onto the price. No strikethroughs, no
// percentages, no red.
// ---------------------------------------------------------------------------

export interface PriceProps {
  /** The figure only, already grouped — e.g. "1,850". */
  amount: string;
  /** Pack size line. Rendered separately, below or inline. */
  note?: string;
  /** "from PKR" for ranges. */
  from?: boolean;
  size?: 'card' | 'detail';
  /** Render the pack note on the same baseline (product card price row). */
  inlineNote?: boolean;
}

export const Price: React.FC<PriceProps> = ({
  amount,
  note,
  from,
  size = 'card',
  inlineNote,
}) => {
  const figure = size === 'detail' ? 'clamp(30px, 3vw, 40px)' : '22px';

  return (
    <div>
      <span style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span
          style={{
            fontFamily: c.font.mono,
            fontSize: '9px',
            letterSpacing: '.18em',
            textTransform: 'uppercase',
            color: c.color.ink42,
          }}
        >
          {from ? 'from PKR' : 'PKR'}
        </span>
        <span
          style={{
            fontFamily: c.font.serif,
            fontSize: figure,
            fontWeight: 300,
            lineHeight: 1,
            color: c.color.paperWarm,
          }}
        >
          {amount}
        </span>
        {inlineNote && note && (
          <span
            style={{
              fontFamily: c.font.mono,
              fontSize: '9px',
              letterSpacing: '.1em',
              color: c.color.ink42,
            }}
          >
            {note}
          </span>
        )}
      </span>
      {!inlineNote && note && (
        <span
          style={{
            display: 'block',
            marginTop: '8px',
            fontFamily: c.font.mono,
            fontSize: '9px',
            letterSpacing: '.12em',
            color: c.color.ink42,
          }}
        >
          {note}
        </span>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// State mark — one word, mono 8px. Peak · Ending · Pre-order · Signature.
// Absent by default.
// ---------------------------------------------------------------------------

export type { ProductState };

const STATE_LABEL: Record<ProductState, string> = {
  peak: 'Peak',
  ending: 'Ending',
  preorder: 'Pre-order',
  signature: 'Signature',
  closed: 'Out of season',
  steady: '',
};

export const StateMark: React.FC<{ state?: ProductState; label?: string }> = ({
  state,
  label,
}) => {
  if (!state || state === 'steady') return null;
  const text = label ?? STATE_LABEL[state];
  if (!text) return null;

  const color =
    state === 'ending' || state === 'closed' ? c.color.emberText : c.color.gold80;

  return (
    <span
      style={{
        fontFamily: c.font.mono,
        fontSize: '8px',
        letterSpacing: c.type.u2.letterSpacing,
        textTransform: 'uppercase',
        color,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  );
};

// ---------------------------------------------------------------------------
// Fact lines — U1 / U2. Mono carries facts, never meaning.
// ---------------------------------------------------------------------------

export const Fact: React.FC<{
  children: React.ReactNode;
  quiet?: boolean;
  gold?: boolean;
}> = ({ children, quiet, gold }) => (
  <span
    style={{
      display: 'block',
      fontFamily: c.font.mono,
      fontSize: c.type.u1.size,
      lineHeight: c.type.u1.lineHeight,
      letterSpacing: c.type.u1.letterSpacing,
      textTransform: 'uppercase',
      color: gold ? c.color.gold80 : quiet ? c.color.ink42 : c.color.ink70,
    }}
  >
    {children}
  </span>
);

export const Label: React.FC<{ children: React.ReactNode; gold?: boolean }> = ({
  children,
  gold,
}) => (
  <span
    style={{
      display: 'block',
      fontFamily: c.font.mono,
      fontSize: c.type.u2.size,
      letterSpacing: c.type.u2.letterSpacing,
      textTransform: 'uppercase',
      color: gold ? c.color.gold80 : c.color.ink42,
    }}
  >
    {children}
  </span>
);

// ---------------------------------------------------------------------------
// Rule 03 · Glass. Only above imagery, and only when the content underneath
// must stay visible.
// ---------------------------------------------------------------------------

export const Glass: React.FC<{
  tier: 'vitrine' | 'shelf' | 'rail';
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ tier, children, style }) => (
  <div style={{ ...(c.glass[tier] as React.CSSProperties), ...style }}>{children}</div>
);

// ---------------------------------------------------------------------------
// Specimen plate — 4:5 on Deep. Single specimen, room around it, one light
// source. No props, no white bowls.
//
// Photography is still a marked placeholder (Stage 01 §10), so the plate
// renders a lit well in the fruit's own tint until the image library arrives.
// ---------------------------------------------------------------------------

export const SpecimenPlate: React.FC<{
  tint: string;
  ratio?: string;
  /** 0 → resting, 1 → fully hovered. Drives the L2 plate treatment. */
  lift?: number;
  label?: string;
  children?: React.ReactNode;
  /** Slow cinematic drift, L1. Ignored under reduced motion. */
  drift?: boolean;
}> = ({ tint, ratio = '4 / 5', lift = 0, label, children, drift }) => {
  const reduced = usePrefersReducedMotion();
  const animate = drift && !reduced;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: ratio,
        overflow: 'hidden',
        background: c.color.deep,
      }}
    >
      {/* Single light source, raking from upper left. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(58% 50% at 42% 38%, ${tint} 0%, rgba(16,15,10,.55) 58%, ${c.color.deep} 100%)`,
          transform: `scale(${1 + lift * 0.03})`,
          transition: `transform ${c.motion.l2.duration} ${c.motion.l2.ease}`,
          animation: animate ? `baaghPlateDrift ${c.motion.l1.driftSeconds}s ease-in-out infinite` : undefined,
        }}
      />

      {/* Raking highlight that crosses the plate on hover (L2). */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: '-20%',
          background:
            'linear-gradient(104deg, rgba(255,255,255,0) 38%, rgba(255,244,222,.10) 50%, rgba(255,255,255,0) 62%)',
          transform: `translateX(${lift ? '35%' : '-45%'})`,
          opacity: lift ? 1 : 0,
          transition: `transform ${c.motion.l2.duration} ${c.motion.l2.ease}, opacity ${c.motion.l2.duration} ${c.motion.l2.ease}`,
          pointerEvents: 'none',
        }}
      />

      {children}

      {label && (
        <span
          style={{
            position: 'absolute',
            left: '12px',
            bottom: '11px',
            fontFamily: c.font.mono,
            fontSize: '8px',
            letterSpacing: '.2em',
            textTransform: 'uppercase',
            color: 'rgba(244,238,226,.34)',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Hairline — structure instead of cards.
// ---------------------------------------------------------------------------

export const Hairline: React.FC<{ strong?: boolean; style?: React.CSSProperties }> = ({
  strong,
  style,
}) => (
  <div
    aria-hidden="true"
    style={{
      height: '1px',
      width: '100%',
      background: strong ? c.color.hair22 : c.color.hair12,
      ...style,
    }}
  />
);

// ---------------------------------------------------------------------------
// Rule 05 footnote — every figure on every commercial screen is a placeholder.
// ---------------------------------------------------------------------------

export const PlaceholderNote: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <p
    style={{
      fontFamily: c.font.mono,
      fontSize: '8.5px',
      letterSpacing: '.16em',
      textTransform: 'uppercase',
      color: 'rgba(242,236,224,.3)',
      margin: 0,
    }}
  >
    {children ?? 'All figures are placeholders pending real pricing'}
  </p>
);

// ---------------------------------------------------------------------------
// Quantity stepper — replaces the add action once a card is selected.
// L3: opacity and 120ms only.
// ---------------------------------------------------------------------------

export const QuantityStepper: React.FC<{
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  ariaLabel?: string;
}> = ({ value, onChange, min = 1, max = 9, ariaLabel = 'Quantity' }) => {
  const btn: React.CSSProperties = {
    width: `${c.control.minTap}px`,
    height: `${c.control.minTap}px`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: c.font.mono,
    fontSize: '13px',
    color: c.color.ink70,
    transition: `color ${c.motion.l3.duration} ${c.motion.l3.ease}`,
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        border: `1px solid ${c.color.hair22}`,
        borderRadius: c.radius.button,
      }}
    >
      <button
        type="button"
        style={btn}
        aria-label="Decrease quantity"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        −
      </button>
      <span
        aria-live="polite"
        style={{
          minWidth: '26px',
          textAlign: 'center',
          fontFamily: c.font.mono,
          fontSize: '11px',
          color: c.color.paperWarm,
        }}
      >
        {value}
      </span>
      <button
        type="button"
        style={btn}
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        +
      </button>
    </div>
  );
};
