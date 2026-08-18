import React, { useState } from 'react';
import { useBrand } from '../../context/BrandContext';

export const CtaPair: React.FC = () => {
  const brand = useBrand();
  const [primaryHover, setPrimaryHover] = useState(false);
  const [secondaryHover, setSecondaryHover] = useState(false);

  const buttonStyle: React.CSSProperties = {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '10px',
    fontWeight: 400,
    letterSpacing: '0.20em',
    textTransform: 'uppercase',
    padding: '15px 30px',
    borderRadius: '2px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        marginTop: '44px',
        flexWrap: 'wrap',
      }}
    >
      {/* Primary CTA */}
      <a
        href="#"
        onMouseEnter={() => setPrimaryHover(true)}
        onMouseLeave={() => setPrimaryHover(false)}
        style={{
          ...buttonStyle,
          backgroundColor: primaryHover ? '#e8cfa0' : '#f2ece0',
          color: '#1d2419',
          border: '1px solid transparent',
        }}
      >
        {brand.primaryCtaLabel}
      </a>

      {/* Secondary CTA */}
      <a
        href="#"
        onMouseEnter={() => setSecondaryHover(true)}
        onMouseLeave={() => setSecondaryHover(false)}
        style={{
          ...buttonStyle,
          backgroundColor: 'transparent',
          color: secondaryHover ? '#e8cfa0' : '#f2ece0',
          border: secondaryHover
            ? '1px solid #e8cfa0'
            : '1px solid rgba(242,236,224,.42)',
        }}
      >
        {brand.secondaryCtaLabel}
      </a>
    </div>
  );
};
