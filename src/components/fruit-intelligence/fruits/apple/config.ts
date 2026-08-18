import { FruitConfig } from '../../core/types';

export const appleConfig: FruitConfig = {
  id: 'apple',
  name: 'Apple',
  variety: 'Crimson Crisp Apple',
  chapterLabel: 'CHAPTER FOUR — FRUIT INTELLIGENCE',
  headline: 'An apple gives away\nmore than it means to.',
  subhead:
    'One fruit, examined properly. Drag to turn it in the light; scroll to follow the inspection.',
  scrollPaceScreens: 9.0, // 900vh
  defaultExposure: 1.16,

  acts: [
    {
      index: 0,
      eyebrow: 'CHAPTER FOUR — FRUIT INTELLIGENCE',
      headline: 'An apple gives away\nmore than it means to.',
      body: 'One fruit, examined properly. Drag to turn it in the light; scroll to follow the inspection.',
      minProgress: -0.02,
      maxProgress: 0.085,
      fadeDuration: 0.03,
    },
    {
      index: 1,
      eyebrow: '01 — THE INSPECTION',
      headline: 'Four judgements, before the knife.',
      body: 'Skin first, then how the colour is laid down, then the stem, then how the fruit answers a thumb.',
      minProgress: 0.1,
      maxProgress: 0.275,
      fadeDuration: 0.03,
    },
    {
      index: 2,
      eyebrow: '02 — THE SLICE',
      headline: 'One pass, straight down through the core.',
      body: 'A sound apple resists the blade and then parts cleanly. You can hear it before you see it.',
      minProgress: 0.295,
      maxProgress: 0.44,
      fadeDuration: 0.03,
    },
    {
      index: 3,
      eyebrow: '03 — THE WEDGES',
      headline: 'Six faces, all telling the same story.',
      body: 'Even colour across every cut, a thin bright skin line, and moisture standing on the surface.',
      minProgress: 0.455,
      maxProgress: 0.545,
      fadeDuration: 0.03,
    },
    {
      index: 4,
      eyebrow: '04 — THE CROSS SECTION',
      headline: 'Cut lengthwise, nothing stays hidden.',
      body: 'The core reads as a closed butterfly, the flesh cream against it. This is where a bad crate is caught.',
      minProgress: 0.565,
      maxProgress: 0.668,
      fadeDuration: 0.03,
    },
    {
      index: 5,
      eyebrow: '05 — CORE AND SEEDS',
      headline: 'The part nobody eats, and we still read it.',
      body: 'Dark, filled seed chambers say the fruit was left on the tree long enough. Pale ones say it was not.',
      minProgress: 0.688,
      maxProgress: 0.805,
      fadeDuration: 0.03,
    },
    {
      index: 6,
      eyebrow: '06 — THE SELECTION TEST',
      headline: 'Not every apple that looks good is the apple we choose.',
      body: 'Three sound fruits. One has the colour laid down evenly, a supple stem and no give at all — that is the one we send.',
      isItalicHeadline: true,
      isCentered: true,
      minProgress: 0.842,
      maxProgress: 0.945,
      fadeDuration: 0.03,
    },
    {
      index: 7,
      eyebrow: '07 — WHOLE AGAIN',
      headline: 'Read once, then repeated crate after crate.',
      body: 'The same judgements, made by hand, before anything is packed.',
      minProgress: 0.952,
      maxProgress: 0.978,
      fadeDuration: 0.02,
    },
    {
      index: 8,
      eyebrow: '',
      headline: 'The apple we choose for you.',
      body: 'Selected with the judgement of experienced fruit buyers.',
      isCentered: true,
      hasCta: true,
      minProgress: 0.982,
      maxProgress: 1.05,
      fadeDuration: 0.015,
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
      position: [0, 0.918, 0],
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
      id: 'skin',
      label: 'SKIN',
      description: 'Tight and waxy, with fine pale freckling.',
      position: [0.62, 0.2, 0.5],
      actGroup: 'inspect',
    },
    {
      id: 'colour',
      label: 'COLOUR',
      description: 'Striped crimson over a gold shoulder — never flat.',
      position: [0.5, 0.46, 0.5],
      actGroup: 'inspect',
    },
    {
      id: 'stem',
      label: 'STEM',
      description: 'Still attached, still supple. It dates the pick.',
      position: [0.05, 0.969, 0.05],
      actGroup: 'inspect',
    },
    {
      id: 'firmness',
      label: 'FIRMNESS',
      description: 'No give at all under the thumb.',
      position: [-0.6, -0.3, 0.44],
      actGroup: 'inspect',
    },
    {
      id: 'cut',
      label: 'CUT FACE',
      description: 'Crisp and beaded with moisture, not mealy.',
      position: [0.4, 0.1, 0.1],
      actGroup: 'anatomy',
      hostMesh: 'nearWedge',
    },
    {
      id: 'flesh',
      label: 'FLESH',
      description: 'Cream, close-grained, green nearer the core.',
      position: [-0.3, 0.3, 0.03],
      actGroup: 'anatomy',
      hostMesh: 'crossGroup',
      alwaysFront: true,
    },
    {
      id: 'core',
      label: 'CORE',
      description: 'Closed and dry. Nothing browning at the walls.',
      position: [0.02, 0.05, 0.03],
      actGroup: 'anatomy',
      hostMesh: 'crossGroup',
      alwaysFront: true,
    },
    {
      id: 'seeds',
      label: 'SEEDS',
      description: 'Dark and plump — the fruit matured on the tree.',
      position: [0.09, 0.02, 0.16],
      actGroup: 'anatomy',
      hostMesh: 'coreGroup',
      alwaysFront: true,
    },
    {
      id: 'chamber',
      label: 'CHAMBERS',
      description: 'Five, evenly filled. A sign of even pollination.',
      position: [-0.02, 0.24, 0.02],
      actGroup: 'anatomy',
      hostMesh: 'coreGroup',
      alwaysFront: true,
    },
  ],

  anchorGroups: [
    {
      id: 'inspect',
      keys: ['skin', 'colour', 'stem', 'firmness'],
      minProgress: 0.085,
      maxProgress: 0.3,
      fadeDuration: 0.05,
    },
    {
      id: 'wedges',
      keys: ['cut'],
      minProgress: 0.46,
      maxProgress: 0.545,
      fadeDuration: 0.03,
    },
    {
      id: 'crossSection',
      keys: ['flesh', 'core'],
      minProgress: 0.575,
      maxProgress: 0.665,
      fadeDuration: 0.04,
    },
    {
      id: 'coreSeeds',
      keys: ['seeds', 'chamber'],
      minProgress: 0.7,
      maxProgress: 0.8,
      fadeDuration: 0.04,
    },
    {
      id: 'trio',
      keys: ['good', 'better', 'best'],
      minProgress: 0.845,
      maxProgress: 0.945,
      fadeDuration: 0.04,
    },
  ],

  trioSpecs: [
    {
      id: 'good',
      label: 'GOOD',
      x: -2.5,
      ripeness: 0.42,
      scale: 0.86,
      rotationY: 0.6,
      tilt: 0.14,
    },
    {
      id: 'better',
      label: 'BETTER',
      x: 0.02,
      ripeness: 0.66,
      scale: 0.93,
      rotationY: 2.4,
      tilt: -0.08,
    },
    {
      id: 'best',
      label: 'BEST',
      x: 2.54,
      ripeness: 0.9,
      scale: 1.0,
      rotationY: 4.1,
      tilt: 0.05,
    },
  ],

  cameraStops: [
    { distance: 5.6, y: 0.22, heading: 0.3, targetY: 0 }, // 0: hero
    { distance: 3.8, y: 0.28, heading: 0.6, targetY: 0.02 }, // 1: inspection, macro
    { distance: 5.0, y: 0.26, heading: 0.2, targetY: -0.04 }, // 2: slice
    { distance: 5.6, y: 0.3, heading: 0.08, targetY: 0 }, // 3: wedges
    { distance: 4.6, y: 0.24, heading: 0.02, targetY: 0.02 }, // 4: cross-section
    { distance: 0.5, y: 1.5, heading: 0.04, targetY: 0.02 }, // 5: core, looking down
    { distance: 0.5, y: 1.5, heading: 0.1, targetY: 0.02 }, // 6: core hold
    { distance: 9.2, y: 0.38, heading: 0.0, targetY: -0.62 }, // 7: trio in
    { distance: 9.2, y: 0.38, heading: 0.0, targetY: -0.62 }, // 8: trio hold
    { distance: 5.6, y: 0.26, heading: 0.38, targetY: 0 }, // 9: whole again
    { distance: 7.0, y: 0.36, heading: 0.28, targetY: -0.72 }, // 10: cta
  ],

  cameraMarks: [0.0, 0.14, 0.32, 0.48, 0.58, 0.7, 0.8, 0.865, 0.925, 0.955, 0.98],

  fallback: {
    gradient:
      'radial-gradient(56% 48% at 36% 30%, #e0a24a 0%, #c8362f 40%, #96181f 74%, #5c0c14 100%)',
    borderRadius: '48% 52% 50% 50% / 54% 54% 46% 46%',
    aspectRatio: '1 / 1.02',
    summaryTitle: 'Apple Inspection',
    summaryText:
      'Your device can’t run the interactive inspection. The same assessment — skin, colour, stem, firmness — is written out below in full.',
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
