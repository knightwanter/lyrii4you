"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "@/lib/motion";
import {
  Lock, Waves, Heart, Sparkles,
  BarChart3, Shuffle, PenLine,
} from "lucide-react";

const showcaseItems = [
  {
    icon: PenLine,
    title: "Distraction-Free Editor",
    description: "Rich formatting, auto-save, word counts. Just you and your words.",
    gradient: "from-primary to-secondary",
    preview: (
      <div className="space-y-3 p-4">
        <div className="flex gap-2">
          {["B", "I", "U", "H1"].map((t) => (
            <div key={t} className="w-8 h-8 rounded-lg bg-bg-tertiary/80 flex items-center justify-center text-xs text-text-muted font-mono">{t}</div>
          ))}
        </div>
        <div className="h-2 w-3/4 bg-primary/20 rounded" />
        <div className="h-2 w-full bg-bg-tertiary rounded" />
        <div className="h-2 w-5/6 bg-bg-tertiary rounded" />
        <div className="h-2 w-2/3 bg-bg-tertiary rounded" />
        <div className="flex justify-between mt-4 text-xs text-text-muted">
          <span>247 words</span>
          <span>~2 min read</span>
        </div>
      </div>
    ),
  },
  {
    icon: BarChart3,
    title: "Growth Analytics",
    description: "Track views, engagement, writing habits. Know when your audience reads.",
    gradient: "from-accent to-primary",
    preview: (
      <div className="p-4">
        <div className="flex items-end gap-1.5 h-24 mb-2">
          {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 50, 75].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              whileInView={{ height: `${h}%` }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="flex-1 rounded-t bg-gradient-to-t from-primary/40 to-primary/80"
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-text-muted">
          <span>Mon</span><span>Sun</span>
        </div>
      </div>
    ),
  },
  {
    icon: Lock,
    title: "Encrypted Everything",
    description: "DMs, journals, private drafts. End-to-end encrypted. Your secrets stay yours.",
    gradient: "from-success to-secondary",
    preview: (
      <div className="p-4 space-y-3">
        {["Hey, I loved your poem...", "Thank you! It was about...", "I could tell. The imagery..."].map((msg, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
            <div className={`px-3 py-2 rounded-2xl text-xs max-w-[70%] ${i % 2 === 0 ? "bg-bg-tertiary text-text-secondary" : "bg-primary/20 text-primary-light"}`}>
              {msg}
            </div>
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs text-success justify-center pt-1">
          <Lock size={10} />
          <span>End-to-end encrypted</span>
        </div>
      </div>
    ),
  },
  {
    icon: Waves,
    title: "Message in a Bottle",
    description: "Cast your words into the ocean. A stranger catches them.",
    gradient: "from-blue-500 to-primary",
    preview: (
      <div className="p-4 text-center">
        <motion.div
          animate={{ rotate: [-5, 5, -5], y: [-3, 3, -3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="text-4xl mb-3"
        >
          🍾
        </motion.div>
        <p className="text-xs text-text-muted italic font-serif">
          &ldquo;I wonder if the stars remember the wishes we forgot&rdquo;
        </p>
        <div className="mt-3 text-xs text-primary-light">20-100 words per bottle</div>
      </div>
    ),
  },
  {
    icon: Heart,
    title: "Secret Crush Stories",
    description: "Anonymous confessions. Say what you can't say out loud.",
    gradient: "from-accent to-pink-400",
    preview: (
      <div className="p-4 text-center">
        <p className="text-sm font-serif italic text-text-secondary leading-relaxed mb-3">
          &ldquo;I write poems about you and post them as fiction. You&apos;ll never know they&apos;re all about the way you laugh.&rdquo;
        </p>
        <div className="flex justify-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1"><Heart size={10} className="text-accent" /> 42</span>
          <span>Anonymous</span>
        </div>
      </div>
    ),
  },
  {
    icon: Shuffle,
    title: "Verse Exchange",
    description: "Write the first stanza. A stranger writes the second. Poetry born between souls.",
    gradient: "from-secondary to-success",
    preview: (
      <div className="p-4 space-y-3">
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
          <p className="text-xs font-serif italic text-text-secondary">&ldquo;The rain speaks a language / only rooftops understand&rdquo;</p>
          <span className="text-[10px] text-text-muted mt-1 block">You wrote this</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-text-muted">
          <Shuffle size={12} />
          <span className="text-[10px]">waiting for a stranger...</span>
        </div>
      </div>
    ),
  },
  {
    icon: Sparkles,
    title: "Writer DNA",
    description: "AI-powered analysis. Discover your vocabulary richness, style, and emotional range.",
    gradient: "from-primary to-accent",
    preview: (
      <div className="p-4 space-y-2">
        {[
          { label: "Vocabulary", value: 82, color: "bg-primary" },
          { label: "Emotion", value: 91, color: "bg-accent" },
          { label: "Imagery", value: 76, color: "bg-secondary" },
        ].map((item) => (
          <div key={item.label}>
            <div className="flex justify-between text-xs text-text-muted mb-1">
              <span>{item.label}</span>
              <span>{item.value}%</span>
            </div>
            <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${item.value}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${item.color}`}
              />
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

// Top row: hero feature (editor) + 2 side features
const heroFeature = showcaseItems[0];
const topRow = [showcaseItems[1], showcaseItems[2]];
// Bottom 2x2 grid
const bottomGrid = showcaseItems.slice(3);

export function Showcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-80px" });
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section id="showcase" ref={containerRef} className="relative py-20 sm:py-32 px-4 sm:px-6 overflow-hidden">
      {/* Background parallax orb */}
      <motion.div
        style={{ y: bgY }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/[0.03] blur-[150px] pointer-events-none"
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5"
          >
            Built for <span className="gradient-text">Creative Souls</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-base sm:text-lg text-text-secondary max-w-xl mx-auto"
          >
            Every feature is designed to help you write, share, connect, and grow as a writer.
          </motion.p>
        </div>

        {/* ============ STRUCTURED GRID ============ */}

        {/* Hero feature — full width, prominent */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-5"
        >
          <div className="group relative grid md:grid-cols-2 gap-0 rounded-2xl border border-border/50 bg-bg-card/30 backdrop-blur-sm overflow-hidden hover:border-border-hover transition-colors duration-500">
            {/* Text */}
            <div className="p-8 md:p-10 flex flex-col justify-center">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${heroFeature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <heroFeature.icon size={20} className="text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-3">
                {heroFeature.title}
              </h3>
              <p className="text-sm sm:text-base text-text-muted leading-relaxed">
                {heroFeature.description}
              </p>
            </div>
            {/* Preview */}
            <div className="border-t md:border-t-0 md:border-l border-border/50 bg-bg-primary/40">
              {heroFeature.preview}
            </div>
            {/* Hover glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${heroFeature.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500 pointer-events-none rounded-2xl`} />
          </div>
        </motion.div>

        {/* Two-column row */}
        <div className="grid sm:grid-cols-2 gap-5 mb-5">
          {topRow.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="group relative rounded-2xl border border-border/50 bg-bg-card/30 backdrop-blur-sm overflow-hidden hover:border-border-hover transition-colors duration-500 h-full">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon size={18} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary mb-1">{item.title}</h3>
                      <p className="text-sm text-text-muted leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/30 bg-bg-primary/50 overflow-hidden">
                    {item.preview}
                  </div>
                </div>
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500 pointer-events-none rounded-2xl`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom grid — 2x2 on desktop, 1 col on mobile */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {bottomGrid.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 + i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="group relative rounded-2xl border border-border/50 bg-bg-card/30 backdrop-blur-sm overflow-hidden hover:border-border-hover transition-colors duration-500 h-full">
                <div className="p-5">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon size={18} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-text-primary text-sm mb-2">{item.title}</h3>
                  <p className="text-xs text-text-muted leading-relaxed mb-4">{item.description}</p>
                  <div className="rounded-xl border border-border/30 bg-bg-primary/50 overflow-hidden">
                    {item.preview}
                  </div>
                </div>
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500 pointer-events-none rounded-2xl`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
