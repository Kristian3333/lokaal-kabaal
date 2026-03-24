'use client';

import { motion } from 'framer-motion';

/** Spring config shared across landing animations */
const SPRING = { type: 'spring' as const, stiffness: 60, damping: 18, mass: 0.8 };

/** Word-by-word stagger text animation that reveals each word sequentially */
export default function StaggerText({
  text, className, style, delay = 0,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
}) {
  const words = text.split(' ');
  return (
    <span className={className} style={{ ...style, display: 'inline-flex', flexWrap: 'wrap', gap: '0 0.3em' }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ ...SPRING, delay: delay + i * 0.06 }}
          style={{ display: 'inline-block' }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}
