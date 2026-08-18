import { FruitConfig } from '../../core/types';

/**
 * The prototype drives its choreography with a stage scalar s = progress * 9
 * across ten keyframes. Everything below is that timeline expressed in the
 * production 0..1 progress space (act i is centred on i/9).
 */
export const ANAAR_STAGES = 9;

export interface AnaarCameraKey {
  /** Camera position. */
  p: [number, number, number];
  /** Look-at target. */
  t: [number, number, number];
  /** Vertical field of view. */
  f: number;
}

/** Exact camera choreography from the approved prototype, one key per act. */
export const anaarCameraKeys: AnaarCameraKey[] = [
  { p: [0.24, 0.38, 6.9], t: [0, 0.02, 0], f: 30 },
  { p: [1.55, 0.72, 5.4], t: [0, 0.05, 0], f: 28 },
  { p: [0.7, 2.05, 3.05], t: [0.02, 0.66, 0], f: 26 },
  { p: [0.32, 0.5, 4.85], t: [0, 0.05, 0], f: 30 },
  { p: [0.16, 0.44, 5.7], t: [0, 0, 0], f: 34 },
  { p: [0.18, 0.06, 1.85], t: [0.86, 0, 0.05], f: 32 },
  { p: [0.24, 0.38, 5.6], t: [0.05, 0.02, 0], f: 30 },
  { p: [0, 0.24, 9.9], t: [0, -0.06, 0], f: 30 },
  { p: [-0.55, 0.36, 6.3], t: [0, 0.02, 0], f: 29 },
  { p: [1.0, 0.16, 5.6], t: [0.05, -0.02, 0], f: 27 },
];

export const anaarConfig: FruitConfig = {
  id: 'anaar',
  name: 'Anaar',
  variety: 'Kandhari Anaar',
  chapterLabel: 'CHAPTER FIVE — FRUIT INTELLIGENCE',
  headline: 'Anaar, before anyone\nclaims anything.',
  subhead:
    'One pomegranate, lit and left alone. Drag to turn it in the light; scroll to follow the inspection.',
  scrollPaceScreens: 10.0, // 1000vh — ten acts
  defaultExposure: 1.35,

  acts: [
    {
      index: 0,
      eyebrow: '01 — WHOLE FRUIT',
      headline: 'Anaar, before anyone claims anything.',
      body: 'One pomegranate, lit and left alone. Turn it: the skin records the season it had — where the sun sat, how long it held on the tree.',
      minProgress: -0.02,
      maxProgress: 0.05,
      fadeDuration: 0.03,
    },
    {
      index: 1,
      eyebrow: '02 — INSPECTION',
      headline: 'What the hand knows first.',
      body: 'A buyer reads five things before the fruit is ever cut. None of them are printed on the box.',
      minProgress: 0.0611,
      maxProgress: 0.1611,
      fadeDuration: 0.03,
    },
    {
      index: 2,
      eyebrow: '03 — THE CROWN',
      headline: 'Read the crown first.',
      body: 'The calyx dries as the fruit matures. Splayed, leathery, brittle at the tips — it is the earliest honest signal a pomegranate gives.',
      minProgress: 0.1722,
      maxProgress: 0.2722,
      fadeDuration: 0.03,
    },
    {
      index: 3,
      eyebrow: '04 — THE OPENING',
      headline: 'It is opened, not broken.',
      body: 'Score the skin, follow the ridges the fruit already has, and it comes apart along its own chambers. Force it and you lose the evidence.',
      minProgress: 0.2833,
      maxProgress: 0.3833,
      fadeDuration: 0.03,
    },
    {
      index: 4,
      eyebrow: '05 — INSIDE',
      headline: 'Chambers, not compartments.',
      body: 'Pale membrane divides the fruit into uneven rooms. No two pomegranates are partitioned the same way — which is exactly why the inside has to be looked at.',
      minProgress: 0.3944,
      maxProgress: 0.4944,
      fadeDuration: 0.03,
    },
    {
      index: 5,
      eyebrow: '06 — THE ARILS',
      headline: 'Hundreds of small decisions.',
      body: 'Each aril is a seed inside its own jacket of juice. Size varies, colour varies. What should not vary is how tightly they are packed.',
      minProgress: 0.5056,
      maxProgress: 0.6056,
      fadeDuration: 0.03,
    },
    {
      index: 6,
      eyebrow: '07 — STRUCTURE',
      headline: 'The inside is the evidence.',
      body: 'Five things we look at once the fruit is open. Read conservatively, and against the crate it came from.',
      minProgress: 0.6167,
      maxProgress: 0.7167,
      fadeDuration: 0.03,
    },
    {
      index: 7,
      eyebrow: '08 — SELECTION',
      headline: 'Good. Better. Best.',
      body: 'Three pomegranates that would all pass at a market stall. Not every anaar that looks good from the outside is the one we choose.',
      isItalicHeadline: true,
      isCentered: true,
      minProgress: 0.7278,
      maxProgress: 0.8278,
      fadeDuration: 0.03,
    },
    {
      index: 8,
      eyebrow: '09 — WHOLE AGAIN',
      headline: 'Closed, and still known.',
      body: 'The fruit goes back together. What changed is what you now know to look for — and who did the looking before it reached you.',
      minProgress: 0.8389,
      maxProgress: 0.9389,
      fadeDuration: 0.03,
    },
    {
      index: 9,
      eyebrow: '10 — SELECTION, PACKED',
      headline: 'The Anaar we choose for you.',
      body: 'Selected with the judgement of experienced fruit buyers.',
      isCentered: true,
      hasCta: true,
      minProgress: 0.95,
      maxProgress: 1.05,
      fadeDuration: 0.02,
    },
  ],

  anchors: [
    // Layout reference anchors used by FruitAnnotations for column placement.
    { id: 'center', label: 'CENTER', description: '', position: [0, 0, 0], actGroup: 'inspect' },
    { id: 'top', label: 'TOP', description: '', position: [0, 0.92, 0], actGroup: 'inspect' },
    { id: 'edge', label: 'EDGE', description: '', position: [-1, 0, 0], actGroup: 'inspect' },

    // Act 02 — what the hand knows first.
    {
      id: 'skin',
      label: 'SKIN',
      description: 'Matte, taut, finely pored',
      position: [0.62, 0.34, 0.72],
      actGroup: 'inspect',
    },
    {
      id: 'weight',
      label: 'WEIGHT',
      description: 'Heavy for its size',
      position: [-0.78, -0.18, 0.48],
      actGroup: 'inspect',
    },
    {
      id: 'firmness',
      label: 'FIRMNESS',
      description: 'No give at the shoulder',
      position: [0.55, -0.55, 0.55],
      actGroup: 'inspect',
    },
    {
      id: 'crown',
      label: 'CROWN',
      description: 'Dry, intact, closed',
      position: [0.16, 0.92, 0.22],
      actGroup: 'inspect',
    },
    {
      id: 'colour',
      label: 'COLOUR',
      description: 'Uneven — sun-worked, not painted',
      position: [-0.66, 0.42, 0.42],
      actGroup: 'inspect',
    },

    // Act 03 — the crown.
    {
      id: 'sepals',
      label: 'SEPALS',
      description: 'Six to eight, dried open',
      position: [0.3, 1.02, 0.16],
      actGroup: 'inspect',
    },
    {
      id: 'tips',
      label: 'TIPS',
      description: 'Brittle, slightly inturned',
      position: [-0.24, 1.1, 0.1],
      actGroup: 'inspect',
    },
    {
      id: 'neck',
      label: 'NECK',
      description: 'Short, unsplit',
      position: [0.2, 0.74, 0.16],
      actGroup: 'inspect',
    },

    // Act 07 — the interior, read on the near half's cut face.
    {
      id: 'arils',
      label: 'ARILS',
      description: 'Packed edge to edge',
      position: [-0.06, 0.54, 0.1],
      actGroup: 'anatomy',
      hostMesh: 'halfA',
      alwaysFront: true,
    },
    {
      id: 'membrane',
      label: 'MEMBRANE',
      description: 'Thin, pale, unbruised',
      position: [-0.06, -0.04, -0.26],
      actGroup: 'anatomy',
      hostMesh: 'halfA',
      alwaysFront: true,
    },
    {
      id: 'arilColour',
      label: 'COLOUR',
      description: 'Garnet through to deep ruby',
      position: [-0.06, -0.72, -0.06],
      actGroup: 'anatomy',
      hostMesh: 'halfA',
      alwaysFront: true,
    },
    {
      id: 'juiciness',
      label: 'JUICINESS',
      description: 'Arils sit taut, not shrunken',
      position: [-0.06, 0.66, -0.46],
      actGroup: 'anatomy',
      hostMesh: 'halfA',
      alwaysFront: true,
    },
    {
      id: 'seed',
      label: 'SEED',
      description: 'Small core, soft bite',
      position: [-0.06, -0.46, -0.64],
      actGroup: 'anatomy',
      hostMesh: 'halfA',
      alwaysFront: true,
    },

    // Act 08 — the selection trio.
    {
      id: 'good',
      label: 'GOOD',
      description: 'Sound fruit. Lighter in the hand.',
      position: [-2.3, -1.12, 0],
      actGroup: 'trio',
      alwaysFront: true,
    },
    {
      id: 'better',
      label: 'BETTER',
      description: 'Even colour. Crown a little green.',
      position: [0, -1.18, 0],
      actGroup: 'trio',
      alwaysFront: true,
    },
    {
      id: 'best',
      label: 'BEST',
      description: 'Squared shoulders. Dense, dry-crowned.',
      position: [2.3, -1.22, 0],
      actGroup: 'trio',
      alwaysFront: true,
    },
  ],

  anchorGroups: [
    {
      id: 'inspect',
      keys: ['skin', 'weight', 'firmness', 'crown', 'colour'],
      minProgress: 0.05,
      maxProgress: 0.1722,
      fadeDuration: 0.04,
    },
    {
      id: 'crown',
      keys: ['sepals', 'tips', 'neck'],
      minProgress: 0.1611,
      maxProgress: 0.2833,
      fadeDuration: 0.04,
    },
    {
      id: 'interior',
      keys: ['arils', 'membrane', 'arilColour', 'juiciness', 'seed'],
      minProgress: 0.6056,
      maxProgress: 0.7278,
      fadeDuration: 0.04,
    },
    {
      id: 'trio',
      keys: ['good', 'better', 'best'],
      minProgress: 0.7167,
      maxProgress: 0.8389,
      fadeDuration: 0.04,
    },
  ],

  trioSpecs: [
    {
      id: 'good',
      label: 'GOOD',
      x: -2.3,
      ripeness: 0.45,
      scale: 0.84,
      rotationY: 0,
      tilt: 0.02,
    },
    {
      id: 'better',
      label: 'BETTER',
      x: 0,
      ripeness: 0.7,
      scale: 0.93,
      rotationY: 1.9,
      tilt: -0.005,
    },
    {
      id: 'best',
      label: 'BEST',
      x: 2.3,
      ripeness: 0.95,
      scale: 1.0,
      rotationY: 3.8,
      tilt: -0.035,
    },
  ],

  // Orbit equivalents of anaarCameraKeys, kept for FruitConfig completeness.
  cameraStops: [
    { distance: 6.914, y: 0.38, heading: 0.035, targetY: 0.02 },
    { distance: 5.658, y: 0.72, heading: 0.279, targetY: 0.05 },
    { distance: 3.42, y: 2.05, heading: 0.219, targetY: 0.66 },
    { distance: 4.881, y: 0.5, heading: 0.066, targetY: 0.05 },
    { distance: 5.719, y: 0.44, heading: 0.028, targetY: 0 },
    { distance: 1.925, y: 0.06, heading: -0.361, targetY: 0 },
    { distance: 5.615, y: 0.38, heading: 0.034, targetY: 0.02 },
    { distance: 9.905, y: 0.24, heading: 0, targetY: -0.06 },
    { distance: 6.333, y: 0.36, heading: -0.087, targetY: 0.02 },
    { distance: 5.683, y: 0.16, heading: 0.168, targetY: -0.02 },
  ],
  cameraMarks: [
    0,
    1 / 9,
    2 / 9,
    3 / 9,
    4 / 9,
    5 / 9,
    6 / 9,
    7 / 9,
    8 / 9,
    1,
  ],

  fallback: {
    gradient:
      'radial-gradient(58% 50% at 38% 30%, #c9424a 0%, #a8202c 34%, #7c1420 66%, #3a0a10 100%)',
    borderRadius: '48% 52% 49% 51% / 52% 50% 50% 48%',
    aspectRatio: '1 / 1.04',
    summaryTitle: 'Anaar Inspection',
    summaryText:
      'Your device can’t run the interactive inspection. The same assessment — skin, crown, chambers, arils — is written out below in full.',
  },

  primaryCta: { label: 'EXPLORE EVERYDAY FRESH', href: '#everyday-fresh' },
  secondaryCta: { label: 'EXPLORE SIGNATURE COLLECTION', href: '#signature-collection' },
};
