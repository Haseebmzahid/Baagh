export interface CueConfig {
  id: string;
  in: number;
  out: number;
  anchor: 'left' | 'right' | 'center' | 'bottom-center' | 'hero';
  measure?: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  textAlign?: 'left' | 'right' | 'center';
  eyebrow?: string;
  headline?: string;
  headlineStyle?: 'italicLead' | 'standardHeadline' | 'largeHeadline' | 'heroHeadline' | 'monoHeadline';
  headlineSizePx?: number;
  support?: string;
  stats?: Array<{ label: string; value: string }>;
  isTerminalHero?: boolean;
}

export const cueConfigs: CueConfig[] = [
  {
    id: 'scroll-prompt',
    in: 0,
    out: 0.075,
    anchor: 'bottom-center',
    bottom: '52px',
    textAlign: 'center',
  },
  {
    id: 'cue-1-lead',
    in: 0.005,
    out: 0.07,
    anchor: 'left',
    left: '196px',
    top: '50%',
    measure: '300px',
    eyebrow: 'Chaunsa · Mid-season',
    headline: 'One fruit, before anyone else has seen it.',
    headlineStyle: 'italicLead',
    headlineSizePx: 23,
  },
  {
    id: 'cue-2-crate',
    in: 0.10,
    out: 0.20,
    anchor: 'right',
    right: '120px',
    top: '54%',
    measure: '280px',
    textAlign: 'right',
    headline: 'Chosen at source.',
    headlineStyle: 'standardHeadline',
    headlineSizePx: 27,
    support: 'Every crate is filled by hand, on the morning it is picked.',
  },
  {
    id: 'cue-3-source',
    in: 0.235,
    out: 0.325,
    anchor: 'left',
    left: '196px',
    bottom: '130px',
    measure: '340px',
    eyebrow: 'Multan · 05:40',
    headline: 'This fruit came from somewhere real.',
    headlineStyle: 'largeHeadline',
    headlineSizePx: 31,
  },
  {
    id: 'cue-4-hands',
    in: 0.375,
    out: 0.455,
    anchor: 'right',
    right: '130px',
    top: '46%',
    measure: '300px',
    textAlign: 'right',
    headline: 'Chosen by people who know fruit.',
    headlineStyle: 'standardHeadline',
    headlineSizePx: 27,
    support: 'Three generations of wholesale judgement, in one hand.',
  },
  {
    id: 'cue-5-selection',
    in: 0.49,
    out: 0.575,
    anchor: 'left',
    left: '196px',
    top: '48%',
    measure: '330px',
    headline: 'Not everything that looks good is good enough.',
    headlineStyle: 'standardHeadline',
    headlineSizePx: 29,
    stats: [
      { label: 'Kept', value: '6' },
      { label: 'Set aside', value: '3' },
    ],
  },
  {
    id: 'cue-6-packing',
    in: 0.61,
    out: 0.695,
    anchor: 'right',
    right: '130px',
    bottom: '140px',
    measure: '290px',
    textAlign: 'right',
    headline: 'Handled with care.',
    headlineStyle: 'standardHeadline',
    headlineSizePx: 27,
    support: 'Wrapped, weighed and placed — never poured.',
  },
  {
    id: 'cue-7-journey',
    in: 0.735,
    out: 0.815,
    anchor: 'left',
    left: '196px',
    top: '50%',
    measure: '300px',
    headline: 'Delivered with confidence.',
    headlineStyle: 'standardHeadline',
    headlineSizePx: 27,
    support: 'Same-day, temperature-held, across the city.',
  },
  {
    id: 'cue-8-arrival',
    in: 0.845,
    out: 0.915,
    anchor: 'bottom-center',
    bottom: '120px',
    textAlign: 'center',
    headline: 'IT ARRIVES THE WAY IT LEFT.',
    headlineStyle: 'monoHeadline',
    headlineSizePx: 9,
  },
  {
    id: 'cue-9-home',
    in: 0.93,
    out: 1.01,
    anchor: 'hero',
    textAlign: 'center',
    isTerminalHero: true,
  },
];
