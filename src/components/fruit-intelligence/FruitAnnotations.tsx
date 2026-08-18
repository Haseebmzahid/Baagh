import React, { useMemo } from 'react';
import { FruitConfig, ScreenPoint } from './core/types';
import { win } from './core/mathUtils';

interface FruitAnnotationsProps {
  config: FruitConfig;
  points: ScreenPoint[];
  progress: number;
  visible?: boolean;
}

export const FruitAnnotations: React.FC<FruitAnnotationsProps> = ({
  config,
  points,
  progress,
  visible = true,
}) => {
  const pointsById = useMemo(() => {
    const map: Record<string, ScreenPoint> = {};
    points.forEach((pt) => {
      map[pt.id] = pt;
    });
    return map;
  }, [points]);

  if (!visible) return null;

  const trioOn = useMemo(() => {
    const trioGroup = config.anchorGroups?.find((g) => g.id === 'trio');
    if (trioGroup) {
      return win(progress, trioGroup.minProgress, trioGroup.maxProgress, trioGroup.fadeDuration || 0.04);
    }
    const trioAct = config.acts.find(
      (a) => a.eyebrow.includes('SELECTION') || a.isItalicHeadline
    );
    if (trioAct) {
      return win(progress, trioAct.minProgress, trioAct.maxProgress, trioAct.fadeDuration || 0.045);
    }
    return win(progress, 0.685, 0.845, 0.045);
  }, [config.anchorGroups, config.acts, progress]);

  const W = typeof window !== 'undefined' ? window.innerWidth : 1440;
  const H = typeof window !== 'undefined' ? window.innerHeight : 900;
  const wide = W > 760;

  const c = pointsById.center;
  const t = pointsById.top;
  const e = pointsById.edge;
  const R = c && t ? Math.max(80, Math.abs(c.y - t.y)) : 180;
  const colW = 210;
  const leftEdge = e ? Math.min(e.x, (c ? c.x : W * 0.5) - R) : (c ? c.x : W * 0.5) - R;
  let colX = Math.min((c ? c.x : W * 0.5) - R * 1.15, leftEdge) - colW - 40;
  colX = Math.max(wide ? 24 : 12, Math.min(colX, W - colW - 20));

  // Compute sorted stack layout with collision prevention
  const computeGroupPlacements = (keys: string[], groupOpacity: number) => {
    const items = keys
      .map((k) => {
        const def = config.anchors.find((a) => a.id === k);
        const pt = pointsById[k];
        return { k, def, pt };
      })
      .filter((o): o is { k: string; def: typeof config.anchors[0]; pt: ScreenPoint } => !!o.pt && !!o.def);

    items.sort((a, b) => a.pt.y - b.pt.y);

    const minY = 28;
    const maxY = H * (wide ? 0.42 : 0.34);
    const gap = 80;
    let prev = -1e9;

    const ys = items.map((o) => {
      let y = Math.min(Math.max(o.pt.y - 18, minY), maxY);
      if (y < prev + gap) y = prev + gap;
      prev = y;
      return y;
    });

    const limit = H * (wide ? 0.60 : 0.50);
    if (ys.length > 0) {
      const over = ys[ys.length - 1] + 64 - limit;
      if (over > 0) {
        const shift = Math.min(over, Math.max(0, ys[0] - minY));
        for (let i = 0; i < ys.length; i++) {
          ys[i] -= shift;
        }
      }
    }

    return items.map((o, idx) => {
      const y = ys[idx];
      const opacity = groupOpacity * (o.pt.front ? 1 : 0.55);
      const lx = colX + colW - 6;
      const ly = y + 21;
      const dx = Math.max(0, o.pt.x - lx - 10);
      const dy = o.pt.y - ly;
      const len = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      return {
        key: o.k,
        label: o.def.label,
        description: o.def.description,
        x: colX,
        y,
        opacity,
        line: {
          x: lx,
          y: ly,
          length: len,
          angle,
          opacity: opacity * 0.9,
        },
      };
    });
  };

  const groups = useMemo(() => {
    if (config.anchorGroups && config.anchorGroups.length > 0) {
      return config.anchorGroups;
    }
    return [
      { id: 'inspect', keys: ['aroma', 'skin', 'firmness', 'ripeness'], minProgress: 0.085, maxProgress: 0.30, fadeDuration: 0.05 },
      { id: 'anatomy', keys: ['flesh', 'fibre', 'seed'], minProgress: 0.50, maxProgress: 0.70, fadeDuration: 0.05 },
    ];
  }, [config.anchorGroups]);

  const allCallouts = useMemo(() => {
    return groups.flatMap((group) => {
      const groupOpacity = win(progress, group.minProgress, group.maxProgress, group.fadeDuration || 0.035);
      if (groupOpacity <= 0.001) return [];
      return computeGroupPlacements(group.keys, groupOpacity);
    });
  }, [groups, progress, pointsById, colX, H, wide]);


  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 4,
        pointerEvents: 'none',
      }}
    >
      {/* Editorial Callout Cards & Connecting Lines */}
      {allCallouts.map((item) => (
        <React.Fragment key={item.key}>
          {/* Connector Line */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '1px',
              width: `${Math.round(item.line.length)}px`,
              opacity: Number(item.line.opacity.toFixed(3)),
              background: 'linear-gradient(90deg, rgba(232,180,92,0.5), rgba(232,180,92,0))',
              transformOrigin: '0 50%',
              transform: `translate3d(${Math.round(item.line.x)}px, ${Math.round(item.line.y)}px, 0) rotate(${item.line.angle.toFixed(4)}rad)`,
              pointerEvents: 'none',
              transition: 'opacity 0.15s ease-out',
            }}
          />

          {/* Callout Card */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: `${colW}px`,
              opacity: Number(item.opacity.toFixed(3)),
              transform: `translate3d(${Math.round(item.x)}px, ${Math.round(item.y)}px, 0)`,
              pointerEvents: item.opacity > 0.1 ? 'auto' : 'none',
              willChange: 'transform, opacity',
            }}
          >
            <div
              className="annotation-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '7px',
                paddingLeft: '14px',
                borderLeft: '1px solid rgba(232,180,92,0.55)',
                transition: 'border-color 0.35s ease, padding-left 0.35s ease',
              }}
            >
              <div
                style={{
                  fontSize: '10.5px',
                  letterSpacing: '0.30em',
                  color: '#e8b45c',
                  fontFamily: "'Work Sans', system-ui, sans-serif",
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '17px',
                  lineHeight: 1.35,
                  color: 'rgba(242,232,216,0.85)',
                }}
              >
                {item.description}
              </div>
            </div>
          </div>
        </React.Fragment>
      ))}

      {/* Selection Trio Quality Badges (GOOD, BETTER, BEST) */}
      {(['good', 'better', 'best'] as const).map((tierKey) => {
        const pt = pointsById[tierKey];
        if (!pt) return null;
        const opacity = Number((trioOn * (tierKey === 'best' ? 1 : 0.72)).toFixed(3));

        return (
          <div
            key={tierKey}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              opacity,
              transform: `translate(-50%, 0) translate3d(${Math.round(pt.x)}px, ${Math.round(pt.y)}px, 0)`,
              textAlign: 'center',
              pointerEvents: opacity > 0.1 ? 'auto' : 'none',
              willChange: 'transform, opacity',
              fontFamily: "'Work Sans', system-ui, sans-serif",
            }}
          >
            {tierKey === 'best' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                <div style={{ fontSize: '10.5px', letterSpacing: '0.32em', color: '#e8b45c' }}>
                  BEST
                </div>
                <div style={{ width: '26px', height: '1px', background: 'rgba(232,180,92,0.6)' }} />
              </div>
            ) : (
              <div
                style={{
                  fontSize: '10.5px',
                  letterSpacing: '0.32em',
                  color: tierKey === 'better' ? 'rgba(242,232,216,0.62)' : 'rgba(242,232,216,0.5)',
                }}
              >
                {tierKey.toUpperCase()}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
