import React, { useEffect, useRef, useState } from 'react';
import { fruitPhotos } from './FruitPhoto';
import { commercial as c } from './theme';
import { Label, usePrefersReducedMotion } from './primitives';

/**
 * The Signature presentation box.
 *
 * L1, and interactive where it earns it: the lid lifts as the section is
 * scrolled through, which is the one thing the packaging story actually needs
 * to show. It is built from CSS 3D transforms rather than WebGL — there is no
 * geometry here worth a renderer, and Signature already spends its budget on
 * the hero and the specimen.
 *
 * Reduced motion holds the box at its open frame, still.
 * Touch devices get a two-frame sequence they can step through by hand,
 * matching the approved mobile recomposition.
 */

/** 0 → section entering, 1 → section leaving. Passive, rAF-coalesced. */
function useSectionProgress(ref: React.RefObject<HTMLElement>): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;

    const measure = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // Runs from the moment the element's top reaches the bottom of the
      // viewport to the moment its bottom clears the top.
      const span = rect.height + vh;
      const travelled = vh - rect.top;
      setProgress(Math.min(1, Math.max(0, travelled / span)));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ref]);

  return progress;
}

export const PresentationBox: React.FC<{ tint?: string }> = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const progress = useSectionProgress(wrapRef);
  const reduced = usePrefersReducedMotion();

  // Manual frame control on touch, where scroll-linked 3D reads poorly.
  const [frame, setFrame] = useState(1);

  // The lid travels through the middle of the section, not its whole length.
  const scrollOpen = Math.min(1, Math.max(0, (progress - 0.22) / 0.42));

  return (
    <div ref={wrapRef} className="presentation-box" style={{ position: 'relative', '--box-scroll': scrollOpen, '--box-frame': frame } as React.CSSProperties}>
      <div className="presentation-box-well"
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 11',
          background: c.color.deep,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          perspective: '1100px',
        }}
      >
        {/* Light well */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(52% 46% at 50% 34%, rgba(255,236,205,.13) 0%, rgba(16,15,10,.55) 58%, ${c.color.deep} 100%)`,
          }}
        />

        <div
          aria-hidden="true"
          style={{
            position: 'relative',
            width: '52%',
            maxWidth: '360px',
            transformStyle: 'preserve-3d',
            transform: 'rotateX(calc(58deg - var(--box-open) * 8deg)) rotateZ(-24deg)',
            transition: reduced ? 'none' : `transform 600ms ${c.motion.ease}`,
          }}
        >
          {/* Base tray */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '3 / 2',
              background: 'linear-gradient(155deg, #241f18 0%, #17130e 62%, #100d09 100%)',
              border: `1px solid ${c.color.hair16}`,
              boxShadow: '0 60px 80px -50px rgba(0,0,0,.95)',
            }}
          >
            {/* Cotton lining, and each fruit in its own bed. */}
            <div
              style={{
                position: 'absolute',
                inset: '9%',
                background: 'linear-gradient(150deg, rgba(226,214,192,.16) 0%, rgba(180,168,146,.07) 100%)',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridTemplateRows: 'repeat(2, 1fr)',
                gap: '6%',
                padding: '6%',
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    borderRadius: '50%',
                    background: `url(${fruitPhotos.chaunsa}) center / cover`,
                    boxShadow: 'inset 0 -3px 8px rgba(0,0,0,.5)',
                    // Fruit fade in behind the lid as it lifts.
                    opacity: 'calc(.25 + var(--box-open) * .75)',
                    transition: reduced ? 'none' : `opacity 600ms ${c.motion.ease}`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Lid — lifts without tearing. */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transformOrigin: 'top center',
              transform: 'translate3d(0, calc(var(--box-open) * -78px), calc(var(--box-open) * 40px)) rotateX(calc(var(--box-open) * -26deg))',
              transition: reduced ? 'none' : `transform 600ms ${c.motion.ease}`,
              background: 'linear-gradient(150deg, #2b241b 0%, #1d1811 58%, #14100b 100%)',
              border: `1px solid ${c.color.hair22}`,
              boxShadow: '0 40px 60px -44px rgba(0,0,0,.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontFamily: c.font.serif,
                fontSize: 'clamp(11px, 1.4vw, 16px)',
                fontWeight: 300,
                letterSpacing: '.34em',
                textTransform: 'uppercase',
                color: 'rgba(232,207,160,.62)',
              }}
            >
              BAAGH
            </span>
          </div>
        </div>

        <span
          style={{
            position: 'absolute',
            left: '14px',
            bottom: '13px',
            fontFamily: c.font.mono,
            fontSize: '8px',
            letterSpacing: '.2em',
            textTransform: 'uppercase',
            color: 'rgba(244,238,226,.34)',
          }}
        >
          <span className="presentation-caption-static">Packaging placeholder</span>
          <span className="presentation-caption-scroll">Scroll to open · L1</span>
        </span>
      </div>

      {/* Mobile: a swipeable two-frame sequence rather than scroll-linked 3D. */}
      {(
        <div className="presentation-box-controls" role="group" aria-label="Presentation box frames"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginTop: '14px',
          }}
        >
          <Label>{frame ? 'Open' : 'Closed'}</Label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <FrameDot active={frame === 0} label="Closed" onClick={() => setFrame(0)} />
            <FrameDot active={frame === 1} label="Open" onClick={() => setFrame(1)} />
          </div>
        </div>
      )}
    </div>
  );
};

const FrameDot: React.FC<{ active: boolean; label: string; onClick: () => void }> = ({
  active,
  label,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={`Show the box ${label.toLowerCase()}`}
    aria-pressed={active}
    style={{
      width: `${c.control.minTap}px`,
      height: `${c.control.minTap}px`,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
    }}
  >
    <span
      style={{
        width: '22px',
        height: '2px',
        background: active ? c.color.gold70 : c.color.hair22,
        transition: `background ${c.motion.l3.duration} ${c.motion.l3.ease}`,
      }}
    />
  </button>
);
