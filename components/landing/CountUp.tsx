'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useInView } from 'framer-motion';

/** Animated counter that counts from 0 to target using requestAnimationFrame */
export default function CountUp({ target, suffix = '', duration = 1400 }: { target: number; suffix?: string; duration?: number }) {
  const ref    = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  const animate = useCallback(() => {
    let startTime: number | null = null;
    let rafId: number;

    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.round(progress * target));

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  useEffect(() => {
    if (!inView) return;
    const cleanup = animate();
    return cleanup;
  }, [inView, animate]);

  return (
    <span ref={ref}>
      {count.toLocaleString('nl')}{suffix}
    </span>
  );
}
