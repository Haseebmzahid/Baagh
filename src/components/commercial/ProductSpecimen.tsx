import React, { useEffect, useRef, useState } from 'react';
import { commercial as c } from './theme';
import { SpecimenPlate, useHasPointer, usePrefersReducedMotion } from './primitives';
import { createSpecimenScene, specimenFruitFor } from './specimenScene';
import type { SpecimenEngine } from './specimenScene';
import { useWebGLCapability } from '../../hooks/useWebGLCapability';
import type { Product } from '../../data/catalogue';

/**
 * The Product Detail specimen.
 *
 * ONE renderer, owned by this component, mounted once per Product Detail page.
 * It reuses the Fruit Intelligence fruit representation through
 * specimenScene.ts rather than embedding the Fruit Intelligence experience,
 * which stays a separate destination.
 *
 * Falls back to the CSS specimen plate whenever WebGL is unavailable, the
 * context is lost, or the product has no existing fruit representation. The
 * fallback is the same plate the cards use, so the page never looks broken.
 */

export interface ProductSpecimenProps {
  product: Product;
  ratio?: string;
  /** Basket thumbnail: existing geometry at low detail, without the inspection caption. */
  compact?: boolean;
}

export const ProductSpecimen: React.FC<ProductSpecimenProps> = ({
  product,
  ratio = '1 / 1',
  compact = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<SpecimenEngine | null>(null);

  const { isSupported } = useWebGLCapability();
  const hasPointer = useHasPointer();
  const reduced = usePrefersReducedMotion();
  const [failed, setFailed] = useState(false);

  // A product that has a Fruit Intelligence study reuses that fruit's body.
  // Anything else falls back to its category's representative fruit, and to
  // the CSS plate when neither applies.
  const fruit = product.fruitIntelligenceSlug ?? specimenFruitFor(product.id, product.category);
  const use3D = isSupported && !failed && fruit !== null;

  useEffect(() => {
    if (!use3D || !fruit) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const lowPerformance =
      compact || Math.min(window.innerWidth, window.innerHeight) < 760 ||
      (navigator.hardwareConcurrency || 8) <= 4;

    let engine: SpecimenEngine;
    try {
      engine = createSpecimenScene(canvas, fruit, product.id, {
        lowPerformance,
        reducedMotion: reduced,
        onContextLost: () => setFailed(true),
      });
    } catch (err) {
      console.warn('Product specimen unavailable, using the plate instead:', err);
      setFailed(true);
      return;
    }
    engineRef.current = engine;

    // Idle the loop whenever the specimen is off screen, so a long product
    // page is not paying for a render it cannot see.
    const io = new IntersectionObserver(
      ([entry]) => engine.setActive(entry.isIntersecting),
      { threshold: 0.01 }
    );
    io.observe(wrap);

    const ro = new ResizeObserver(() => engine.resize());
    ro.observe(wrap);

    return () => {
      io.disconnect();
      ro.disconnect();
      engine.dispose();
      engineRef.current = null;
    };
  }, [use3D, fruit, product.id, reduced, compact]);

  // --- desktop: pointer tilt ------------------------------------------------
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!hasPointer || !engineRef.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    engineRef.current.setPointer(
      (e.clientX - r.left) / r.width - 0.5,
      (e.clientY - r.top) / r.height - 0.5
    );
  };

  const handlePointerLeave = () => {
    engineRef.current?.setPointer(0, 0);
  };

  // --- touch: swipe to turn, no tilt ---------------------------------------
  const touchX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchX.current === null || !engineRef.current) return;
    const x = e.touches[0]?.clientX ?? touchX.current;
    engineRef.current.addSwipe(x - touchX.current);
    touchX.current = x;
  };

  const handleTouchEnd = () => {
    touchX.current = null;
  };

  if (!use3D) {
    return (
      <SpecimenPlate
        tint={product.image.tint}
        ratio={ratio}
        drift={!compact}
        label={compact ? undefined : product.image.note ?? 'Specimen placeholder'}
      />
    );
  }

  return (
    <div
      ref={wrapRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: ratio,
        background: c.color.deep,
        overflow: 'hidden',
        // Vertical scrolling must keep working over the specimen on touch.
        touchAction: 'pan-y',
      }}
    >
      {/* The lit well the specimen sits in — the same language as the plate. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(56% 48% at 44% 38%, ${product.image.tint}22 0%, rgba(16,15,10,.6) 58%, ${c.color.deep} 100%)`,
        }}
      />

      <canvas
        ref={canvasRef}
        aria-label={`${product.name} specimen`}
        role="img"
        style={{ position: 'relative', width: '100%', height: '100%', display: 'block' }}
      />

      {!compact && <span
        style={{
          position: 'absolute',
          left: '14px',
          bottom: '13px',
          fontFamily: c.font.mono,
          fontSize: '8px',
          letterSpacing: '.2em',
          textTransform: 'uppercase',
          color: 'rgba(244,238,226,.34)',
          pointerEvents: 'none',
        }}
      >
        {hasPointer ? 'Move to inspect' : 'Swipe to turn'}
      </span>}
    </div>
  );
};
