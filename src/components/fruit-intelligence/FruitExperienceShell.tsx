import React, { useMemo } from 'react';
import { FruitConfig } from './core/types';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { win } from './core/mathUtils';

const Heading = ({first, ...props}: React.HTMLAttributes<HTMLHeadingElement> & {first: boolean}) => first ? <h1 {...props} /> : <h2 {...props} />;

interface FruitExperienceShellProps {
  config: FruitConfig;
  progress: number;
  hasInteracted: boolean;
  interactive?: boolean;
}

export const FruitExperienceShell: React.FC<FruitExperienceShellProps> = React.memo(({
  config,
  progress,
  hasInteracted,
  interactive = true,
}) => {
  const reducedMotion = useReducedMotion();
  // Calculate windowing values for each of the 8 acts
  const actOpacities = useMemo(() => {
    return config.acts.map((act) => {
      const fade = act.fadeDuration || 0.03;
      // The final invitation must stay fully visible and keyboard-accessible
      // at the end of the native scroll range, rather than fading away there.
      const end = act.hasCta ? Math.max(act.maxProgress, 1 + fade + .01) : act.maxProgress;
      return win(progress, act.minProgress, end, fade);
    });
  }, [config.acts, progress]);

  const activeIndex = useMemo(() => {
    let maxVal = -1;
    let maxIdx = 0;
    actOpacities.forEach((val, idx) => {
      if (val > maxVal) {
        maxVal = val;
        maxIdx = idx;
      }
    });
    return maxIdx;
  }, [actOpacities]);

  const paceHeight = `${config.scrollPaceScreens * 100}vh`;

  return (
    <>
      {/* 1. Atmospheric Studio Background Gradients */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          background: 'radial-gradient(120% 90% at 62% 18%, #2b2118 0%, #17120e 46%, #0d0a08 100%)',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          opacity: 0.5,
          background: 'radial-gradient(60% 45% at 50% 42%, rgba(255,214,150,0.13), rgba(0,0,0,0) 70%)',
        }}
        aria-hidden="true"
      />

      {/* 2. Fixed Narrative Overlay (8 Acts) */}
      <div className="fi-narrative"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 5,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'flex-end',
          fontFamily: "'Work Sans', system-ui, sans-serif",
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            padding: '0 clamp(20px, 5vw, 84px) clamp(28px, 6vh, 76px)',
          }}
        >
          {config.acts.map((act, i) => {
            const opacity = Number(actOpacities[i].toFixed(3));
            const isClickable = !interactive || opacity > 0.6;
            const translateY = reducedMotion ? 0 : (1 - actOpacities[i]) * 16;
            const isCentered = act.isCentered;

            return (
              <section className="fi-act"
                key={act.index}
                aria-hidden={interactive && !isClickable}
                style={{
                  position: 'absolute',
                  left: isCentered ? '50%' : 'clamp(20px, 5vw, 84px)',
                  bottom: 'clamp(28px, 6vh, 76px)',
                  width: isCentered ? (act.hasCta ? 'min(620px, 90vw)' : 'min(560px, 88vw)') : (i === 0 ? 'min(500px, 84vw)' : 'min(420px, 84vw)'),
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isCentered ? (act.hasCta ? '22px' : '14px') : (i === 0 ? '18px' : '14px'),
                  alignItems: isCentered ? 'center' : 'flex-start',
                  textAlign: isCentered ? 'center' : 'left',
                  opacity,
                  pointerEvents: isClickable ? 'auto' : 'none',
                  transform: isCentered
                    ? `translateX(-50%) translateY(${translateY.toFixed(1)}px)`
                    : `translateY(${translateY.toFixed(1)}px)`,
                  visibility: opacity > .001 ? 'visible' : 'hidden',
                  transition: reducedMotion ? 'none' : 'opacity 0.1s linear, transform 0.1s linear',
                  willChange: 'transform, opacity',
                }}
              >
                {act.eyebrow ? (
                  <div
                    style={{
                      fontSize: '10.5px',
                      letterSpacing: '0.34em',
                      color: 'rgba(232,180,92,0.9)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {act.eyebrow}
                  </div>
                ) : null}

                <Heading first={i === 0}
                  style={{
                    margin: 0,
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 300,
                    fontStyle: act.isItalicHeadline ? 'italic' : 'normal',
                    fontSize: i === 0
                      ? 'clamp(34px, 5.4vw, 68px)'
                      : (act.hasCta ? 'clamp(30px, 4.4vw, 58px)' : (act.isItalicHeadline ? 'clamp(24px, 3.2vw, 40px)' : 'clamp(26px, 3.4vw, 42px)')),
                    lineHeight: i === 0 ? 1.02 : (act.hasCta ? 1.06 : (act.isItalicHeadline ? 1.18 : 1.12)),
                    letterSpacing: i === 0 ? '-0.015em' : 'normal',
                    color: '#f2e8d8',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {i === 0 ? config.headline : act.headline}
                </Heading>

                <div
                  style={{
                    fontSize: (i === 0 || act.hasCta) ? '14.5px' : '14px',
                    lineHeight: (i === 0 || act.hasCta) ? 1.7 : 1.7,
                    color: 'rgba(242,232,216,0.62)',
                    maxWidth: isCentered ? (act.hasCta ? '42ch' : '46ch') : (i === 0 ? '34ch' : '36ch'),
                  }}
                >
                  {act.body}
                </div>

                {/* Final Act Call to Action Buttons */}
                {act.hasCta && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '14px',
                      justifyContent: 'center',
                      pointerEvents: isClickable ? 'auto' : 'none',
                      paddingTop: '4px',
                    }}
                  >
                    <a
                      href={config.primaryCta.href}
                      className="fi-primary-cta"
                      tabIndex={!interactive || isClickable ? 0 : -1}
                      style={{
                        padding: '15px 30px',
                        borderRadius: '2px',
                        background: '#e8b45c',
                        color: '#1a1208',
                        fontSize: '12px',
                        letterSpacing: '0.16em',
                        fontWeight: 500,
                        textDecoration: 'none',
                        transition: 'background 0.3s ease, transform 0.3s ease',
                      }}
                    >
                      {config.primaryCta.label}
                    </a>
                    <a
                      href={config.secondaryCta.href}
                      className="fi-secondary-cta"
                      tabIndex={isClickable ? 0 : -1}
                      style={{
                        padding: '15px 30px',
                        borderRadius: '2px',
                        border: '1px solid rgba(242,232,216,0.28)',
                        color: 'rgba(242,232,216,0.86)',
                        fontSize: '12px',
                        letterSpacing: '0.16em',
                        textDecoration: 'none',
                        transition: 'border-color 0.3s ease, color 0.3s ease',
                      }}
                    >
                      {config.secondaryCta.label}
                    </a>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>

      {/* 3. Chapter Rail (8-Dot Progress Indicator) */}
      <nav className="fi-rail"
        aria-label="Story chapters"
        style={{
          position: 'fixed',
          zIndex: 6,
          right: 'clamp(14px, 2.2vw, 34px)',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        {config.acts.map((act, i) => {
          const isActive = i === activeIndex;
          return (
            <div
              key={act.index}
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: isActive ? '#e8b45c' : 'rgba(242,232,216,0.25)',
                transform: isActive ? 'scale(1.6)' : 'scale(1)',
                transition: 'background 0.4s ease, transform 0.4s ease',
              }}
            />
          );
        })}
      </nav>

      {/* 4. Interactive Bottom Hint */}
      {!hasInteracted && progress < 0.03 && (
        <div
          style={{
            position: 'fixed',
            zIndex: 6,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'max-content',
            maxWidth: '90vw',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            bottom: '18px',
            fontSize: '10px',
            letterSpacing: '0.3em',
            color: 'rgba(242,232,216,0.5)',
            animation: reducedMotion ? 'none' : 'hintFade 3.4s ease-in-out infinite',
            pointerEvents: 'none',
            fontFamily: "'Work Sans', system-ui, sans-serif",
          }}
        >
          <span className="fi-hint">SCROLL &nbsp;·&nbsp; DRAG TO TURN</span>
        </div>
      )}

      {/* 5. Native Scroll Spacer */}
      <div className="fi-spacer"
        style={{
          position: 'relative',
          zIndex: 1,
          height: paceHeight,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
    </>
  );
});
