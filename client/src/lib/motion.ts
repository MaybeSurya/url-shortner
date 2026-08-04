import type { Variants } from 'framer-motion';

// ─────────────────────────────────────────────────────────────
// Easing
// ─────────────────────────────────────────────────────────────
export const ease = {
  // Apple / Linear smooth
  smooth: [0.16, 1, 0.3, 1] as [number, number, number, number],
  // Snappy out
  out: [0.0, 0.0, 0.2, 1] as [number, number, number, number],
  // Spring-like
  spring: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
  // Expo out
  expo: [0.16, 1, 0.3, 1] as [number, number, number, number],
};

// ─────────────────────────────────────────────────────────────
// Page-level transitions
// ─────────────────────────────────────────────────────────────
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: ease.smooth },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.15, ease: ease.out },
  },
};

// ─────────────────────────────────────────────────────────────
// Fade in
// ─────────────────────────────────────────────────────────────
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3, ease: ease.smooth } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

// ─────────────────────────────────────────────────────────────
// Slide up (cards, list items)
// ─────────────────────────────────────────────────────────────
export const slideUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: ease.smooth },
  },
  exit: { opacity: 0, y: 8, transition: { duration: 0.2 } },
};

// ─────────────────────────────────────────────────────────────
// Scale in (modals, dropdowns)
// ─────────────────────────────────────────────────────────────
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.25, ease: ease.smooth },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.15, ease: ease.out },
  },
};

// ─────────────────────────────────────────────────────────────
// Stagger container
// ─────────────────────────────────────────────────────────────
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

// ─────────────────────────────────────────────────────────────
// Stagger child (used inside staggerContainer)
// ─────────────────────────────────────────────────────────────
export const staggerChild: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: ease.smooth },
  },
};

// ─────────────────────────────────────────────────────────────
// Slide from right (drawer)
// ─────────────────────────────────────────────────────────────
export const slideRight: Variants = {
  initial: { x: '100%', opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: ease.smooth },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { duration: 0.25, ease: ease.out },
  },
};

// ─────────────────────────────────────────────────────────────
// Sidebar collapse
// ─────────────────────────────────────────────────────────────
export const sidebarVariants = {
  expanded: { width: 240, transition: { duration: 0.3, ease: ease.smooth } },
  collapsed: { width: 60, transition: { duration: 0.3, ease: ease.smooth } },
};

// ─────────────────────────────────────────────────────────────
// Shake (error)
// ─────────────────────────────────────────────────────────────
export const shake: Variants = {
  animate: {
    x: [0, -6, 6, -4, 4, -2, 2, 0],
    transition: { duration: 0.5 },
  },
};

// ─────────────────────────────────────────────────────────────
// Backdrop
// ─────────────────────────────────────────────────────────────
export const backdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};
