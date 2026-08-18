import { useState, useEffect } from 'react';
import { tokens } from '../config/tokens';

export type ViewportTier = 'mobile' | 'tablet' | 'desktop';

export interface ViewportState {
  tier: ViewportTier;
  width: number;
  height: number;
  pixelRatio: number;
  maxPixelRatioCap: number;
}

export function useViewportTier(): ViewportState {
  const [viewport, setViewport] = useState<ViewportState>(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1440;
    const h = typeof window !== 'undefined' ? window.innerHeight : 900;
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    return calculateViewport(w, h, dpr);
  });

  useEffect(() => {
    function handleResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      setViewport(calculateViewport(w, h, dpr));
    }

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
}

function calculateViewport(w: number, h: number, dpr: number): ViewportState {
  let tier: ViewportTier = 'desktop';
  let maxPixelRatioCap = 1.85;

  if (w <= tokens.breakpoints.mobileMax) {
    tier = 'mobile';
    maxPixelRatioCap = 1.5;
  } else if (w <= tokens.breakpoints.tabletMax) {
    tier = 'tablet';
    maxPixelRatioCap = 1.6;
  }

  const effectiveDpr = Math.min(dpr, maxPixelRatioCap);

  return {
    tier,
    width: w,
    height: h,
    pixelRatio: effectiveDpr,
    maxPixelRatioCap,
  };
}
