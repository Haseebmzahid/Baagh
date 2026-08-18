export const tokens = {
  color: {
    ink: '#16150f',
    paper: '#f2ece0',
    paperBright: '#f6f1e6',
    paperWarm: '#f4efe4',
    paperNav: '#f4eee2',
    accent: '#e8cfa0',
    buttonInk: '#1d2419',
    railTrack: 'rgba(244,238,226,.16)',
    railFill: 'rgba(232,207,160,.85)',
    railScrim: 'rgba(14,13,9,.42)',
    navText: 'rgba(244,238,226,.78)',
    navMeta: 'rgba(244,238,226,.42)',
    hairline: 'rgba(244,238,226,.32)',
    hairlineStrong: 'rgba(242,236,224,.42)',
    bodyMuted: 'rgba(242,236,224,.55)',
    bodyMuted58: 'rgba(242,236,224,.58)',
    bodyMuted60: 'rgba(242,236,224,.60)',
    bodyMuted62: 'rgba(242,236,224,.62)',
    italicLead: 'rgba(244,239,228,.92)',
  },
  world: {
    fog: '#7d6e55',
    skyZenith: '#5d6f74',
    skyHorizon: '#f0dcbb',
    keyLight: '#ffd7a2',
    hemiSky: '#9fb3bd',
    hemiGround: '#3a2f22',
  },
  fontFamily: {
    serif: 'Newsreader, Georgia, serif',
    mono: "'IBM Plex Mono', monospace",
  },
  breakpoints: {
    mobileMax: 767,
    tabletMin: 768,
    tabletMax: 1279,
    desktopMin: 1280,
  },
  motion: {
    scrollDampRate: 3.4,
    cameraPosSmoothRate: 6.0,
    cameraFovSmoothRate: 5.0,
    cueFadeWindow: 0.028,
    cueRisePx: 14,
    bobFrequency: 0.00042,
    bobAmplitude: 0.0035,
    rollFrequency: 0.00031,
    rollAmplitude: 0.0022,
  },
  radii: {
    button: '2px',
    scrim: '3px',
  },
  defaults: {
    journeyLength: 940, // 940vh
    showChapters: true,
    grainOpacity: 0.13,
  }
} as const;

export type DesignTokens = typeof tokens;
