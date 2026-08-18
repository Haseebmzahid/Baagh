import React from 'react';
import { FruitConfig } from './core/types';

interface FruitFallbackProps {
  config: FruitConfig;
  reason?: string | null;
}

export const FruitFallback: React.FC<FruitFallbackProps> = ({ config, reason }) => {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#100d0a',
        color: '#f2e8d8',
        fontFamily: "'Work Sans', system-ui, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8vw 6vw',
        textAlign: 'center',
        boxSizing: 'border-box',
      }}
    >
      {/* 2D Parametric Silhouette Graphic */}
      <div
        style={{
          width: 'min(46vw, 300px)',
          aspectRatio: config.fallback.aspectRatio,
          borderRadius: config.fallback.borderRadius,
          background: config.fallback.gradient,
          boxShadow: '0 60px 90px -50px rgba(0,0,0,.9), inset -18px -26px 60px rgba(90,50,10,.5)',
          marginBottom: '32px',
        }}
        aria-hidden="true"
      />

      <div
        style={{
          fontSize: '11px',
          letterSpacing: '0.34em',
          color: '#e8b45c',
          marginBottom: '16px',
        }}
      >
        {config.chapterLabel}
      </div>

      <h1
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 300,
          fontSize: 'clamp(32px, 5vw, 56px)',
          lineHeight: 1.08,
          marginBottom: '20px',
          maxWidth: '24ch',
          whiteSpace: 'pre-line',
        }}
      >
        {config.headline}
      </h1>

      <p
        style={{
          maxWidth: '38rem',
          fontSize: '15px',
          lineHeight: 1.7,
          color: 'rgba(242,232,216,.75)',
          marginBottom: '40px',
        }}
      >
        {config.fallback.summaryText}
      </p>

      {/* Accessible Full Inspection Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px',
          width: '100%',
          maxWidth: '960px',
          textAlign: 'left',
          marginBottom: '48px',
        }}
      >
        {config.anchors
          .filter((a) => a.description.length > 0)
          .map((anchor) => (
            <div
              key={anchor.id}
              style={{
                padding: '16px',
                borderLeft: '1px solid rgba(232,180,92,0.55)',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <div
                style={{
                  fontSize: '10.5px',
                  letterSpacing: '0.30em',
                  color: '#e8b45c',
                  marginBottom: '6px',
                }}
              >
                {anchor.label}
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '17px',
                  lineHeight: 1.4,
                  color: 'rgba(242,232,216,0.88)',
                }}
              >
                {anchor.description}
              </div>
            </div>
          ))}
      </div>

      {/* CTA Buttons */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          justifyContent: 'center',
        }}
      >
        <a
          href={config.primaryCta.href}
          style={{
            padding: '15px 30px',
            borderRadius: '2px',
            background: '#e8b45c',
            color: '#1a1208',
            fontSize: '12px',
            letterSpacing: '.16em',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          {config.primaryCta.label}
        </a>
        <a
          href={config.secondaryCta.href}
          style={{
            padding: '15px 30px',
            borderRadius: '2px',
            border: '1px solid rgba(242,232,216,.28)',
            color: 'rgba(242,232,216,.86)',
            fontSize: '12px',
            letterSpacing: '.16em',
            textDecoration: 'none',
          }}
        >
          {config.secondaryCta.label}
        </a>
      </div>

      {reason && (
        <div
          style={{
            marginTop: '32px',
            fontSize: '11px',
            color: 'rgba(242,232,216,0.4)',
            letterSpacing: '0.1em',
          }}
        >
          Mode: {reason}
        </div>
      )}
    </div>
  );
};
