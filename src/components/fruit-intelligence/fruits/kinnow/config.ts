import { FruitConfig } from '../../core/types';

export const kinnowConfig: FruitConfig = {
  id: 'kinnow',
  name: 'Kinnow Mandarin',
  variety: 'Punjab Seeded Kinnow',
  chapterLabel: 'CHAPTER THREE — FRUIT INTELLIGENCE',
  headline: 'Judge a Kinnow\nbefore you peel it.',
  subhead: 'One fruit, examined properly. Drag to turn it in the light; scroll to follow the inspection.',
  scrollPaceScreens: 8.2, // 820vh
  defaultExposure: 1.20,

  acts: [
    {
      index: 0,
      eyebrow: 'CHAPTER THREE — FRUIT INTELLIGENCE',
      headline: 'Judge a Kinnow\nbefore you peel it.',
      body: 'One fruit, examined properly. Drag to turn it in the light; scroll to follow the inspection.',
      minProgress: -0.02,
      maxProgress: 0.085,
      fadeDuration: 0.03,
    },
    {
      index: 1,
      eyebrow: '01 — THE INSPECTION',
      headline: 'Four judgements, before the peel.',
      body: 'Weight in the hand first. Then colour, then the button, then how the skin answers a thumb.',
      minProgress: 0.10,
      maxProgress: 0.275,
      fadeDuration: 0.03,
    },
    {
      index: 2,
      eyebrow: '02 — THE PEEL',
      headline: 'How it releases tells us plenty.',
      body: 'A good Kinnow lets its rind away cleanly, in one piece, leaving the flesh dry and the fingers oiled.',
      minProgress: 0.295,
      maxProgress: 0.46,
      fadeDuration: 0.03,
    },
    {
      index: 3,
      eyebrow: '03 — WHAT IS INSIDE',
      headline: 'Ten segments, held together.',
      body: 'They should part willingly and hold their shape. Segments that collapse have been picked too late.',
      minProgress: 0.475,
      maxProgress: 0.552,
      fadeDuration: 0.03,
    },
    {
      index: 4,
      eyebrow: '04 — THE CROSS SECTION',
      headline: 'Cut across, it cannot hide anything.',
      body: 'Ten wedges packed to the rind, a small tight core, juice standing at the face. This is the test that settles a crate.',
      minProgress: 0.568,
      maxProgress: 0.668,
      fadeDuration: 0.03,
    },
    {
      index: 5,
      eyebrow: '05 — THE SELECTION TEST',
      headline: 'Colour is the easiest thing to admire. Weight is the harder truth.',
      body: 'Three sound fruits. One is heavy for its size, tight at the button and even in colour — that is the one we send.',
      isItalicHeadline: true,
      isCentered: true,
      minProgress: 0.68,
      maxProgress: 0.845,
      fadeDuration: 0.03,
    },
    {
      index: 6,
      eyebrow: '06 — WHOLE AGAIN',
      headline: 'Read once, then repeated crate after crate.',
      body: 'The same four judgements, made by hand, before anything is packed.',
      minProgress: 0.86,
      maxProgress: 0.925,
      fadeDuration: 0.025,
    },
    {
      index: 7,
      eyebrow: '',
      headline: 'The Kinnow we choose for you.',
      body: 'Selected with the judgement of experienced fruit buyers.',
      isCentered: true,
      hasCta: true,
      minProgress: 0.935,
      maxProgress: 1.05,
      fadeDuration: 0.025,
    },
  ],

  anchors: [
    {
      id: 'center',
      label: 'CENTER',
      description: '',
      position: [0, 0, 0],
      actGroup: 'inspect',
    },
    {
      id: 'top',
      label: 'TOP',
      description: '',
      position: [0, 0.83, 0],
      actGroup: 'inspect',
    },
    {
      id: 'edge',
      label: 'EDGE',
      description: '',
      position: [-1, 0, 0],
      actGroup: 'inspect',
    },
    {
      id: 'colour',
      label: 'COLOUR',
      description: 'Deep and even, with fine pebbling.',
      position: [0.6, 0.4, 0.5],
      actGroup: 'inspect',
    },
    {
      id: 'button',
      label: 'BUTTON',
      description: 'The stem end stays tight and fresh, never dry.',
      position: [0.05, 0.79, 0.05],
      actGroup: 'inspect',
    },
    {
      id: 'weight',
      label: 'WEIGHT',
      description: 'Heavy for its size. Juice has weight.',
      position: [-0.64, -0.28, 0.42],
      actGroup: 'inspect',
    },
    {
      id: 'give',
      label: 'GIVE',
      description: 'Springy under the thumb. Never slack.',
      position: [0.48, -0.5, 0.48],
      actGroup: 'inspect',
    },
    {
      id: 'rind',
      label: 'RIND',
      description: 'Thin, tight, and clean off the flesh.',
      position: [0, -0.28, 0.42],
      actGroup: 'anatomy',
      hostMesh: 'peelTip',
    },
    {
      id: 'membrane',
      label: 'MEMBRANE',
      description: 'Fine enough to eat without noticing.',
      position: [0.42, 0.34, 0.34],
      actGroup: 'anatomy',
      hostMesh: 'nearSeg',
    },
    {
      id: 'seeds',
      label: 'SEEDS',
      description: 'Kinnow carries seeds. We count them.',
      position: [0.2, 0.12, 0],
      actGroup: 'anatomy',
      hostMesh: 'liftedSeg',
      alwaysFront: true,
    },
    {
      id: 'juice',
      label: 'JUICE',
      description: 'Vesicles standing full at the cut face.',
      position: [0.30, 0.02, 0.30],
      actGroup: 'anatomy',
      hostMesh: 'nearSeg',
    },
    {
      id: 'core',
      label: 'CORE',
      description: 'Tight and small — the segments carry the fruit.',
      position: [0.02, 0.04, 0.02],
      actGroup: 'anatomy',
      hostMesh: 'crossGroup',
      alwaysFront: true,
    },
  ],

  anchorGroups: [
    {
      id: 'inspect',
      keys: ['colour', 'button', 'weight', 'give'],
      minProgress: 0.085,
      maxProgress: 0.30,
      fadeDuration: 0.05,
    },
    {
      id: 'peel',
      keys: ['rind'],
      minProgress: 0.335,
      maxProgress: 0.478,
      fadeDuration: 0.04,
    },
    {
      id: 'segments',
      keys: ['membrane', 'seeds'],
      minProgress: 0.478,
      maxProgress: 0.552,
      fadeDuration: 0.03,
    },
    {
      id: 'crossSection',
      keys: ['juice', 'core'],
      minProgress: 0.575,
      maxProgress: 0.665,
      fadeDuration: 0.04,
    },
  ],

  trioSpecs: [
    {
      id: 'good',
      label: 'GOOD',
      x: -2.52,
      ripeness: 0.60,
      scale: 0.86,
      rotationY: 0.7,
      tilt: 0.16,
    },
    {
      id: 'better',
      label: 'BETTER',
      x: 0.02,
      ripeness: 0.78,
      scale: 0.93,
      rotationY: 2.1,
      tilt: -0.1,
    },
    {
      id: 'best',
      label: 'BEST',
      x: 2.56,
      ripeness: 0.95,
      scale: 1.0,
      rotationY: 4.2,
      tilt: 0.05,
    },
  ],

  cameraStops: [
    { distance: 5.8, y: 0.24, heading: 0.30, targetY: 0 },     // 0: hero
    { distance: 3.9, y: 0.30, heading: 0.62, targetY: 0.02 },  // 1: inspect close
    { distance: 5.0, y: 0.28, heading: 0.24, targetY: -0.05 }, // 2: peel
    { distance: 5.2, y: 0.32, heading: 0.10, targetY: 0 },     // 3: segments
    { distance: 3.5, y: 0.22, heading: 0.03, targetY: 0.02 },  // 4: cross section macro
    { distance: 9.4, y: 0.40, heading: 0.0, targetY: 0.02 },   // 5: trio in
    { distance: 9.4, y: 0.40, heading: 0.0, targetY: 0.02 },   // 6: trio hold
    { distance: 5.4, y: 0.28, heading: 0.40, targetY: 0 },     // 7: rejoin
    { distance: 7.0, y: 0.38, heading: 0.30, targetY: -0.72 }, // 8: cta
  ],

  cameraMarks: [0.0, 0.14, 0.32, 0.50, 0.60, 0.70, 0.845, 0.90, 0.95],

  fallback: {
    gradient: 'radial-gradient(58% 52% at 38% 28%, #f8b95c 0%, #ef9526 38%, #cf6f16 74%, #8d4610 100%)',
    borderRadius: '50%',
    aspectRatio: '1 / 0.92',
    summaryTitle: 'Kinnow Mandarin Inspection',
    summaryText: "Your device can’t run the interactive inspection. The same assessment — colour, button, weight, give — is written out below in full.",
  },

  primaryCta: {
    label: 'EXPLORE EVERYDAY FRESH',
    href: '#everyday-fresh',
  },
  secondaryCta: {
    label: 'EXPLORE SIGNATURE COLLECTION',
    href: '#signature-collection',
  },
};
