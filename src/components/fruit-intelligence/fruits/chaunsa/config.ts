import { FruitConfig } from '../../core/types';

export const chaunsaConfig: FruitConfig = {
  id: 'chaunsa',
  name: 'Chaunsa Mango',
  variety: 'Summer Honey Chaunsa',
  chapterLabel: 'CHAPTER TWO — FRUIT INTELLIGENCE',
  headline: 'Read a Chaunsa\nthe way a buyer reads it.',
  subhead: 'One fruit, examined properly. Drag to turn it in the light; scroll to follow the inspection.',
  scrollPaceScreens: 8.2, // 820vh
  defaultExposure: 1.16,

  acts: [
    {
      index: 0,
      eyebrow: 'CHAPTER TWO — FRUIT INTELLIGENCE',
      headline: 'Read a Chaunsa\nthe way a buyer reads it.',
      body: 'One fruit, examined properly. Drag to turn it in the light; scroll to follow the inspection.',
      minProgress: -0.02,
      maxProgress: 0.085,
      fadeDuration: 0.03,
    },
    {
      index: 1,
      eyebrow: '01 — THE INSPECTION',
      headline: 'Four judgements, in this order.',
      body: 'Aroma first, then skin, then firmness at the shoulder — colour is confirmation, not evidence.',
      minProgress: 0.10,
      maxProgress: 0.275,
      fadeDuration: 0.03,
    },
    {
      index: 2,
      eyebrow: '02 — THE CUT',
      headline: 'One pass, beside the stone.',
      body: 'The cheek comes away in a single stroke. How cleanly it releases tells us how the fruit was grown and held.',
      minProgress: 0.295,
      maxProgress: 0.425,
      fadeDuration: 0.03,
    },
    {
      index: 3,
      eyebrow: '03 — WHAT IS INSIDE',
      headline: 'Skin, flesh, stone.',
      body: 'Held apart for a moment. Each part answers a different question about the same fruit.',
      minProgress: 0.44,
      maxProgress: 0.51,
      fadeDuration: 0.03,
    },
    {
      index: 4,
      eyebrow: '04 — FRUIT INTELLIGENCE',
      headline: 'What our buyers note.',
      body: 'Prototype wording — the categories, not the verdict. Hover a marker to read it in full.',
      minProgress: 0.525,
      maxProgress: 0.665,
      fadeDuration: 0.03,
    },
    {
      index: 5,
      eyebrow: '05 — THE SELECTION TEST',
      headline: 'Not every mango that looks beautiful is the mango we choose.',
      body: 'Three sound fruits. One carries the aroma, the gradation and the weight together — that is the one we send.',
      isItalicHeadline: true,
      isCentered: true,
      minProgress: 0.68,
      maxProgress: 0.845,
      fadeDuration: 0.03,
    },
    {
      index: 6,
      eyebrow: '06 — WHOLE AGAIN',
      headline: 'A judgement made a thousand times a day.',
      body: 'Every crate is read this way before it leaves the packhouse.',
      minProgress: 0.86,
      maxProgress: 0.925,
      fadeDuration: 0.025,
    },
    {
      index: 7,
      eyebrow: '',
      headline: 'The Chaunsa we choose for you.',
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
      position: [0, 1.04, 0],
      actGroup: 'inspect',
    },
    {
      id: 'aroma',
      label: 'AROMA',
      description: 'Assessed at the stem end, before anything else.',
      position: [-0.12, 1.16, 0.08],
      actGroup: 'inspect',
    },
    {
      id: 'skin',
      label: 'SKIN',
      description: 'Taut and lightly speckled. Never wrinkled.',
      position: [0.66, 0.30, 0.42],
      actGroup: 'inspect',
    },
    {
      id: 'firmness',
      label: 'FIRMNESS',
      description: 'A slight give at the shoulder. Not softness.',
      position: [-0.62, -0.18, 0.30],
      actGroup: 'inspect',
    },
    {
      id: 'ripeness',
      label: 'RIPENESS',
      description: 'Gradation across the fruit, not a flat yellow.',
      position: [0.30, -0.98, 0.22],
      actGroup: 'inspect',
    },
    {
      id: 'flesh',
      label: 'FLESH',
      description: 'Colour, texture and maturity, read together.',
      position: [0.10, 0.20, -0.34],
      actGroup: 'anatomy',
      hostMesh: 'cheekGroup',
    },
    {
      id: 'fibre',
      label: 'FIBRE',
      description: 'Smooth at the cut face is what we want.',
      position: [-0.34, -0.62, -0.30],
      actGroup: 'anatomy',
      hostMesh: 'cheekGroup',
    },
    {
      id: 'seed',
      label: 'STONE',
      description: 'Slim, with generous flesh held around it.',
      position: [1.10, 0.05, 0.95],
      actGroup: 'anatomy',
      hostMesh: 'bodyGroup',
    },
  ],

  anchorGroups: [
    {
      id: 'inspect',
      keys: ['aroma', 'skin', 'firmness', 'ripeness'],
      minProgress: 0.085,
      maxProgress: 0.30,
      fadeDuration: 0.05,
    },
    {
      id: 'anatomy',
      keys: ['flesh', 'fibre', 'seed'],
      minProgress: 0.50,
      maxProgress: 0.70,
      fadeDuration: 0.05,
    },
  ],

  trioSpecs: [
    {
      id: 'good',
      label: 'GOOD',
      x: -3.05,
      ripeness: 0.20,
      scale: 0.88,
      rotationY: -0.4,
      tilt: 0.16,
    },
    {
      id: 'better',
      label: 'BETTER',
      x: 0.0,
      ripeness: 0.52,
      scale: 0.94,
      rotationY: 0.5,
      tilt: -0.1,
    },
    {
      id: 'best',
      label: 'BEST',
      x: 3.1,
      ripeness: 0.88,
      scale: 1.02,
      rotationY: -0.15,
      tilt: 0.06,
    },
  ],

  cameraStops: [
    { distance: 7.4, y: 0.30, heading: 0.30, targetY: 0 },    // 0: hero
    { distance: 5.6, y: 0.40, heading: 0.60, targetY: 0.05 }, // 1: inspect
    { distance: 5.9, y: 0.24, heading: 0.20, targetY: 0 },    // 2: cut
    { distance: 8.6, y: 0.38, heading: 0.14, targetY: 0.02 }, // 3: exploded
    { distance: 8.2, y: 0.30, heading: 0.05, targetY: 0.02 }, // 4: intelligence
    { distance: 11.6, y: 0.50, heading: 0.10, targetY: 0.02 },// 5: trio
    { distance: 8.4, y: 0.40, heading: 0.45, targetY: 0 },    // 6: rejoin
    { distance: 8.4, y: 0.44, heading: 0.32, targetY: -0.52 },// 7: cta
  ],

  cameraMarks: [0.0, 0.14, 0.32, 0.46, 0.58, 0.70, 0.86, 0.95],

  fallback: {
    gradient: 'radial-gradient(58% 52% at 38% 26%, #f6d276 0%, #e8b03c 38%, #c9822a 72%, #8d5620 100%)',
    borderRadius: '52% 48% 46% 54% / 58% 42% 58% 42%',
    aspectRatio: '1 / 1.22',
    summaryTitle: 'Chaunsa Mango Inspection',
    summaryText: "Your device can’t run the interactive inspection. The same assessment — aroma, skin, firmness, ripeness — is written out below in full.",
  },

  primaryCta: {
    label: 'EXPLORE EVERYDAY FRESH',
    href: '/everyday-fresh',
  },
  secondaryCta: {
    label: 'EXPLORE SIGNATURE COLLECTION',
    href: '/signature',
  },
};
