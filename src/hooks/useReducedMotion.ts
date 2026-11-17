import { useSyncExternalStore } from 'react';
const query = '(prefers-reduced-motion: reduce)';
function subscribe(update: () => void) {
  const media = window.matchMedia(query);
  if (media.addEventListener) { media.addEventListener('change', update); return () => media.removeEventListener('change', update); }
  media.addListener(update); return () => media.removeListener(update);
}
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}
