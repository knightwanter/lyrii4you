// LazyMotion shim — re-exports framer-motion's tree-shakable `m` as `motion`
// so existing call sites (`motion.div`, `motion.button`, ...) keep working
// but only the DOM animation feature set is loaded into the bundle.
//
// The top-level <LazyMotion features={domAnimation}> lives in providers.tsx.
"use client";

export {
  m as motion,
  AnimatePresence,
  LazyMotion,
  domAnimation,
  useScroll,
  useTransform,
  useInView,
  useMotionValueEvent,
  useMotionValue,
  useSpring,
  useAnimation,
  useAnimationControls,
  useReducedMotion,
  type Variants,
  type Transition,
  type MotionProps,
} from "framer-motion";
