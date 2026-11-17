import { useSyncExternalStore } from 'react';
import { tokens } from '../config/tokens';

export type ViewportTier = 'mobile' | 'tablet' | 'desktop';

export interface ViewportState {
  tier: ViewportTier;
  width: number;
  height: number;
  pixelRatio: number;
  maxPixelRatioCap: number;
}

const serverViewport = calculateViewport(1440, 900, 1);
let browserViewport: ViewportState | undefined;
function readViewport(): ViewportState {
  const w = window.innerWidth, h = window.innerHeight, dpr = window.devicePixelRatio || 1;
  if (!browserViewport || browserViewport.width !== w || browserViewport.height !== h || browserViewport.pixelRatio !== Math.min(dpr, browserViewport.maxPixelRatioCap)) {
    browserViewport = calculateViewport(w, h, dpr);
  }
  return browserViewport;
}
function subscribeViewport(update: () => void) {
  window.addEventListener('resize', update, { passive: true });
  return () => window.removeEventListener('resize', update);
}
export function useViewportTier(): ViewportState {
  return useSyncExternalStore(subscribeViewport, readViewport, () => serverViewport);
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
