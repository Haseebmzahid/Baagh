import React, { useEffect, useRef, useState } from 'react';
import type { FruitConfig, FruitSceneEngine, FruitSceneFactory, ScreenPoint } from './core/types';
import { sceneQuality } from './core/performance';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface FruitViewerProps {
  config: FruitConfig;
  loadFactory: () => Promise<FruitSceneFactory>;
  onPointsUpdate: (points: ScreenPoint[]) => void;
  onProgressUpdate: (progress: number) => void;
  onInteraction: () => void;
  onError: (err: Error) => void;
}

export const FruitViewer: React.FC<FruitViewerProps> = ({ config, loadFactory, onPointsUpdate, onProgressUpdate, onInteraction, onError }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    let cancelled = false;
    let scene: FruitSceneEngine | undefined;
    let cleanup = () => {};
    let startFrame = 0;
    const started = performance.now();
    setReady(false);
    // The narrative and loading state can paint before procedural scene work begins.
    void loadFactory().then(factory => {
      if (cancelled) return;
      startFrame = requestAnimationFrame(() => {
        if (cancelled) return;
        try {
          const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
          const quality = sceneQuality(window.innerWidth, window.innerHeight, nav.hardwareConcurrency || 8, nav.deviceMemory ?? 8, nav.connection?.saveData);
          const buildStarted = performance.now();
          scene = factory(canvas, { ...quality, reducedMotion, onFrame: (points, progress) => {
            if (cancelled) return;
            onPointsUpdate(points);
            onProgressUpdate(progress);
          }});
          const buildMs = Math.round(performance.now() - buildStarted);
          scene.setExposure(config.defaultExposure);
          const updateProgress = () => {
            const doc = document.scrollingElement || document.documentElement;
            const max = doc.scrollHeight - window.innerHeight;
            const progress = max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0;
            scene?.setProgress(progress);
            if (progress > 0.01) onInteraction();
          };
          const resize = () => { scene?.resize(); updateProgress(); };
          let pointerId: number | null = null;
          let lastX = 0;
          let lastY = 0;
          const down = (event: PointerEvent) => {
            if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
            pointerId = event.pointerId;
            lastX = event.clientX; lastY = event.clientY;
            stage.style.cursor = 'grabbing';
            onInteraction();
          };
          const move = (event: PointerEvent) => {
            if (event.pointerId !== pointerId) return;
            scene?.addDrag((event.clientX - lastX) * .006, (event.clientY - lastY) * .0016);
            lastX = event.clientX; lastY = event.clientY;
          };
          const up = () => { pointerId = null; stage.style.cursor = 'grab'; };
          const contextLost = (event: Event) => {
            event.preventDefault();
            onError(new Error('Graphics context lost'));
          };
          stage.addEventListener('pointerdown', down);
          window.addEventListener('pointermove', move, { passive: true });
          window.addEventListener('pointerup', up);
          window.addEventListener('pointercancel', up);
          window.addEventListener('blur', up);
          canvas.addEventListener('webglcontextlost', contextLost);
          window.addEventListener('scroll', updateProgress, { passive: true });
          window.addEventListener('resize', resize, { passive: true });
          cleanup = () => {
            stage.removeEventListener('pointerdown', down);
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
            window.removeEventListener('pointercancel', up);
            window.removeEventListener('blur', up);
            canvas.removeEventListener('webglcontextlost', contextLost);
            window.removeEventListener('scroll', updateProgress);
            window.removeEventListener('resize', resize);
          };
          const renderStarted = performance.now();
          scene.renderAt(0);
          const firstRenderMs = Math.round(performance.now() - renderStarted);
          updateProgress();
          setReady(true);
          (window as any).__fruitScene = scene;
          (window as any).__fruitPerformance = { fruit: config.id, readyMs: Math.round(performance.now() - started), buildMs, firstRenderMs, lowPerformance: quality.lowPerformance };
        } catch (error) {
          scene?.dispose();
          scene = undefined;
          cleanup();
          onError(error instanceof Error ? error : new Error(String(error)));
        }
      });
    }).catch(error => { if (!cancelled) onError(error instanceof Error ? error : new Error(String(error))); });
    return () => {
      cancelled = true;
      cancelAnimationFrame(startFrame);
      cleanup();
      scene?.dispose();
      if ((window as any).__fruitScene === scene) delete (window as any).__fruitScene;
    };
  }, [loadFactory, config, reducedMotion, onError, onPointsUpdate, onProgressUpdate, onInteraction]);

  return <div ref={stageRef} aria-busy={!ready} style={{ position: 'fixed', inset: 0, zIndex: 2, touchAction: 'pan-y', cursor: 'grab' }}>
    <canvas ref={canvasRef} aria-label={`${config.name} interactive three-dimensional study`} role="img" style={{ width: '100%', height: '100%', display: 'block' }} />
    {!ready && <div role="status" style={{ position: 'absolute', top: '24%', left: '50%', transform: 'translateX(-50%)', color: '#e8cfa0', font: '12px/1.8 Work Sans, sans-serif', textAlign: 'center', padding: '18px 26px', background: 'rgba(32,26,19,.8)', border: '1px solid rgba(232,207,160,.2)', borderRadius: '12px' }}>Preparing {config.name}<br /><span style={{ color: '#d4cbbc' }}>Your fruit study is loading.</span></div>}
  </div>;
};
