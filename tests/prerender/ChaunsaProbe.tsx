// Diagnostic fixture only. Never imported by src/main.tsx or the production build.
import React, { Suspense } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrandProvider } from '../../src/context/BrandContext';
import { ScrollProvider } from '../../src/context/ScrollContext';
import { BasketProvider } from '../../src/context/BasketContext';
import { SiteHeader } from '../../src/components/dom/SiteHeader';
import { ProductDetail } from '../../src/components/commercial/ProductDetail';
import { BasketLauncher, BasketDrawer, BasketAnnouncements } from '../../src/components/commercial/Basket';
import '../../src/index.css';

const navigate = (path: string) => { if (typeof window !== 'undefined') window.location.assign(path); };

export function ChaunsaProbe() {
  return <React.StrictMode><BrandProvider><ScrollProvider><BasketProvider>
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', backgroundColor: '#16150f' }}>
      <SiteHeader onNavigateRoute={navigate} />
      <Suspense fallback={null}>
        <ProductDetail categorySlug="mangoes" slug="chaunsa" onNavigateRoute={navigate} />
      </Suspense>
      <BasketLauncher productPage />
      <BasketDrawer onNavigateRoute={navigate} />
      <BasketAnnouncements />
    </div>
  </BasketProvider></ScrollProvider></BrandProvider></React.StrictMode>;
}

if (typeof document !== 'undefined') {
  hydrateRoot(document.getElementById('root')!, <ChaunsaProbe />, {
    onRecoverableError(error) {
      const diagnostic = window as Window & { __probeHydrationErrors?: string[] };
      (diagnostic.__probeHydrationErrors ??= []).push(String(error));
    },
  });
}
