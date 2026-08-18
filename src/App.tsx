import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CinemaStage } from './components/canvas/CinemaStage';
import { ChapterRail } from './components/dom/ChapterRail';
import { FallbackView } from './components/dom/FallbackView';
import { GradeOverlay } from './components/dom/GradeOverlay';
import { ScrollCue } from './components/dom/ScrollCue';
import { ScrollSpacer } from './components/dom/ScrollSpacer';
import { SiteHeader } from './components/dom/SiteHeader';
import { FruitIntelligence } from './components/fruit-intelligence/FruitIntelligence';
import { cueConfigs } from './config/cueConfig';
import { BrandProvider } from './context/BrandContext';
import { ScrollProvider } from './context/ScrollContext';
import { useWebGLCapability } from './hooks/useWebGLCapability';

// Take control of scroll restoration at module-evaluation time, before React
// renders and before any route handler or scroll listener can sample a
// browser-restored offset.
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  try {
    window.history.scrollRestoration = 'manual';
  } catch {
    // ignore
  }
}

export const AppContent: React.FC = () => {
  const { isSupported, errorMessage } = useWebGLCapability();
  const [forceFallback, setForceFallback] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'journey' | 'fruit-intelligence'>('journey');
  const [activeFruit, setActiveFruit] = useState<string>('chaunsa');

  // Always reflects the current view, so a late context-loss callback cannot
  // act on the view that was active when it was registered.
  const viewModeRef = useRef(viewMode);
  viewModeRef.current = viewMode;

  const handleStageContextLost = useCallback(() => {
    // The journey canvas only owns the journey view. Fruit Intelligence runs
    // its own renderer and has its own fallback, so a loss reported here must
    // not tear down a fruit experience that is running fine.
    if (viewModeRef.current === 'journey') {
      setForceFallback(true);
    }
  }, []);

  const handleRoute = useCallback(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const queryFruit = searchParams.get('fruit');
    const hash = window.location.hash.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    if (
      pathname === '/fruit-intelligence/apple' ||
      pathname.startsWith('/fruit-intelligence/apple') ||
      queryFruit === 'apple' ||
      hash === '#apple'
    ) {
      setViewMode('fruit-intelligence');
      setActiveFruit('apple');
    } else if (
      pathname === '/fruit-intelligence/kinnow' ||
      pathname.startsWith('/fruit-intelligence/kinnow') ||
      queryFruit === 'kinnow' ||
      hash === '#kinnow'
    ) {
      setViewMode('fruit-intelligence');
      setActiveFruit('kinnow');
    } else if (
      pathname === '/fruit-intelligence/chaunsa' ||
      pathname.startsWith('/fruit-intelligence/chaunsa') ||
      pathname === '/fruit-intelligence' ||
      queryFruit === 'chaunsa' ||
      hash === '#chaunsa' ||
      hash === '#fruit-intelligence'
    ) {
      setViewMode('fruit-intelligence');
      setActiveFruit('chaunsa');
    } else {
      setViewMode('journey');
    }
  }, []);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      try {
        window.history.scrollRestoration = 'manual';
      } catch {
        // ignore
      }
    }
    handleRoute();
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('popstate', handleRoute);
    return () => {
      window.removeEventListener('hashchange', handleRoute);
      window.removeEventListener('popstate', handleRoute);
    };
  }, [handleRoute]);

  const handleNavigateFruit = useCallback((fruitId: string) => {
    const cleanId = fruitId.toLowerCase();
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.history.pushState(null, '', `/fruit-intelligence/${cleanId}`);
    setActiveFruit(cleanId);
    setViewMode('fruit-intelligence');
  }, []);

  const handleNavigateBrand = useCallback(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.history.pushState(null, '', '/');
    setViewMode('journey');
  }, []);

  // Expose window debug hook for testing
  useEffect(() => {
    (window as any).__toggleFallback = (force?: boolean) => {
      setForceFallback((prev) => (typeof force === 'boolean' ? force : !prev));
    };
    (window as any).__setExperience = (mode: 'journey' | 'fruit-intelligence', fruit = 'chaunsa') => {
      setViewMode(mode);
      setActiveFruit(fruit);
      window.history.pushState(null, '', mode === 'journey' ? '#journey' : `?fruit=${fruit}#${fruit}`);
    };
  }, []);

  if (!isSupported || forceFallback) {
    return (
      <FallbackView
        reason={errorMessage || (forceFallback ? 'Manual fallback mode test' : null)}
      />
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        backgroundColor: viewMode === 'journey' ? '#16150f' : '#100d0a',
      }}
    >
      {/* Global Navigation Header with 3D Specimen Cabinet */}
      <SiteHeader
        onNavigateFruit={handleNavigateFruit}
        onNavigateBrand={handleNavigateBrand}
      />

      {viewMode === 'fruit-intelligence' ? (
        <FruitIntelligence
          fruit={activeFruit}
          onBackToBrand={handleNavigateBrand}
        />
      ) : (
        <>
          {/* 3D WebGL Canvas Layer */}
          <CinemaStage onContextLost={handleStageContextLost} />

          {/* CSS Grade Overlay (Vignette, Split-tone, Film grain) */}
          <GradeOverlay />

          {/* Chapter Rail */}
          <ChapterRail />

          {/* 10 Scroll Cues Overlay */}
          {cueConfigs.map((cue) => (
            <ScrollCue key={cue.id} config={cue} />
          ))}

          {/* Native Scroll Spacer (940vh) */}
          <ScrollSpacer />
        </>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrandProvider>
      <ScrollProvider>
        <AppContent />
      </ScrollProvider>
    </BrandProvider>
  );
};

export default App;
