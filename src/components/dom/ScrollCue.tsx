import React, { useEffect, useRef, useState } from 'react';
import { CueConfig } from '../../config/cueConfig';
import { useBrand } from '../../context/BrandContext';
import { useScroll } from '../../context/ScrollContext';
import { useCueAccessibility } from '../../hooks/useCueAccessibility';
import { useViewportTier } from '../../hooks/useViewportTier';
import { CtaPair } from './CtaPair';

export interface ScrollCueProps {
  config: CueConfig;
}

export const ScrollCue: React.FC<ScrollCueProps> = ({ config }) => {
  const { subscribeFrame } = useScroll();
  const brand = useBrand();
  const { tier } = useViewportTier();
  const cueRef = useRef<HTMLDivElement | null>(null);
  const [currentOpacity, setCurrentOpacity] = useState<number>(config.in === 0 ? 1 : 0);

  // Apply focus accessibility (inert / aria-hidden) when opacity <= 0.6
  useCueAccessibility(cueRef, currentOpacity);

  useEffect(() => {
    return subscribeFrame((curProgress) => {
      // Calculate opacity per prototype formula:
      // f1 = (in <= 0.006) ? 1 : clamp((cur - in)/0.028, 0, 1)
      // f2 = (out >= 1)     ? 1 : clamp((out - cur)/0.028, 0, 1)
      // o  = min(f1, f2)
      const f1 = config.in <= 0.006 ? 1 : Math.max(0, Math.min(1, (curProgress - config.in) / 0.028));
      const f2 = config.out >= 1 ? 1 : Math.max(0, Math.min(1, (config.out - curProgress) / 0.028));
      const opacity = Math.min(f1, f2);

      if (cueRef.current) {
        cueRef.current.style.opacity = opacity.toString();
        cueRef.current.style.transform = `translateY(${(1 - opacity) * 14}px)`;
      }

      setCurrentOpacity(opacity);
    });
  }, [subscribeFrame, config]);

  // Terminal Hero Special Case (Cue 9 / Scene 9)
  if (config.isTerminalHero) {
    const isMobile = tier === 'mobile';
    const isTablet = tier === 'tablet';
    const heroTitleSize = isMobile ? '32px' : isTablet ? '44px' : '60px';

    return (
      <div
        ref={cueRef}
        className="scroll-cue-hero"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: isMobile ? '0 24px' : '0 40px',
          opacity: config.in === 0 ? 1 : 0,
          willChange: 'opacity, transform',
          pointerEvents: 'none',
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
            maxWidth: '900px',
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
      </div>
    );
  }

  // Scroll Prompt Special Case
  if (config.id === 'scroll-prompt') {
    return (
      <div
        ref={cueRef}
        style={{
          position: 'fixed',
          bottom: config.bottom || '52px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          opacity: 1,
          willChange: 'opacity, transform',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '9px',
            fontWeight: 400,
            letterSpacing: '0.30em',
            textTransform: 'uppercase',
            color: 'rgba(242,236,224,.62)',
          }}
        >
          Scroll to follow the fruit
        </span>
        <span
          style={{
            width: '1px',
            height: '34px',
            background: 'linear-gradient(180deg, rgba(242,236,224,.62) 0%, rgba(242,236,224,0) 100%)',
          }}
        />
      </div>
    );
  }

  // Standard Typographic Cue Blocks
  const isMobile = tier === 'mobile';
  const isTablet = tier === 'tablet';

  // Compute responsive anchor positioning
  const leftPos = isMobile ? '24px' : isTablet && config.left === '196px' ? '132px' : config.left;
  const rightPos = isMobile ? '24px' : isTablet && (config.right === '120px' || config.right === '130px') ? '88px' : config.right;
  const textAlign = isMobile ? 'center' : config.textAlign || 'left';
  const widthMeasure = isMobile ? 'calc(100vw - 48px)' : config.measure || '300px';

  const positionStyles: React.CSSProperties = {
    position: 'fixed',
    zIndex: 4,
    width: widthMeasure,
    maxWidth: '100vw',
    textAlign,
    willChange: 'opacity, transform',
    opacity: 0,
    pointerEvents: 'none',
  };

  if (isMobile) {
    positionStyles.left = '24px';
    positionStyles.right = '24px';
    if (config.top) positionStyles.top = '48%';
    else if (config.bottom) positionStyles.bottom = '96px';
    else positionStyles.top = '50%';
  } else {
    if (leftPos) positionStyles.left = leftPos;
    if (rightPos) positionStyles.right = rightPos;
    if (config.top) {
      positionStyles.top = config.top;
      if (config.top === '50%') positionStyles.transform = 'translateY(-50%)';
    }
    if (config.bottom) positionStyles.bottom = config.bottom;
  }

  // Headline styling mapping
  const headlineSize = isMobile ? '21px' : isTablet ? '24px' : `${config.headlineSizePx || 27}px`;

  return (
    <div ref={cueRef} style={positionStyles}>
      {/* Eyebrow Label */}
      {config.eyebrow && (
        <span
          style={{
            display: 'block',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '9px',
            fontWeight: 400,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: '#e8cfa0',
            marginBottom: '14px',
          }}
        >
          {config.eyebrow}
        </span>
      )}

      {/* Headline Text */}
      {config.headline && (
        <h2
          className="text-pretty"
          style={{
            fontFamily: 'Newsreader, Georgia, serif',
            fontSize: headlineSize,
            fontWeight: 300,
            fontStyle: config.headlineStyle === 'italicLead' ? 'italic' : 'normal',
            lineHeight: config.headlineStyle === 'italicLead' ? 1.45 : 1.32,
            color: config.headlineStyle === 'italicLead' ? 'rgba(244,239,228,.92)' : '#f4efe4',
            marginBottom: config.support || config.stats ? (config.stats ? '20px' : '12px') : 0,
          }}
        >
          {config.headline}
        </h2>
      )}

      {/* Supporting Copy */}
      {config.support && (
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '10px',
            fontWeight: 400,
            lineHeight: 1.9,
            letterSpacing: '0.08em',
            color: 'rgba(242,236,224,.55)',
          }}
        >
          {config.support}
        </p>
      )}

      {/* Stats Row */}
      {config.stats && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: textAlign === 'right' ? 'flex-end' : textAlign === 'center' ? 'center' : 'flex-start',
            gap: '20px',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '9px',
            fontWeight: 400,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'rgba(242,236,224,.55)',
          }}
        >
          {config.stats.map((stat, idx) => (
            <span key={idx}>
              {stat.label} · {stat.value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
