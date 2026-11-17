import React, { lazy, Suspense, useState, useCallback, useRef } from 'react';
import { useBrand } from '../../context/BrandContext';
import './siteHeader.css';
const FruitCabinet = lazy(() => import('../navigation/FruitCabinet').then(module => ({ default: module.FruitCabinet })));
interface SiteHeaderProps {
  onNavigateFruit?: (fruitId: string) => void;
  onNavigateBrand?: () => void;
  onNavigateRoute?: (path: string) => void;
}
export const SiteHeader: React.FC<SiteHeaderProps> = ({ onNavigateFruit, onNavigateBrand, onNavigateRoute }) => {
  const brand = useBrand();
  const [cabinetOpen, setCabinetOpen] = useState(false);
  const cabinetTrigger = useRef<HTMLButtonElement>(null);
  const closeCabinet = useCallback(() => {
    setCabinetOpen(false);
    cabinetTrigger.current?.focus();
  }, []);
  const navigate = (event: React.MouseEvent, path: string) => {
    if (!onNavigateRoute || !path.startsWith('/') || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); setCabinetOpen(false); onNavigateRoute(path);
  };
  const handleFruitSelect = useCallback((fruitId: string) => {
    setCabinetOpen(false);
    if (onNavigateFruit) onNavigateFruit(fruitId);
    else window.location.hash = `#${fruitId}`;
  }, [onNavigateFruit]);
  const handleBrandClick = useCallback((event: React.MouseEvent) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (onNavigateBrand) { event.preventDefault(); setCabinetOpen(false); onNavigateBrand(); }
  }, [onNavigateBrand]);
  return <>
    <header className="site-header" data-cabinet-open={cabinetOpen} style={{
      background: cabinetOpen ? 'rgba(13, 10, 8, 0.85)' : 'linear-gradient(180deg, rgba(13, 10, 8, 0.6) 0%, rgba(13, 10, 8, 0) 100%)',
      backdropFilter: cabinetOpen ? 'blur(16px)' : 'none', WebkitBackdropFilter: cabinetOpen ? 'blur(16px)' : 'none',
    }}>
      <div className="site-header-brand">
        <a className="site-header-wordmark" href="/" onClick={handleBrandClick}>{brand.name}</a>
        <span className="site-header-established">est. {brand.establishedYear}</span>
      </div>
      <nav className="site-header-nav">
        {brand.navLinks.map((link, index) => link.label === 'Fruit Intelligence' ? <button
          key={index} ref={cabinetTrigger} className="site-header-cabinet" data-cabinet-trigger="true"
          aria-expanded={cabinetOpen} aria-haspopup="dialog" aria-controls="fruit-intelligence-cabinet"
          onClick={() => setCabinetOpen(previous => !previous)}>
          <span className="site-header-desktop-label">FRUIT INTELLIGENCE</span>
          <span className="site-header-mobile-label">FRUIT GUIDE</span>
          <span className="site-header-arrow" aria-hidden="true">▼</span>
        </button> : <a key={index} className={link.primary ? 'site-header-order' : 'site-header-link'}
          href={link.href} onClick={event => navigate(event, link.href)}>
          {link.primary ? <><span className="site-header-desktop-label">{link.label}</span><span className="site-header-mobile-label">Order</span></> : link.label}
        </a>)}
      </nav>
    </header>
    {cabinetOpen && <Suspense fallback={null}><FruitCabinet isOpen={cabinetOpen}
      onClose={closeCabinet} onSelectFruit={handleFruitSelect} /></Suspense>}
  </>;
};
