import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createSpecimenScene, SpecimenEngine, SPECIMENS, SpecimenItem } from './FruitCabinetScene';

interface FruitCabinetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFruit: (fruitId: string) => void;
}

interface SpecimenCardCanvasProps {
  fruitId: 'chaunsa' | 'kinnow' | 'apple';
  isActive: boolean;
  pointer: { x: number; y: number };
}

const SpecimenCardCanvas: React.FC<SpecimenCardCanvasProps> = ({
  fruitId,
  isActive,
  pointer,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<SpecimenEngine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const engine = createSpecimenScene(canvas, fruitId, { prefersReducedMotion });
    engineRef.current = engine;

    const onResize = () => {
      engine.resize();
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      engine.dispose();
      engineRef.current = null;
    };
  }, [fruitId]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setActive(isActive);
    }
  }, [isActive]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setPointer(pointer.x, pointer.y);
    }
  }, [pointer]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none',
      }}
    />
  );
};

export const FruitCabinet: React.FC<FruitCabinetProps> = ({
  isOpen,
  onClose,
  onSelectFruit,
}) => {
  const cabinetRef = useRef<HTMLDivElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
  const [pointers, setPointers] = useState<Record<number, { x: number; y: number }>>({
    0: { x: 0, y: 0 },
    1: { x: 0, y: 0 },
    2: { x: 0, y: 0 },
  });

  useEffect(() => {
    if (isOpen) {
      setHoveredIdx(null);
      setFocusedIdx(null);
    }
  }, [isOpen]);

  const handlePointerMoveCard = useCallback((idx: number, e: React.PointerEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    setPointers((prev) => ({ ...prev, [idx]: { x, y } }));
  }, []);

  const handleSelect = useCallback(
    (fruitId: string) => {
      onSelectFruit(fruitId);
      onClose();
    },
    [onSelectFruit, onClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setFocusedIdx((prev) => (prev === null || prev === 2 ? 0 : prev + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFocusedIdx((prev) => (prev === null || prev === 0 ? 2 : prev - 1));
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (focusedIdx !== null) {
          e.preventDefault();
          handleSelect(SPECIMENS[focusedIdx].id);
        }
      }
    },
    [focusedIdx, handleSelect, onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        cabinetRef.current &&
        !cabinetRef.current.contains(target) &&
        !target.closest('[data-cabinet-trigger="true"]')
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="fruit-intelligence-cabinet"
      ref={cabinetRef}
      role="dialog"
      aria-modal="true"
      aria-label="Fruit Intelligence 3D Specimen Cabinet"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{
        position: 'fixed',
        top: '72px',
        left: 0,
        right: 0,
        zIndex: 99,
        maxHeight: 'calc(100vh - 80px)',
        overflowY: 'auto',
        background:
          'radial-gradient(100% 120% at 50% 0%, rgba(26, 20, 15, 0.96) 0%, rgba(13, 10, 8, 0.95) 100%)',
        backdropFilter: 'blur(32px) saturate(140%)',
        WebkitBackdropFilter: 'blur(32px) saturate(140%)',
        borderTop: '1px solid rgba(242, 232, 216, 0.08)',
        borderBottom: '1px solid rgba(242, 232, 216, 0.14)',
        boxShadow:
          '0 40px 100px -20px rgba(0, 0, 0, 0.95), 0 0 1px 1px rgba(242, 232, 216, 0.05)',
        color: '#f2e8d8',
        fontFamily: "'Work Sans', system-ui, sans-serif",
        padding: 'clamp(18px, 2.5vh, 28px) clamp(16px, 4vw, 56px) clamp(22px, 3vh, 36px)',
      }}
    >
      {/* Cabinet Top Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '14px',
          borderBottom: '1px solid rgba(242, 232, 216, 0.08)',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '9.5px',
              letterSpacing: '0.3em',
              color: '#e8b45c',
              textTransform: 'uppercase',
            }}
          >
            FRUIT INTELLIGENCE · EXHIBIT CABINET
          </span>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '9px',
              letterSpacing: '0.15em',
              color: 'rgba(242, 232, 216, 0.4)',
              textTransform: 'uppercase',
            }}
          >
            3 VERIFIED SPECIMENS
          </span>
        </div>

        <button
          onClick={onClose}
          aria-label="Close cabinet"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(242, 232, 216, 0.6)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '9.5px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            padding: '4px 8px',
          }}
          onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#e8b45c')}
          onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'rgba(242, 232, 216, 0.6)')}
        >
          <span>CLOSE</span>
          <kbd
            style={{
              background: 'rgba(242, 232, 216, 0.1)',
              padding: '2px 5px',
              borderRadius: '2px',
              fontSize: '8px',
            }}
          >
            ESC
          </kbd>
        </button>
      </div>

      {/* 3-Bay Specimen Cards Grid Container */}
      <div
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 'clamp(16px, 2.5vw, 32px)',
        }}
      >
        {SPECIMENS.map((specimen: SpecimenItem, idx: number) => {
          const isHovered = hoveredIdx === idx;
          const isFocused = focusedIdx === idx;
          const isActive = isHovered || isFocused;
          const cardPointer = pointers[idx] || { x: 0, y: 0 };

          return (
            <button
              key={specimen.id}
              role="link"
              tabIndex={0}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => {
                setHoveredIdx(null);
                setPointers((prev) => ({ ...prev, [idx]: { x: 0, y: 0 } }));
              }}
              onPointerMove={(e) => handlePointerMoveCard(idx, e)}
              onFocus={() => setFocusedIdx(idx)}
              onBlur={() => setFocusedIdx(null)}
              onClick={() => handleSelect(specimen.id)}
              aria-label={`Enter ${specimen.name} Fruit Intelligence inspection`}
              style={{
                background: isActive
                  ? 'radial-gradient(120% 100% at 50% 20%, rgba(232, 180, 92, 0.08) 0%, rgba(0,0,0,0) 80%)'
                  : 'rgba(18, 14, 11, 0.4)',
                border: '1px solid',
                borderColor: isActive
                  ? 'rgba(232, 180, 92, 0.45)'
                  : 'rgba(242, 232, 216, 0.08)',
                borderRadius: '3px',
                padding: 'clamp(14px, 2vh, 20px) clamp(14px, 1.8vw, 22px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                textAlign: 'left',
                color: '#f2e8d8',
                transition: 'background 0.3s ease, border-color 0.3s ease, transform 0.3s ease',
                transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                outline: isFocused ? '2px solid #e8b45c' : 'none',
                outlineOffset: '2px',
                position: 'relative',
              }}
            >
              {/* Top Card Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '9px',
                    letterSpacing: '0.24em',
                    color: isActive ? '#e8b45c' : 'rgba(242, 232, 216, 0.5)',
                    textTransform: 'uppercase',
                    transition: 'color 0.3s ease',
                  }}
                >
                  0{idx + 1} · {specimen.id.toUpperCase()}
                </span>
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: isActive ? '#e8b45c' : 'rgba(242, 232, 216, 0.2)',
                    boxShadow: isActive ? '0 0 10px rgba(232, 180, 92, 0.8)' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                />
              </div>

              {/* Dedicated 3D Specimen Viewport Area (ABOVE text, cleanly contained) */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: 'clamp(140px, 18vh, 175px)',
                  margin: '6px 0 10px 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <SpecimenCardCanvas
                  fruitId={specimen.id}
                  isActive={isActive}
                  pointer={cardPointer}
                />
              </div>

              {/* Bottom Metadata Cluster (SEPARATED below the specimen) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', width: '100%' }}>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 'clamp(20px, 2vw, 25px)',
                    fontWeight: 400,
                    lineHeight: 1.1,
                    color: isActive ? '#fff' : '#f2e8d8',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {specimen.name}
                </div>

                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '9.5px',
                    letterSpacing: '0.22em',
                    color: '#e8b45c',
                    textTransform: 'uppercase',
                  }}
                >
                  {specimen.signature}
                </div>

                <div
                  style={{
                    fontSize: '12px',
                    lineHeight: 1.45,
                    color: isActive ? 'rgba(242, 232, 216, 0.85)' : 'rgba(242, 232, 216, 0.55)',
                    transition: 'color 0.3s ease',
                  }}
                >
                  {specimen.secondary}
                </div>

                <div
                  style={{
                    marginTop: '6px',
                    paddingTop: '7px',
                    borderTop: '1px solid rgba(242, 232, 216, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: "'Work Sans', system-ui, sans-serif",
                    fontSize: '10px',
                    fontWeight: 500,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: isActive ? '#f6d79a' : 'rgba(242, 232, 216, 0.4)',
                    transition: 'color 0.3s ease',
                  }}
                >
                  <span>ENTER INSPECTION</span>
                  <span
                    style={{
                      transform: isActive ? 'translateX(3px)' : 'none',
                      transition: 'transform 0.3s ease',
                    }}
                  >
                    →
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FruitCabinet;
