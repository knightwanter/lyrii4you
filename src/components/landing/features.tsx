"use client";

import { useRef } from "react";
import { motion, useInView } from "@/lib/motion";
import {
  PenLine, Users, Lock, BarChart3,
  MessageCircle, Sparkles, Send, Waves,
  Heart, BookOpen, Trophy, Globe,
  Timer, Shuffle, BookMarked, Palette,
  type LucideIcon,
} from "lucide-react";

const features = [
  { icon: PenLine, title: "Rich Editor", desc: "Distraction-free writing with rich formatting, markdown support, and auto-save", gradient: "from-primary to-secondary" },
  { icon: Users, title: "Collaboration", desc: "Co-create with writers across the globe in real time with live cursors", gradient: "from-secondary to-primary" },
  { icon: Lock, title: "Encrypted DMs", desc: "End-to-end encrypted messaging — your words stay private always", gradient: "from-success to-secondary" },
  { icon: BarChart3, title: "Analytics", desc: "Track views, engagement, reading time, and your writing growth", gradient: "from-accent to-primary" },
  { icon: Waves, title: "Bottles", desc: "Cast words into the ocean for a stranger to find and cherish", gradient: "from-blue-500 to-primary" },
  { icon: Heart, title: "Secret Crush", desc: "Anonymous confessions — say what you can't say out loud", gradient: "from-accent to-pink-400" },
  { icon: Send, title: "Unsent Letters", desc: "Write letters you'll never send, but need to feel deep down", gradient: "from-primary to-accent" },
  { icon: Trophy, title: "Badges", desc: "Earn recognition as you grow your creative practice and reach milestones", gradient: "from-warning to-accent" },
  { icon: MessageCircle, title: "Whispers", desc: "Send anonymous reactions to pieces that moved you deeply", gradient: "from-secondary to-success" },
  { icon: BookOpen, title: "Collections", desc: "Curate your work into thematic collections and series", gradient: "from-primary to-blue-500" },
  { icon: Sparkles, title: "Writer DNA", desc: "AI-powered analysis of your unique writing style and voice", gradient: "from-primary to-accent" },
  { icon: Shuffle, title: "Verse Exchange", desc: "Write one stanza — a stranger completes the poem", gradient: "from-secondary to-success" },
  { icon: Timer, title: "Found Words", desc: "Timed creative prompts to spark spontaneous writing sessions", gradient: "from-accent to-primary" },
  { icon: BookMarked, title: "Journals", desc: "Private encrypted journals for your rawest, most honest thoughts", gradient: "from-success to-primary" },
  { icon: Globe, title: "Community", desc: "Find your tribe among poets, storytellers, and dreamers worldwide", gradient: "from-primary to-secondary" },
  { icon: Palette, title: "Mood Tags", desc: "Tag emotional tone and let readers discover what they feel", gradient: "from-accent to-secondary" },
];

// Split into two tracks
const trackA = features.slice(0, 8);
const trackB = features.slice(8, 16);

function MarqueeItem({ feature }: { feature: { icon: LucideIcon; title: string; desc: string; gradient: string } }) {
  const Icon = feature.icon;
  return (
    <div className="group relative flex items-center gap-3 px-5 py-3 rounded-2xl border border-border/40 bg-bg-card/30 backdrop-blur-sm hover:border-border-hover hover:bg-bg-card-hover/40 transition-all duration-300 flex-shrink-0 cursor-default">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
        <Icon size={18} className="text-white" />
      </div>
      <div className="min-w-0">
        <h4 className="font-semibold text-text-primary text-sm whitespace-nowrap group-hover:text-white transition-colors duration-300">
          {feature.title}
        </h4>
        <p className="text-xs text-text-muted whitespace-nowrap group-hover:text-text-secondary transition-colors duration-300">
          {feature.desc}
        </p>
      </div>
      {/* Hover glow */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500 pointer-events-none`} />
    </div>
  );
}

export function Features() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section
      id="features"
      ref={containerRef}
      className="relative py-24 md:py-44 overflow-hidden"
    >
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-primary/[0.03] blur-[180px]" />
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-16 md:mb-24 relative z-10">
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-sm font-medium text-primary-light uppercase tracking-widest mb-4"
          >
            Everything you need
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-5"
          >
            16 Features.{" "}
            <span className="gradient-text">One Platform.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-text-secondary text-base sm:text-lg max-w-lg mx-auto"
          >
            Every tool a writer needs — crafted with care, designed for depth.
          </motion.p>
        </div>
      </div>

      {/* ============ X-CROSSING MARQUEE TRACKS ============ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.4, duration: 1 }}
        className="relative z-10"
      >
        {/* Center glow at the X intersection */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-primary/[0.08] blur-[80px] pointer-events-none z-20" />

        {/* Track A — moves LEFT, angled top-left to bottom-right */}
        <div
          className="relative mb-6 overflow-hidden"
          style={{
            transform: "rotate(-4deg)",
            marginLeft: "-3%",
            marginRight: "-3%",
          }}
        >
          {/* Edge fades */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-bg-root to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-bg-root to-transparent z-10 pointer-events-none" />

          <div className="flex gap-4 animate-[marquee-left_60s_linear_infinite]">
            {/* Double the items for seamless loop */}
            {[...trackA, ...trackA].map((f, i) => (
              <MarqueeItem key={`a-${i}`} feature={f} />
            ))}
          </div>
        </div>

        {/* Track B — moves RIGHT, angled top-right to bottom-left */}
        <div
          className="relative overflow-hidden"
          style={{
            transform: "rotate(4deg)",
            marginLeft: "-3%",
            marginRight: "-3%",
          }}
        >
          {/* Edge fades */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-bg-root to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-bg-root to-transparent z-10 pointer-events-none" />

          <div className="flex gap-4 animate-[marquee-right_55s_linear_infinite]">
            {/* Double the items for seamless loop */}
            {[...trackB, ...trackB].map((f, i) => (
              <MarqueeItem key={`b-${i}`} feature={f} />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
