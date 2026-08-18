import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FruitAnnotations } from './FruitAnnotations';
import { FruitExperienceShell } from './FruitExperienceShell';
import { FruitFallback } from './FruitFallback';
import { FruitViewer } from './FruitViewer';
import { ScreenPoint } from './core/types';
import { getFruitEntry } from './fruits';

export interface FruitIntelligenceProps {
  fruit?: string; // Default: 'chaunsa'
  onBackToBrand?: () => void;
}

export const FruitIntelligence: React.FC<FruitIntelligenceProps> = ({
  fruit = 'chaunsa',
  onBackToBrand,
}) => {
  const entry = useMemo(() => getFruitEntry(fruit), [fruit]);
  const { config, factory } = entry;

  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [forceFallback, setForceFallback] = useState<boolean>(false);
  const [points, setPoints] = useState<ScreenPoint[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  // Check WebGL availability and URL query parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('fallback') === 'true') {
      setForceFallback(true);
    }

    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
      }
    } catch {
      setHasWebGL(false);
    }

    // Expose debug hook for verification testing
    (window as any).__toggleFruitFallback = (force?: boolean) => {
      setForceFallback((prev) => (typeof force === 'boolean' ? force : !prev));
    };
  }, []);

  // Ensure scroll is reset to top whenever fruit changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setProgress(0);
    setHasInteracted(false);
  }, [fruit]);

  const handlePointsUpdate = useCallback((newPoints: ScreenPoint[]) => {
    setPoints([...newPoints]);
  }, []);

  const handleProgressUpdate = useCallback((newProgress: number) => {
    setProgress(newProgress);
  }, []);

  const handleInteraction = useCallback(() => {
    setHasInteracted(true);
  }, []);

  const handleError = useCallback((err: Error) => {
    console.error('FruitIntelligence WebGL Error:', err);
    setHasWebGL(false);
  }, []);

  if (!hasWebGL || forceFallback) {
    return (
      <FruitFallback
        config={config}
        reason={forceFallback ? 'Manual fallback mode test' : 'WebGL unsupported'}
      />
    );
  }

  return (
    <div
      key={`fi-container-${fruit}`}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#100d0a',
        color: '#f2e8d8',
        fontFamily: "'Work Sans', system-ui, sans-serif",
        overflowX: 'hidden',
      }}
    >
      {/* 3D WebGL Canvas Layer */}
      <FruitViewer
        key={`viewer-${fruit}`}
        config={config}
        factory={factory}
        onPointsUpdate={handlePointsUpdate}
        onProgressUpdate={handleProgressUpdate}
        onInteraction={handleInteraction}
        onError={handleError}
      />

      {/* Dynamic 3D Projected DOM Annotations */}
      <FruitAnnotations
        key={`annotations-${fruit}`}
        config={config}
        points={points}
        progress={progress}
      />

      {/* Atmospheric Backdrops, 8 Acts Narrative, Rail, Hint, Spacer */}
      <FruitExperienceShell
        key={`shell-${fruit}`}
        config={config}
        progress={progress}
        hasInteracted={hasInteracted}
      />

      {/* Optional Top Nav / Return Bar if integrated in multi-experience site */}
      {onBackToBrand && (
        <button
          onClick={onBackToBrand}
          style={{
            position: 'fixed',
            top: '24px',
            left: 'clamp(20px, 5vw, 84px)',
            zIndex: 10,
            background: 'transparent',
            border: 'none',
            color: 'rgba(242,232,216,0.6)',
            fontSize: '11px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            fontFamily: "'Work Sans', system-ui, sans-serif",
          }}
          onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#e8b45c')}
          onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'rgba(242,232,216,0.6)')}
        >
          ← BACK TO BAAGH
        </button>
      )}
    </div>
  );
};

export default FruitIntelligence;
