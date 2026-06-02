"use client";

import { motion } from "@/lib/motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Soon",
    role: "",
    avatar: "",
    quote: "",
    gradient: "from-primary to-secondary",
  },
  {
    name: "Soon",
    role: "",
    avatar: "",
    quote: "",
    gradient: "from-accent to-primary",
  },
  {
    name: "Soon",
    role: "",
    avatar: "",
    quote: "",
    gradient: "from-secondary to-success",
  },
  {
    name: "Soon",
    role: "",
    avatar: "",
    quote: "",
    gradient: "from-blue-500 to-primary",
  },
];

const samplePosts = [
  {
    type: "poem",
    title: "3 AM Conversations With The Moon",
    excerpt: "She tells me things the sun would never understand — about shadows that have loved, and light that left too soon.",
    author: "Lyrii",
    mood: "melancholy",
    rating: 4.8,
  },
  {
    type: "micro_tale",
    title: "The Last Bookstore",
    excerpt: "He returned every book she'd ever recommended. She understood the breakup then.",
    author: "Lyrii",
    mood: "longing",
    rating: 4.9,
  },
  {
    type: "story",
    title: "Letters From Platform 7",
    excerpt: "Every Tuesday at 8:14, she'd press a folded note into the hand of the stranger in the grey coat. He never opened them. Until the last one.",
    author: "Lyrii",
    mood: "hope",
    rating: 4.7,
  },
];

export function Community() {
  return (
    <section id="community" className="relative py-20 sm:py-32 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-medium text-primary-light uppercase tracking-widest mb-4"
          >
            From the community
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6"
          >
            Words That <span className="gradient-text">Move People</span>
          </motion.h2>
        </div>

        {/* Sample Posts — Live Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 mb-16 sm:mb-24">
          {samplePosts.map((post, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
              className="group rounded-2xl border border-border bg-bg-card/40 backdrop-blur-sm p-6 hover:border-border-hover hover-lift transition-all duration-500"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary-light border border-primary/20 capitalize">
                  {post.type.replace("_", " ")}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-bg-tertiary text-text-muted capitalize">
                  {post.mood}
                </span>
              </div>
              <h3 className="font-semibold text-text-primary mb-3 group-hover:text-primary-light transition-colors">
                {post.title}
              </h3>
              <p className="text-sm text-text-muted leading-relaxed font-serif italic mb-4">
                &ldquo;{post.excerpt}&rdquo;
              </p>
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>@{post.author}</span>
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-warning fill-warning" />
                  <span>{post.rating}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
              className="rounded-2xl border border-border bg-bg-card/30 backdrop-blur-sm p-6 hover:border-border-hover transition-colors duration-300"
            >
              <Quote size={20} className="text-primary-light/30 mb-4" />
              <p className="text-text-secondary leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-sm font-bold`}>
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-text-primary">{t.name}</div>
                  <div className="text-xs text-text-muted">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
