'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/** Spring config shared across landing animations */
const SPRING = { type: 'spring' as const, stiffness: 60, damping: 18, mass: 0.8 };

/** Scroll-triggered reveal wrapper that fades children up into view */
export default function FadeUp({
  children, delay = 0, className, style,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref  = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ ...SPRING, delay }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}
