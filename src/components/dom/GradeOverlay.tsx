import React from 'react';
import { tokens } from '../../config/tokens';

export const GradeOverlay: React.FC = () => {
  // Base64 SVG grain pattern data URI (from prototype / DESIGN.md §6)
  const grainSvgDataUri =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxODAiIGhlaWdodD0iMTgwIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC45IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI24pIi8+PC9zdmc+';

  return (
    <>
      {/* Layer 1: Vignette */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background: 'radial-gradient(118% 82% at 50% 44%, rgba(0,0,0,0) 34%, rgba(12,11,8,0.62) 100%)',
        }}
      />

      {/* Layer 2: Split Tone */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, rgba(255,214,150,.16) 0%, rgba(255,214,150,0) 42%, rgba(24,32,40,.20) 100%)',
          mixBlendMode: 'soft-light',
        }}
      />

      {/* Layer 3: Film Grain */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 3,
          pointerEvents: 'none',
          backgroundImage: `url("${grainSvgDataUri}")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '180px 180px',
          opacity: tokens.defaults.grainOpacity,
          mixBlendMode: 'overlay',
        }}
      />
    </>
  );
};
