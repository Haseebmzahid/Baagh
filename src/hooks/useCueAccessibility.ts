import { useEffect, useRef } from 'react';

export function useCueAccessibility(elementRef: React.RefObject<HTMLElement | null>, opacity: number) {
  const isInteractiveRef = useRef<boolean>(false);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const isInteractive = opacity > 0.6;
    if (isInteractive !== isInteractiveRef.current) {
      isInteractiveRef.current = isInteractive;
      if (isInteractive) {
        el.removeAttribute('inert');
        el.setAttribute('aria-hidden', 'false');
        el.style.pointerEvents = 'auto';
      } else {
        el.setAttribute('inert', '');
        el.setAttribute('aria-hidden', 'true');
        el.style.pointerEvents = 'none';
      }
    }
  }, [elementRef, opacity]);
}
