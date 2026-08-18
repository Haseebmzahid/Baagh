import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FruitConfig, FruitSceneEngine, FruitSceneFactory, ScreenPoint } from './core/types';

interface FruitViewerProps {
  config: FruitConfig;
  factory: FruitSceneFactory;
  onPointsUpdate: (points: ScreenPoint[]) => void;
  onProgressUpdate: (progress: number) => void;
  onInteraction: () => void;
  onError: (err: Error) => void;
}

export const FruitViewer: React.FC<FruitViewerProps> = ({
  config,
  factory,
  onPointsUpdate,
  onProgressUpdate,
  onInteraction,
  onError,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<FruitSceneEngine | null>(null);
  const [cursorGrab, setCursorGrab] = useState<'grab' | 'grabbing'>('grab');

  // Handle pointer / touch dragging with inertia
  const bindDragGestures = useCallback((stageEl: HTMLElement, scene: FruitSceneEngine) => {
    let isDown = false;
    let lastX = 0;
    let lastY = 0;

    const start = (x: number, y: number) => {
      isDown = true;
      lastX = x;
      lastY = y;
      setCursorGrab('grabbing');
      onInteraction();
    };

    const move = (x: number, y: number) => {
      if (!isDown) return;
      const dx = (x - lastX) * 0.006;
      const dy = (y - lastY) * 0.0016;
      scene.addDrag(dx, dy);
      lastX = x;
      lastY = y;
    };

    const end = () => {
      isDown = false;
      setCursorGrab('grab');
    };

    const onPointerDown = (e: PointerEvent) => start(e.clientX, e.clientY);
    const onPointerMove = (e: PointerEvent) => move(e.clientX, e.clientY);
    const onPointerUp = () => end();
    const onPointerCancel = () => end();

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        start(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        move(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => end();

    stageEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);

    stageEl.addEventListener('touchstart', onTouchStart, { passive: true });
    stageEl.addEventListener('touchmove', onTouchMove, { passive: true });
    stageEl.addEventListener('touchend', onTouchEnd);

    return () => {
      stageEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);

      stageEl.removeEventListener('touchstart', onTouchStart);
      stageEl.removeEventListener('touchmove', onTouchMove);
      stageEl.removeEventListener('touchend', onTouchEnd);
    };
  }, [onInteraction]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    // Detect hardware capability
    const isLowPerf =
      Math.min(window.innerWidth, window.innerHeight) < 760 ||
      (navigator.hardwareConcurrency || 8) <= 4;

    // Reset every native scroll root BEFORE the scene is built, so the route
    // transition can never leave a stale offset behind for the scroll handler.
    const resetScrollRoots = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      if (document.scrollingElement) {
        document.scrollingElement.scrollTop = 0;
      }
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    if ('scrollRestoration' in window.history) {
      try {
        window.history.scrollRestoration = 'manual';
      } catch {
        // ignore
      }
    }
    resetScrollRoots();

    let scene: FruitSceneEngine;
    try {
      scene = factory(canvas, {
        lowPerformance: isLowPerf,
        onFrame: (points, currentProg) => {
          onPointsUpdate(points);
          onProgressUpdate(currentProg);
        },
      });
      sceneRef.current = scene;
      (window as any).__fruitScene = scene;
    } catch (err) {
      console.error('Failed to create fruit scene:', err);
      onError(err instanceof Error ? err : new Error(String(err)));
      return;
    }

    // Initialize the 3D scene explicitly at progress 0
    scene.setExposure(config.defaultExposure);
    scene.setProgress(0);
    scene.renderAt(0);

    const onScroll = () => {
      const doc = document.scrollingElement || document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const currentScroll = doc.scrollTop || window.scrollY || 0;
      const progress = max > 0 ? Math.min(1, Math.max(0, currentScroll / max)) : 0;
      scene.setProgress(progress);
      if (progress > 0.01) {
        onInteraction();
      }
    };

    const onResize = () => {
      scene.resize();
      onScroll();
    };

    // Attach only now that the scroll roots are zeroed and the scene is seeded
    // at 0. onScroll always re-reads the live scroll position, so a scroll
    // event queued by the route transition cannot replay a stale offset.
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    onScroll();

    // Re-assert the baseline once the incoming layout has settled, in case the
    // outgoing page's scroll space was released after this effect ran.
    // Scheduled on both a frame and a task, so it still runs when rAF is
    // throttled (background tab); whichever fires first wins.
    let settled = false;
    const settleBaseline = () => {
      if (settled) return;
      settled = true;
      const doc = document.scrollingElement || document.documentElement;
      if ((doc.scrollTop || window.scrollY || 0) === 0) return;
      resetScrollRoots();
      scene.setProgress(0);
      scene.renderAt(0);
    };
    const settleRaf = requestAnimationFrame(settleBaseline);
    const settleTimer = window.setTimeout(settleBaseline, 0);

    const unbindDrag = bindDragGestures(stage, scene);

    return () => {
      cancelAnimationFrame(settleRaf);
      window.clearTimeout(settleTimer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      unbindDrag();
      scene.dispose();
      sceneRef.current = null;
    };
  }, [factory, config, bindDragGestures, onError, onPointsUpdate, onProgressUpdate, onInteraction]);

  return (
    <div
      ref={stageRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2,
        touchAction: 'pan-y',
        cursor: cursorGrab,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  );
};
