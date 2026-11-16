/** Frame-rate-independent damping: the same settling time at 30, 60 or 120 Hz. */
export function damping(rate: number, dt: number): number {
  return 1 - Math.exp(-rate * Math.max(0, Math.min(dt, 0.1)));
}

export function sceneQuality(width: number, height: number, cores = 8, memory = 8, saveData = false) {
  const lowPerformance = Math.min(width, height) < 760 || cores <= 4 || memory <= 4 || saveData;
  return { lowPerformance, pixelRatio: lowPerformance ? 1 : 1.5 };
}

/** Bounds React/annotation work separately from the GPU frame rate. */
export function shouldPublishFrame(now: number, last: number, interval = 1000 / 24): boolean {
  return now - last >= interval;
}

/** Ignore isolated stalls; request a lower GPU budget only after sustained slow frames. */
export function createFrameBudget() {
  let slowFrames = 0;
  let lastChange = -Infinity;
  return (frameMs: number, now: number): boolean => {
    slowFrames = frameMs > 34 ? slowFrames + (frameMs > 150 ? 6 : 1) : Math.max(0, slowFrames - 2);
    if (slowFrames < 18 || now - lastChange < 2000) return false;
    slowFrames = 0;
    lastChange = now;
    return true;
  };
}
