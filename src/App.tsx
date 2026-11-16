import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CinemaStage } from './components/canvas/CinemaStage';
import { ChapterRail } from './components/dom/ChapterRail';
import { FallbackView } from './components/dom/FallbackView';
import { GradeOverlay } from './components/dom/GradeOverlay';
import { ScrollCue } from './components/dom/ScrollCue';
import { ScrollSpacer } from './components/dom/ScrollSpacer';
import { SiteHeader } from './components/dom/SiteHeader';
import { EverydayFresh } from './components/commercial/EverydayFresh';
import { ProductDetail } from './components/commercial/ProductDetail';
import { Signature } from './components/commercial/Signature';
import { FruitIntelligence } from './components/fruit-intelligence/FruitIntelligence';
import { cueConfigs } from './config/cueConfig';
import { BrandProvider } from './context/BrandContext';
import { ScrollProvider } from './context/ScrollContext';
import { useWebGLCapability } from './hooks/useWebGLCapability';
import { BasketProvider, useBasket } from './context/BasketContext';
import { BasketAnnouncements, BasketDrawer, BasketLauncher, BasketReview } from './components/commercial/Basket';

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

type ViewMode =
  | 'journey'
  | 'fruit-intelligence'
  | 'everyday-fresh'
  | 'product'
  | 'basket'
  | 'signature';

interface ProductRoute {
  categorySlug: string;
  slug: string;
}

/**
 * Matches the commercial product route.
 *
 * Canonical form is /product/:category/:slug. The approved Product Detail
 * design also shows the breadcrumb path /everyday-fresh/:category/:slug, so
 * that form resolves to the same page rather than 404-ing.
 */
function matchProductRoute(pathname: string): ProductRoute | null {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length !== 3) return null;
  if (parts[0] !== 'product' && parts[0] !== 'everyday-fresh') return null;
  return { categorySlug: parts[1], slug: parts[2] };
}

export const AppContent: React.FC = () => {
  const { closeBasket } = useBasket();
  const { isSupported, errorMessage } = useWebGLCapability();
  const [forceFallback, setForceFallback] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('journey');
  const [activeFruit, setActiveFruit] = useState<string>('chaunsa');
  // Which product the /product/:category/:slug route resolved to.
  const [productRoute, setProductRoute] = useState<ProductRoute>({
    categorySlug: 'mangoes',
    slug: 'chaunsa',
  });

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
    closeBasket();
    const searchParams = new URLSearchParams(window.location.search);
    const queryFruit = searchParams.get('fruit');
    const hash = window.location.hash.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Commercial routes are matched first, because the product route lives
    // under both /product/... and the /everyday-fresh/... breadcrumb path and
    // would otherwise be swallowed by the Everyday Fresh prefix match below.
    const productMatch = matchProductRoute(pathname);
    if (pathname === '/basket' || hash === '#basket') {
      setViewMode('basket');
    } else if (productMatch) {
      setProductRoute(productMatch);
      setViewMode('product');
    } else if (pathname === '/signature' || hash === '#signature') {
      setViewMode('signature');
    } else if (
      pathname === '/everyday-fresh' ||
      pathname.startsWith('/everyday-fresh') ||
      hash === '#everyday-fresh'
    ) {
      setViewMode('everyday-fresh');
    } else if (
      pathname === '/fruit-intelligence/apple' ||
      pathname.startsWith('/fruit-intelligence/apple') ||
      queryFruit === 'apple' ||
      hash === '#apple'
    ) {
      setViewMode('fruit-intelligence');
      setActiveFruit('apple');
    } else if (
      pathname === '/fruit-intelligence/anaar' ||
      pathname.startsWith('/fruit-intelligence/anaar') ||
      queryFruit === 'anaar' ||
      hash === '#anaar'
    ) {
      setViewMode('fruit-intelligence');
      setActiveFruit('anaar');
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
  }, [closeBasket]);

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
    closeBasket();
    const cleanId = fruitId.toLowerCase();
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.history.pushState(null, '', `/fruit-intelligence/${cleanId}`);
    setActiveFruit(cleanId);
    setViewMode('fruit-intelligence');
  }, [closeBasket]);

  const handleNavigateBrand = useCallback(() => {
    closeBasket();
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.history.pushState(null, '', '/');
    setViewMode('journey');
  }, [closeBasket]);

  const handleNavigateRoute = useCallback((path: string) => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.history.pushState(null, '', path);
    handleRoute();
  }, [handleRoute]);

  // Expose window debug hook for testing
  useEffect(() => {
    (window as any).__toggleFallback = (force?: boolean) => {
      setForceFallback((prev) => (typeof force === 'boolean' ? force : !prev));
    };
    (window as any).__setExperience = (mode: ViewMode, fruit = 'chaunsa') => {
      setViewMode(mode);
      setActiveFruit(fruit);
      window.history.pushState(null, '', mode === 'journey' ? '#journey' : `?fruit=${fruit}#${fruit}`);
    };
  }, []);

  // The new review route remains a DOM shopping surface without WebGL.
  // Broader graphics-failure remediation stays in its separately planned task.
  if ((!isSupported || forceFallback) && viewMode !== 'basket') {
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
        backgroundColor:
          viewMode === 'fruit-intelligence'
            ? '#100d0a'
            : viewMode === 'signature'
              ? '#100f0a'
              : '#16150f',
      }}
    >
      {/* Global Navigation Header with 3D Specimen Cabinet */}
      <SiteHeader
        onNavigateFruit={handleNavigateFruit}
        onNavigateBrand={handleNavigateBrand}
      />

      {viewMode === 'basket' ? (
        <BasketReview onNavigateRoute={handleNavigateRoute} />
      ) : viewMode === 'everyday-fresh' ? (
        <EverydayFresh onNavigateRoute={handleNavigateRoute} />
      ) : viewMode === 'product' ? (
        <ProductDetail
          categorySlug={productRoute.categorySlug}
          slug={productRoute.slug}
          onNavigateRoute={handleNavigateRoute}
        />
      ) : viewMode === 'signature' ? (
        <Signature onNavigateRoute={handleNavigateRoute} />
      ) : viewMode === 'fruit-intelligence' ? (
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
      {(viewMode === 'everyday-fresh' || viewMode === 'product' || viewMode === 'signature') && (
        <BasketLauncher productPage={viewMode === 'product'} />
      )}
      <BasketDrawer onNavigateRoute={handleNavigateRoute} />
      <BasketAnnouncements />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrandProvider>
      <ScrollProvider>
        <BasketProvider><AppContent /></BasketProvider>
      </ScrollProvider>
    </BrandProvider>
  );
};

export default App;
