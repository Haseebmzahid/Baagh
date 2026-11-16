import React from 'react';
import { useBrand } from '../../context/BrandContext';
import { useViewportTier } from '../../hooks/useViewportTier';
import { CtaPair } from './CtaPair';
import { GradeOverlay } from './GradeOverlay';
import { SiteHeader } from './SiteHeader';

export interface FallbackViewProps {
  reason?: string | null;
  onNavigateRoute?: (path: string) => void;
}

export const FallbackView: React.FC<FallbackViewProps> = ({ reason, onNavigateRoute }) => {
  const brand = useBrand();
  const { tier } = useViewportTier();
  const isMobile = tier === 'mobile';
  const isTablet = tier === 'tablet';

  const heroTitleSize = isMobile ? '32px' : isTablet ? '44px' : '60px';

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#16150f',
        backgroundImage: 'radial-gradient(100% 80% at 50% 50%, #2a2318 0%, #16150f 100%)',
        color: '#f2ece0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: isMobile ? '80px 24px' : '100px 40px',
      }}
    >
      <SiteHeader onNavigateRoute={onNavigateRoute} />
      <GradeOverlay />

      <main
        style={{
          position: 'relative',
          zIndex: 4,
          maxWidth: '900px',
          margin: 'auto',
        }}
      >
        <h1
          className="text-pretty"
          style={{
            fontFamily: 'Newsreader, Georgia, serif',
            fontSize: heroTitleSize,
            fontWeight: 300,
            lineHeight: 1.1,
            letterSpacing: '-0.015em',
            color: '#f6f1e6',
            textShadow: '0 2px 40px rgba(10,9,7,.6)',
          }}
        >
          {brand.heroHeadline}
        </h1>

        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '10.5px',
            fontWeight: 400,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(242,236,224,.62)',
            marginTop: '22px',
          }}
        >
          {brand.heroSubline}
        </p>

        <CtaPair />

        {reason && (
          <p
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '8px',
              letterSpacing: '0.12em',
              color: 'rgba(244,238,226,.32)',
              marginTop: '48px',
              textTransform: 'uppercase',
            }}
          >
            A still version of BAAGH. Our collections are ready to explore.
          </p>
        )}
      </main>
    </div>
  );
};
