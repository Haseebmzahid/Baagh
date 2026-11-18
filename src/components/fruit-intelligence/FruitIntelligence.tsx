import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FruitAnnotations } from './FruitAnnotations';
import { FruitExperienceShell } from './FruitExperienceShell';
import { FruitFallback } from './FruitFallback';
import { FruitViewer } from './FruitViewer';
import { ScreenPoint } from './core/types';
import { getFruitEntry } from './fruits';
import './fruitIntelligence.css';

export interface FruitIntelligenceProps {
  fruit?: string; // Default: 'chaunsa'
  onBackToBrand?: () => void;
}

export const FruitIntelligence: React.FC<FruitIntelligenceProps> = ({
  fruit = 'chaunsa',
  onBackToBrand,
}) => {
  const entry = useMemo(() => getFruitEntry(fruit), [fruit]);
  const { config, loadFactory } = entry;

  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [forceFallback, setForceFallback] = useState<boolean>(false);
  const [points, setPoints] = useState<ScreenPoint[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  const [enhanced, setEnhanced] = useState(false);
  const interactive = enhanced && hasWebGL && !forceFallback;

  // Presentation only: the ref runs in React's commit before paint. Semantic
  // children and their first-render props remain identical to the server tree.
  const presentationRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    node.dataset.fiClient = 'true';
    const requestedReading = !enhanced && new URLSearchParams(window.location.search).get('fallback') === 'true';
    node.dataset.fiMode = hasWebGL && !forceFallback && !requestedReading ? 'interactive' : 'reading';
  }, [enhanced, hasWebGL, forceFallback]);

  // Check WebGL availability and URL query parameter
  useEffect(() => {
    setEnhanced(true);
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('fallback') === 'true') {
      setForceFallback(true);
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
    setPoints(previous => previous.length === newPoints.length && previous.every((point, index) => {
      const next = newPoints[index];
      return point.id === next.id && point.front === next.front && Math.abs(point.x - next.x) < .75 && Math.abs(point.y - next.y) < .75;
    }) ? previous : [...newPoints]);
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


  return (
    <div
      key={`fi-container-${fruit}`}
      className="fi-page"
      data-fi-fruit={config.id}
      ref={presentationRef}
      data-fi-client={enhanced}
      data-fi-mode={interactive ? "interactive" : "reading"}
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
      <FruitFallback config={config} />
      <div className="fi-viewer">{hasWebGL && !forceFallback && <FruitViewer
        key={`viewer-${fruit}`}
        config={config}
        loadFactory={loadFactory}
        onPointsUpdate={handlePointsUpdate}
        onProgressUpdate={handleProgressUpdate}
        onInteraction={handleInteraction}
        onError={handleError}
      />}</div>

      {/* Atmospheric Backdrops, 8 Acts Narrative, Rail, Hint, Spacer */}
      <FruitExperienceShell
        key={`shell-${fruit}`}
        config={config}
        progress={progress}
        interactive={interactive}
        hasInteracted={hasInteracted}
      />
      {/* Dynamic 3D Projected DOM Annotations */}
      <FruitAnnotations
        key={`annotations-${fruit}`}
        config={config}
        interactive={interactive}
        points={points}
        progress={progress}
      />

      <button className="fi-view-control" type="button" onClick={() => { if (interactive) setForceFallback(true); else { window.scrollTo(0, 0); setPoints([]); setProgress(0); setHasInteracted(false); setHasWebGL(true); setForceFallback(false); } }} style={{position:'fixed',right:'22px',top:'94px',zIndex:10,minHeight:'44px',padding:'0 16px',border:'1px solid #e8cfa044',background:'rgba(33,30,23,.85)',color:'#e8cfa0',borderRadius:'8px',cursor:'pointer'}}>{interactive ? "Reading view" : "Try 3D view"}</button>

      {/* Optional Top Nav / Return Bar if integrated in multi-experience site */}
      {onBackToBrand && (
        <button
          onClick={onBackToBrand}
          style={{
            position: 'fixed',
            top: '94px',
            left: 'clamp(20px, 5vw, 84px)',
            zIndex: 10,
            background: 'transparent',
            border: 'none',
            color: 'rgba(242,232,216,0.6)',
            minHeight: '44px',
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
