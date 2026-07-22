import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion, type Variants } from 'motion/react';

/**
 * Shared, reduced-motion-aware motion primitives.
 *
 * Everything animates only transform + opacity (compositor-friendly). The app is
 * wrapped in <MotionConfig reducedMotion="user">, so when the OS requests reduced
 * motion these fall back to a plain opacity fade with no movement.
 */

const EASE = [0.16, 1, 0.3, 1] as const; // easeOutExpo-ish — calm, premium

/* ------------------------------- Reveal ------------------------------- */
/** Fade + rise into view once. Use for sections / hero blocks. */
export const Reveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, y = 18, className, style }) => (
  <motion.div
    className={className}
    style={style}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-8% 0px' }}
    transition={{ duration: 0.55, ease: EASE, delay }}
  >
    {children}
  </motion.div>
);

/* ----------------------------- Stagger group ---------------------------- */
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

/** Container that reveals its <StaggerItem> children in sequence. */
export const Stagger: React.FC<{
  children: React.ReactNode;
  stagger?: number;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, stagger = 0.06, delay = 0.04, className, style }) => (
  <motion.div
    className={className}
    style={style}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-6% 0px' }}
    variants={{ visible: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
  >
    {children}
  </motion.div>
);

export const StaggerItem: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, className, style }) => (
  <motion.div className={className} style={style} variants={itemVariants}>
    {children}
  </motion.div>
);

/* ------------------------------ MotionCard ------------------------------ */
/** A hover-lifting surface. Drop-in replacement for a card <div>. */
export const MotionCard: React.FC<
  {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    lift?: number;
    onClick?: () => void;
  } & Pick<React.HTMLAttributes<HTMLDivElement>, 'role' | 'aria-label'>
> = ({ children, className, style, lift = -4, onClick, ...rest }) => (
  <motion.div
    className={className}
    style={style}
    onClick={onClick}
    whileHover={{ y: lift }}
    transition={{ type: 'spring', stiffness: 320, damping: 26 }}
    {...rest}
  >
    {children}
  </motion.div>
);

/* --------------------------- AnimatedNumber ---------------------------- */
/** Counts up from 0 → value when scrolled into view (rAF, easeOutCubic). */
export const AnimatedNumber: React.FC<{
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ value, decimals = 0, prefix = '', suffix = '', duration = 1000, className, style }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) { setDisplay(value); return; }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, reduce, duration]);

  const formatted = display.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}{formatted}{suffix}
    </span>
  );
};
