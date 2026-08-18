import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { tokens } from '../config/tokens';

export type FrameCallback = (curProgress: number, dt: number, targetProgress: number) => void;

export interface ScrollContextValue {
  targetProgressRef: React.MutableRefObject<number>;
  curProgressRef: React.MutableRefObject<number>;
  journeyLength: number;
  setJourneyLength: (length: number) => void;
  showChapters: boolean;
  setShowChapters: (show: boolean) => void;
  subscribeFrame: (callback: FrameCallback) => () => void;
}

const ScrollContext = createContext<ScrollContextValue | null>(null);

export const ScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const targetProgressRef = useRef<number>(0);
  const curProgressRef = useRef<number>(0);
  const [journeyLength, setJourneyLength] = useState<number>(tokens.defaults.journeyLength);
  const [showChapters, setShowChapters] = useState<boolean>(tokens.defaults.showChapters);
  const subscribersRef = useRef<Set<FrameCallback>>(new Set());
  const lastTimeRef = useRef<number>(performance.now());

  // Passive scroll event listener
  useEffect(() => {
    function handleScroll() {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const docHeight = document.documentElement.scrollHeight || document.body.scrollHeight || 1;
      const winHeight = window.innerHeight || 1;
      const maxScroll = Math.max(1, docHeight - winHeight);
      const rawTarget = Math.max(0, Math.min(1, scrollY / maxScroll));
      targetProgressRef.current = rawTarget;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial read

    return () => window.removeEventListener('scroll', handleScroll);
  }, [journeyLength]);

  // Central frame loop for exponential damping & subscriber updates
  useEffect(() => {
    let animFrameId: number;

    function tick(now: number) {
      const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      const target = targetProgressRef.current;
      const cur = curProgressRef.current;

      // Damping equation from prototype: cur += (target - cur) * min(1, dt * 3.4)
      const newCur = cur + (target - cur) * Math.min(1, dt * tokens.motion.scrollDampRate);
      curProgressRef.current = newCur;

      // Notify subscribers
      subscribersRef.current.forEach((cb) => cb(newCur, dt, target));

      animFrameId = requestAnimationFrame(tick);
    }

    animFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameId);
  }, []);

  const subscribeFrame = (callback: FrameCallback) => {
    subscribersRef.current.add(callback);
    return () => {
      subscribersRef.current.delete(callback);
    };
  };

  return (
    <ScrollContext.Provider
      value={{
        targetProgressRef,
        curProgressRef,
        journeyLength,
        setJourneyLength,
        showChapters,
        setShowChapters,
        subscribeFrame,
      }}
    >
      {children}
    </ScrollContext.Provider>
  );
};

export function useScroll(): ScrollContextValue {
  const ctx = useContext(ScrollContext);
  if (!ctx) {
    throw new Error('useScroll must be used within a ScrollProvider');
  }
  return ctx;
}
