import React, { useEffect, useRef, useState } from 'react';
import { cameraKeyframes } from '../../config/cameraKeyframes';
import { useScroll } from '../../context/ScrollContext';
import { useViewportTier } from '../../hooks/useViewportTier';

export const ChapterRail: React.FC = () => {
  const { showChapters, subscribeFrame } = useScroll();
  const { tier } = useViewportTier();
  const fillRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  useEffect(() => {
    return subscribeFrame((curProgress) => {
      // Update progress fill bar transform directly via ref
      if (fillRef.current) {
        fillRef.current.style.transform = `scaleY(${Math.max(0, Math.min(1, curProgress))})`;
      }

      // Compute current active chapter index: round(cur * 8)
      const chIdx = Math.max(0, Math.min(8, Math.round(curProgress * 8)));
      setActiveIndex(chIdx);
    });
  }, [subscribeFrame]);

  if (!showChapters || tier === 'mobile') {
    return null;
  }

  const leftOffset = tier === 'tablet' ? '20px' : '34px';

  return (
    <aside
      aria-label="Chapter progression"
      style={{
        position: 'fixed',
        left: leftOffset,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 5,
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {/* 1px x 200px Track & Fill */}
      <div
        style={{
          position: 'relative',
          width: '1px',
          height: '200px',
          backgroundColor: 'rgba(244,238,226,.16)',
        }}
      >
        <div
          ref={fillRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(232,207,160,.85)',
            transformOrigin: 'top',
            transform: 'scaleY(0)',
            willChange: 'transform',
          }}
        />
      </div>

      {/* Scrim Container & 9 Chapter Labels */}
      <div
        className="backdrop-blur-scrim"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          padding: '12px 14px',
          backgroundColor: 'rgba(14,13,9,.42)',
          borderRadius: '3px',
        }}
      >
        {cameraKeyframes.map((kf, index) => {
          const isActive = index === activeIndex;
          return (
            <span
              key={kf.id}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '8px',
                fontWeight: 400,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: '#f2ece0',
                opacity: isActive ? 1 : 0.28,
                textShadow: isActive ? '0 1px 6px rgba(0,0,0,.6)' : 'none',
                transition: 'opacity 0.15s ease',
              }}
            >
              {kf.chapterName}
            </span>
          );
        })}
      </div>
    </aside>
  );
};
