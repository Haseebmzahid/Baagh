import React, { lazy, Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { ChapterRail } from './components/dom/ChapterRail';
import { FallbackView } from './components/dom/FallbackView';
import { GradeOverlay } from './components/dom/GradeOverlay';
import { ScrollCue } from './components/dom/ScrollCue';
import { ScrollSpacer } from './components/dom/ScrollSpacer';
import { SiteHeader } from './components/dom/SiteHeader';
import { EverydayFresh } from './components/commercial/EverydayFresh';
import { NotFound } from './components/commercial/NotFound';
import { SiteFooter } from './components/information/SiteFooter';
import { type SitePageId } from './data/sitePageRegistry';
import { applySeo } from './seo/head';
import { seoForRoute } from './seo/pages';
import { cueConfigs } from './config/cueConfig';
import { BrandProvider } from './context/BrandContext';
import { ScrollProvider } from './context/ScrollContext';
import { useWebGLCapability } from './hooks/useWebGLCapability';
import { BasketProvider, useBasket } from './context/BasketContext';
import { BasketAnnouncements, BasketDrawer, BasketLauncher, BasketReview } from './components/commercial/Basket';
import { collectionFromHash, resolveRoute } from './navigation/route';
import { gridFilters } from './data/catalogue';
import type { ViewMode, ProductRoute } from './navigation/route';

const CinemaStage = lazy(() => import('./components/canvas/CinemaStage').then((module) => ({default:module.CinemaStage})));
const ProductDetail = lazy(() => import('./components/commercial/ProductDetail').then((module) => ({default:module.ProductDetail})));
const Signature = lazy(() => import('./components/commercial/Signature').then((module) => ({default:module.Signature})));
const FruitIntelligence = lazy(() => import('./components/fruit-intelligence/FruitIntelligence').then((module) => ({default:module.FruitIntelligence})));
const InformationPage = lazy(() => import('./components/information/InformationPage').then(module => ({default:module.InformationPage})));

const initialRoute = () => resolveRoute(window.location.pathname,window.location.hash,new URLSearchParams(window.location.search).get('fruit'));

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
  const { closeBasket } = useBasket();
  const { isSupported, errorMessage } = useWebGLCapability();
  const [forceFallback, setForceFallback] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>(() => initialRoute().view);
  const [routeHash, setRouteHash] = useState(() => window.location.hash.toLowerCase());
  const [informationPage, setInformationPage] = useState<SitePageId>(() => initialRoute().page ?? 'our-story');
  const [activeFruit, setActiveFruit] = useState<string>(() => initialRoute().fruit ?? 'chaunsa');
  // Which product the /product/:category/:slug route resolved to.
  const [productRoute, setProductRoute] = useState<ProductRoute>(() => initialRoute().product ?? {categorySlug:'mangoes',slug:'chaunsa'});

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

    const route = resolveRoute(pathname, hash, queryFruit);
    setRouteHash(hash);
    setViewMode(route.view);
    if (route.product) setProductRoute(route.product);
    if (route.fruit) setActiveFruit(route.fruit);
    if (route.page) setInformationPage(route.page);
    if (hash && !['#journey','#signature','#everyday-fresh','#basket','#order'].includes(hash)) {
      const target = route.view === 'everyday-fresh'
        ? collectionFromHash(hash, gridFilters()).target ?? hash.slice(1)
        : hash.slice(1);
      requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView({behavior:'instant'}));
    }
  }, [closeBasket]);

  useEffect(() => {
    applySeo(seoForRoute({ view: viewMode, page: informationPage, fruit: activeFruit, product: productRoute }));
  }, [viewMode, informationPage, activeFruit, productRoute]);

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
  if ((!isSupported || forceFallback) && viewMode === 'journey') {
    return (
      <FallbackView
        reason={errorMessage || (forceFallback ? 'Manual fallback mode test' : null)}
        onNavigateRoute={handleNavigateRoute}
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
        onNavigateRoute={handleNavigateRoute}
      />

      <Suspense fallback={<div role="status" style={{minHeight:'100vh',padding:'140px 40px',color:'#e8cfa0',fontFamily:'Newsreader,serif'}}>Preparing your experience…</div>}>
      {viewMode === 'information' ? (
        <InformationPage key={informationPage} page={informationPage} onNavigateRoute={handleNavigateRoute} />
      ) : viewMode === 'not-found' ? (
        <NotFound onNavigateRoute={handleNavigateRoute} />
      ) : viewMode === 'basket' ? (
        <BasketReview onNavigateRoute={handleNavigateRoute} />
      ) : viewMode === 'everyday-fresh' ? (
        <EverydayFresh onNavigateRoute={handleNavigateRoute} collectionHash={routeHash} />
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
          key={activeFruit}
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
      </Suspense>
      {(viewMode === 'basket' || viewMode === 'not-found') && <div style={{maxWidth:'1440px',margin:'0 auto',padding:'0 clamp(22px,5vw,80px)'}}><SiteFooter onNavigateRoute={handleNavigateRoute} /></div>}
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
