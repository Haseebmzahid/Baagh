import React, { useState, useCallback } from 'react';
import { useBrand } from '../../context/BrandContext';
import { useViewportTier } from '../../hooks/useViewportTier';
import { FruitCabinet } from '../navigation/FruitCabinet';

interface SiteHeaderProps {
  onNavigateFruit?: (fruitId: string) => void;
  onNavigateBrand?: () => void;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  onNavigateFruit,
  onNavigateBrand,
}) => {
  const brand = useBrand();
  const { tier } = useViewportTier();
  const [cabinetOpen, setCabinetOpen] = useState<boolean>(false);

  const isMobile = tier === 'mobile';

  const handleFruitSelect = useCallback(
    (fruitId: string) => {
      setCabinetOpen(false);
      if (onNavigateFruit) {
        onNavigateFruit(fruitId);
      } else {
        window.location.hash = `#${fruitId}`;
      }
    },
    [onNavigateFruit]
  );

  const handleBrandClick = useCallback(
    (e: React.MouseEvent) => {
      if (onNavigateBrand) {
        e.preventDefault();
        setCabinetOpen(false);
        onNavigateBrand();
      }
    },
    [onNavigateBrand]
  );

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '16px 20px' : '24px 40px',
          pointerEvents: 'auto',
          background: cabinetOpen
            ? 'rgba(13, 10, 8, 0.85)'
            : 'linear-gradient(180deg, rgba(13, 10, 8, 0.6) 0%, rgba(13, 10, 8, 0) 100%)',
          backdropFilter: cabinetOpen ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: cabinetOpen ? 'blur(16px)' : 'none',
          transition: 'background 0.35s ease, backdrop-filter 0.35s ease',
        }}
      >
        {/* Brand Cluster */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '11px',
          }}
        >
          <a
            href="#journey"
            onClick={handleBrandClick}
            style={{
              fontFamily: 'Newsreader, Georgia, serif',
              fontSize: '21px',
              fontWeight: 300,
              letterSpacing: '0.34em',
              color: '#f4eee2',
              textShadow: '0 1px 14px rgba(0,0,0,.5)',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            {brand.name}
          </a>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '8px',
              fontWeight: 400,
              letterSpacing: '0.20em',
              color: 'rgba(244,238,226,.42)',
              textTransform: 'uppercase',
            }}
          >
            est. {brand.establishedYear}
          </span>
        </div>

        {/* Navigation Cluster */}
        {isMobile ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              data-cabinet-trigger="true"
              aria-expanded={cabinetOpen}
              aria-haspopup="dialog"
              aria-controls="fruit-intelligence-cabinet"
              onClick={() => setCabinetOpen((prev) => !prev)}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '9.5px',
                fontWeight: 400,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                padding: '6px 12px',
                border: cabinetOpen
                  ? '1px solid #e8b45c'
                  : '1px solid rgba(244,238,226,.32)',
                borderRadius: '2px',
                color: cabinetOpen ? '#e8b45c' : 'rgba(244,238,226,.85)',
                background: cabinetOpen ? 'rgba(232,180,92,0.1)' : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>FRUIT INTELLIGENCE</span>
              <span style={{ fontSize: '7px' }}>{cabinetOpen ? '▲' : '▼'}</span>
            </button>

            <a
              href="#order"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '9.5px',
                fontWeight: 400,
                letterSpacing: '0.17em',
                textTransform: 'uppercase',
                padding: '6px 12px',
                border: '1px solid rgba(244,238,226,.32)',
                borderRadius: '2px',
                color: 'rgba(244,238,226,.78)',
                textDecoration: 'none',
              }}
            >
              Order
            </a>
          </div>
        ) : (
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tier === 'tablet' ? '20px' : '28px',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '10px',
              fontWeight: 400,
              letterSpacing: '0.17em',
              textTransform: 'uppercase',
              color: 'rgba(244,238,226,.78)',
            }}
          >
            {brand.navLinks.map((link, index) => {
              if (link.label === 'Fruit Intelligence') {
                return (
                  <button
                    key={index}
                    data-cabinet-trigger="true"
                    aria-expanded={cabinetOpen}
                    aria-haspopup="dialog"
                    aria-controls="fruit-intelligence-cabinet"
                    onClick={() => setCabinetOpen((prev) => !prev)}
                    style={{
                      background: cabinetOpen ? 'rgba(232,180,92,0.12)' : 'transparent',
                      border: cabinetOpen
                        ? '1px solid #e8b45c'
                        : '1px solid rgba(244,238,226,.25)',
                      borderRadius: '2px',
                      padding: '7px 14px',
                      color: cabinetOpen ? '#e8b45c' : 'rgba(244,238,226,.9)',
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '10px',
                      letterSpacing: '0.17em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.25s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!cabinetOpen) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,180,92,0.6)';
                    }}
                    onMouseLeave={(e) => {
                      if (!cabinetOpen) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(244,238,226,.25)';
                    }}
                  >
                    <span>FRUIT INTELLIGENCE</span>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '7px',
                        transform: cabinetOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.3s ease',
                      }}
                    >
                      ▼
                    </span>
                  </button>
                );
              }

              if (link.primary) {
                return (
                  <a
                    key={index}
                    href={link.href}
                    style={{
                      padding: '8px 15px',
                      border: '1px solid rgba(244,238,226,.32)',
                      borderRadius: '2px',
                      color: 'rgba(244,238,226,.9)',
                      textDecoration: 'none',
                    }}
                  >
                    {link.label}
                  </a>
                );
              }

              return (
                <a
                  key={index}
                  href={link.href}
                  style={{
                    color: 'rgba(244,238,226,.78)',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#e8b45c')}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'rgba(244,238,226,.78)')}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>
        )}
      </header>

      {/* 3D Specimen Exhibition Cabinet Dropdown */}
      <FruitCabinet
        isOpen={cabinetOpen}
        onClose={() => setCabinetOpen(false)}
        onSelectFruit={handleFruitSelect}
      />
    </>
  );
};
