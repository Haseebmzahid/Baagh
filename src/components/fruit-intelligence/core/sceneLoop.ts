import { createFrameBudget, shouldPublishFrame } from './performance.ts';

/** One cancellable loop per scene. Hidden tabs do no work; reduced motion is on demand. */
export function createSceneLoop(
  render: (time: number, dt: number, publish: boolean) => void,
  reducedMotion = false,
  reduceResolution?: () => void,
) {
  const exceedsBudget = createFrameBudget();
  let raf = 0;
  let disposed = false;
  let last = 0;
  let elapsed = 0;
  let lastPublish = -Infinity;
  const schedule = () => {
    if (!raf && !disposed && !document.hidden) raf = requestAnimationFrame(frame);
  };
  function frame(now: number) {
    raf = 0;
    if (disposed || document.hidden) return;
    // Avoid running the full renderer at 120/144 Hz on high-refresh displays.
    if (!reducedMotion && last && now - last < 1000 / 60 - .5) { schedule(); return; }
    if (!reducedMotion && last && exceedsBudget(now - last, now)) reduceResolution?.();
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
    last = now;
    elapsed += dt;
    const publish = reducedMotion || shouldPublishFrame(now, lastPublish);
    if (publish) lastPublish = now;
    render(reducedMotion ? 9 : 9 + elapsed, reducedMotion ? 1 : dt, publish);
    if (!reducedMotion) schedule();
  }
  const visibility = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
    if (!document.hidden) schedule();
  };
  document.addEventListener('visibilitychange', visibility);
  return {
    start: schedule,
    invalidate: schedule,
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', visibility);
    },
  };
}
