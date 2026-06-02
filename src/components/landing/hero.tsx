"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "@/lib/motion";
import { ArrowRight, Feather, BookOpen, PenLine, Sparkles, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const floatingIcons = [
  { Icon: Feather, x: "8%", y: "18%", size: 20, delay: 0, dur: 7, rotate: 15 },
  { Icon: BookOpen, x: "88%", y: "22%", size: 18, delay: 1.5, dur: 8, rotate: -10 },
  { Icon: PenLine, x: "14%", y: "65%", size: 16, delay: 0.8, dur: 6, rotate: 20 },
  { Icon: Sparkles, x: "82%", y: "70%", size: 22, delay: 2, dur: 9, rotate: -15 },
  { Icon: Heart, x: "92%", y: "45%", size: 14, delay: 3, dur: 7.5, rotate: 12 },
  { Icon: Feather, x: "5%", y: "42%", size: 14, delay: 1, dur: 8.5, rotate: -20 },
  { Icon: Star, x: "75%", y: "15%", size: 16, delay: 0.5, dur: 7, rotate: 8 },
  { Icon: BookOpen, x: "20%", y: "80%", size: 15, delay: 2.5, dur: 9, rotate: -12 },
];

const particles = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  x: `${8 + Math.random() * 84}%`,
  y: `${8 + Math.random() * 84}%`,
  size: 1.5 + Math.random() * 2.5,
  delay: Math.random() * 5,
  dur: 4 + Math.random() * 6,
  opacity: 0.15 + Math.random() * 0.25,
}));

const orbitVariants = {
  animate: { rotate: 360, transition: { duration: 90, repeat: Infinity, ease: "linear" as const } },
};
const orbitReverseVariants = {
  animate: { rotate: -360, transition: { duration: 120, repeat: Infinity, ease: "linear" as const } },
};

const floatingWords = [
  { text: "poetry", x: "12%", y: "25%", delay: 0, dur: 20 },
  { text: "stories", x: "78%", y: "35%", delay: 3, dur: 18 },
  { text: "dreams", x: "65%", y: "75%", delay: 6, dur: 22 },
  { text: "verse", x: "25%", y: "70%", delay: 2, dur: 19 },
  { text: "words", x: "85%", y: "60%", delay: 8, dur: 21 },
];

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.6], [1, 0.95]);
  const ringScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.15]);

  return (
    <section ref={containerRef} className="relative min-h-[110vh] flex items-center justify-center overflow-hidden pt-16">

      {/* ============ LAYER 0: Deep ambient orbs ============ */}
      <motion.div style={{ y: y1 }} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-accent/[0.03] blur-[100px]" />
        <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] rounded-full bg-secondary/[0.03] blur-[80px]" />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[60%] left-[50%] w-[600px] h-[600px] -translate-x-1/2 rounded-full bg-primary/[0.04] blur-[150px]"
        />
      </motion.div>

      {/* ============ LAYER 1: Orbital rings ============ */}
      <motion.div
        style={{ scale: ringScale, opacity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      >
        <motion.div variants={orbitVariants} animate="animate" className="absolute -top-[280px] -left-[280px] w-[560px] h-[560px]">
          <div className="w-full h-full rounded-full border border-primary/[0.06]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary-light/30 shadow-[0_0_8px_rgba(167,139,250,0.4)]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-accent/30 shadow-[0_0_6px_rgba(236,72,153,0.3)]" />
        </motion.div>
        <motion.div variants={orbitReverseVariants} animate="animate" className="absolute -top-[200px] -left-[200px] w-[400px] h-[400px]">
          <div className="w-full h-full rounded-full border border-accent/[0.04]" style={{ borderStyle: "dashed" }} />
          <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary/40 shadow-[0_0_6px_rgba(139,92,246,0.3)]" />
        </motion.div>
        <motion.div variants={orbitVariants} animate="animate" className="absolute -top-[120px] -left-[120px] w-[240px] h-[240px]">
          <div className="w-full h-full rounded-full border border-secondary/[0.05]" />
          <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-secondary/50" />
        </motion.div>
      </motion.div>

      {/* ============ LAYER 2: Morphing shape ============ */}
      <motion.div style={{ y: y2, opacity }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-[500px] h-[500px] opacity-[0.025]">
          <div className="w-full h-full bg-gradient-to-br from-primary via-secondary to-accent animate-[morph_12s_ease-in-out_infinite]" />
        </div>
      </motion.div>

      {/* ============ LAYER 3: Floating particles ============ */}
      <motion.div style={{ y: y2 }} className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-primary-light"
            style={{ left: p.x, top: p.y, width: p.size, height: p.size, opacity: 0 }}
            animate={{ y: [-15, 15, -15], x: [-8, 8, -8], opacity: [0, p.opacity, 0] }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </motion.div>

      {/* ============ LAYER 3.5: Floating word fragments ============ */}
      <motion.div style={{ y: y2, opacity }} className="absolute inset-0 pointer-events-none hidden md:block">
        {floatingWords.map((word, i) => (
          <motion.span
            key={i}
            className="absolute text-xs font-serif italic text-primary-light/[0.08] select-none"
            style={{ left: word.x, top: word.y }}
            animate={{ y: [-20, 20, -20], x: [-10, 10, -10], opacity: [0, 0.08, 0] }}
            transition={{ duration: word.dur, delay: word.delay, repeat: Infinity, ease: "easeInOut" }}
          >
            {word.text}
          </motion.span>
        ))}
      </motion.div>

      {/* ============ LAYER 4: Floating icons ============ */}
      <motion.div style={{ y: y2, opacity }} className="absolute inset-0 pointer-events-none hidden lg:block">
        {floatingIcons.map((item, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: item.x, top: item.y }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5 + item.delay * 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              animate={{ y: [-12, 12, -12], rotate: [-item.rotate, item.rotate, -item.rotate] }}
              transition={{ duration: item.dur, delay: item.delay, repeat: Infinity, ease: "easeInOut" }}
              className="p-3 rounded-2xl border border-border/30 bg-bg-card/20 backdrop-blur-sm shadow-[0_0_20px_rgba(139,92,246,0.06)]"
            >
              <item.Icon size={item.size} className="text-primary-light/40" strokeWidth={1.5} />
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* ============ LAYER 5: Animated X cross-lines ============ */}
      <motion.div style={{ opacity }} className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 0.04 }}
          transition={{ delay: 2, duration: 2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-0 left-0 right-0 bottom-0 origin-top-left"
          style={{ background: "linear-gradient(135deg, transparent 48%, rgba(167,139,250,0.15) 49.5%, rgba(167,139,250,0.15) 50.5%, transparent 52%)" }}
        />
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 0.04 }}
          transition={{ delay: 2.3, duration: 2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-0 left-0 right-0 bottom-0 origin-top-right"
          style={{ background: "linear-gradient(-135deg, transparent 48%, rgba(236,72,153,0.12) 49.5%, rgba(236,72,153,0.12) 50.5%, transparent 52%)" }}
        />
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 0.03 }}
          transition={{ delay: 2.5, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-1/2 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-primary-light to-transparent origin-left"
        />
        <motion.div
          initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: 1, opacity: 0.03 }}
          transition={{ delay: 2.8, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-1/2 top-[15%] bottom-[15%] w-px bg-gradient-to-b from-transparent via-primary-light to-transparent origin-top"
        />
      </motion.div>

      {/* ============ LAYER 6: Shooting streaks ============ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute h-px w-32 bg-gradient-to-r from-transparent via-primary-light/30 to-transparent"
          style={{ top: "30%", left: "-10%" }}
          animate={{ x: ["0%", "1200%"], opacity: [0, 1, 0] }}
          transition={{ duration: 3, delay: 3, repeat: Infinity, repeatDelay: 8, ease: "linear" }}
        />
        <motion.div
          className="absolute h-px w-20 bg-gradient-to-r from-transparent via-accent/25 to-transparent"
          style={{ top: "65%", left: "-5%" }}
          animate={{ x: ["0%", "1400%"], opacity: [0, 1, 0] }}
          transition={{ duration: 2.5, delay: 7, repeat: Infinity, repeatDelay: 11, ease: "linear" }}
        />
        <motion.div
          className="absolute h-px w-24 bg-gradient-to-r from-transparent via-secondary/20 to-transparent"
          style={{ top: "48%", left: "-8%" }}
          animate={{ x: ["0%", "1300%"], opacity: [0, 0.8, 0] }}
          transition={{ duration: 2.8, delay: 12, repeat: Infinity, repeatDelay: 14, ease: "linear" }}
        />
        <motion.div
          className="absolute w-px h-20 bg-gradient-to-b from-transparent via-primary-light/20 to-transparent"
          style={{ left: "70%", top: "-5%" }}
          animate={{ y: ["0%", "1400%"], opacity: [0, 0.6, 0] }}
          transition={{ duration: 3.5, delay: 5, repeat: Infinity, repeatDelay: 10, ease: "linear" }}
        />
      </div>

      {/* ============ MAIN CONTENT ============ */}
      <motion.div
        style={{ opacity, scale }}
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center"
      >
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Main Heading with integrated caption */}
          <motion.div variants={itemVariants}>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-6">
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, y: 40, rotateX: 40 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                Write Your Story,
              </motion.span>
              <br />
              <motion.span
                className="inline-block text-shimmer"
                initial={{ opacity: 0, y: 40, rotateX: 40 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.9, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
              >
                Your Way
              </motion.span>
            </h1>
          </motion.div>

          {/* Caption — nestled between heading and subtitle as a poetic aside */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center gap-4 mb-6"
          >
            <motion.div
              className="h-px flex-1 max-w-16 bg-gradient-to-r from-transparent to-primary-light/30"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1, duration: 1 }}
            />
            <span className="text-sm sm:text-base font-serif italic text-primary-light/60">
              Because some stories deserve more than a caption
            </span>
            <motion.div
              className="h-px flex-1 max-w-16 bg-gradient-to-l from-transparent to-primary-light/30"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1, duration: 1 }}
            />
          </motion.div>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 sm:mb-12 leading-relaxed px-2"
          >
            A sanctuary for poets, storytellers, and dreamers. Write freely,
            find your audience, and watch your words come alive.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <Link href="/signup">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button size="lg" className="group relative overflow-hidden text-base px-8 py-3.5 h-auto">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Start Writing — It&apos;s Free
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </motion.div>
            </Link>
            <Link href="#features">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button variant="secondary" size="lg" className="text-base px-8 py-3.5 h-auto">
                  Explore Features
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-bg-root to-transparent pointer-events-none" />

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full border-2 border-text-muted/30 flex items-start justify-center p-1"
        >
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3], height: ["4px", "8px", "4px"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 rounded-full bg-primary-light/50"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
