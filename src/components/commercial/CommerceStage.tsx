import React, { useEffect, useRef, useState } from 'react';
import type { Product } from '../../data/types';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { CommerceStageEngine, CommerceStudy } from './commerceStageScene';

interface CommerceStageProps {
  product: Product;
  studies: CommerceStudy[];
  onPortrait: (id: string, source: string) => void;
}

export const CommerceStage: React.FC<CommerceStageProps> = ({ product, studies, onPortrait }) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const engine = useRef<CommerceStageEngine | null>(null);
  const selected = useRef(product.id);
  selected.current = product.id;
  const reduced = useReducedMotion();
  const [state,setState] = useState<'loading'|'ready'|'fallback'>('loading');
  const [paused,setPaused] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let scene: CommerceStageEngine | null = null;
    let observer: IntersectionObserver | undefined;
    let resizeObserver: ResizeObserver | undefined;
    const element = container.current, target = canvas.current;
    if (!element || !target) return;
    setState('loading');
    const scroll = () => scene?.setProgress(-element.getBoundingClientRect().top / Math.max(1,element.offsetHeight));
    const boot = window.setTimeout(() => {
      void import('./commerceStageScene').then(({ createCommerceStage }) => {
        if (cancelled) return;
        try {
          scene = createCommerceStage(target, studies, selected.current, {
            low: window.innerWidth < 760 || (navigator.hardwareConcurrency || 8) <= 4,
            reduced,
            onPortrait: (id,source) => { if (!cancelled) onPortrait(id,source); },
            onError: () => { if (!cancelled) { setState('fallback'); scene?.dispose(); engine.current = null; } },
          });
          engine.current = scene;
          observer = new IntersectionObserver(([entry]) => scene?.setActive(entry.isIntersecting),{threshold:.01});
          observer.observe(element);
          resizeObserver = new ResizeObserver(() => scene?.resize());
          resizeObserver.observe(element);
          scroll();
          setState('ready');
        } catch { if (!cancelled) setState('fallback'); }
      }).catch(() => { if (!cancelled) setState('fallback'); });
    },30);
    window.addEventListener('scroll',scroll,{passive:true});
    return () => {
      cancelled = true;
      clearTimeout(boot);
      window.removeEventListener('scroll',scroll);
      observer?.disconnect();
      resizeObserver?.disconnect();
      scene?.dispose();
      engine.current = null;
    };
  },[studies,onPortrait,reduced]);

  useEffect(() => { engine.current?.select(product.id); },[product.id]);
  useEffect(() => { engine.current?.setMotionEnabled(!paused && !reduced); },[paused,reduced,state]);
  return <div className="everyday-stage" ref={container} data-stage-state={state}
    onPointerMove={(event) => {
      if (reduced || paused || event.pointerType === 'touch') return;
      const rect = event.currentTarget.getBoundingClientRect();
      engine.current?.setPointer((event.clientX-rect.left)/rect.width-.5,(event.clientY-rect.top)/rect.height-.5);
    }} onPointerLeave={() => engine.current?.setPointer(0,0)}>
    <div className={`everyday-stage-fallback${state === 'ready' ? ' is-hidden' : ''}`} role="img" aria-label={`${product.name} illustrated study`}>
      {product.image.src ? <img src={product.image.src} alt={product.image.alt ?? product.name} /> : <svg viewBox="0 0 500 440" aria-hidden="true">
        <defs><radialGradient id="commerce-fruit-light" cx="35%" cy="25%" r="75%"><stop stopColor="#f6d79a"/><stop offset=".4" stopColor={product.image.tint}/><stop offset="1" stopColor="#342416"/></radialGradient></defs>
        <ellipse cx="250" cy="355" rx="172" ry="32" fill="#514736"/>
        <ellipse cx="250" cy="221" rx="89" ry="119" transform="rotate(14 250 221)" fill="url(#commerce-fruit-light)"/>
        <ellipse cx="151" cy="289" rx="69" ry="82" transform="rotate(-53 151 289)" fill="url(#commerce-fruit-light)"/>
        <ellipse cx="337" cy="294" rx="64" ry="75" transform="rotate(43 337 294)" fill="url(#commerce-fruit-light)"/>
      </svg>}
    </div>
    <canvas ref={canvas} role="img" aria-label={`${product.name}, interactive three-dimensional fruit study`} aria-hidden={state !== 'ready'} style={{opacity:state === 'ready' ? 1 : 0}} />
    <span className="everyday-stage-note">{state === 'fallback' ? 'Illustrated study' : state === 'loading' ? 'Preparing the study' : reduced || paused ? 'Still-life study' : 'A living still life'}</span>
    {state === 'ready' && !reduced && <button type="button" className="everyday-stage-motion" aria-pressed={paused} onClick={() => setPaused((previous) => !previous)}>{paused ? 'Resume motion' : 'Pause motion'}</button>}
  </div>;
};
