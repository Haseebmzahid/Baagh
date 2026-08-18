export const clamp = (v: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

export const smooth = (t: number): number =>
  t * t * (3 - 2 * t);

export const ramp = (progress: number, start: number, end: number): number =>
  smooth(clamp((progress - start) / (end - start), 0, 1));

export const win = (
  p: number,
  start: number,
  end: number,
  fade: number = 0.035
): number => {
  const inn = Math.min(1, Math.max(0, (p - start) / fade));
  const out = Math.min(1, Math.max(0, (end - p) / fade));
  const t = Math.min(inn, out);
  return t * t * (3 - 2 * t);
};

export const rnd = (min: number, max: number): number =>
  min + Math.random() * (max - min);
