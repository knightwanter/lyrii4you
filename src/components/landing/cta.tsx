"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "@/lib/motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import { LogoIcon } from "@/components/logo";

export function CTA() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const rotateOrb = useTransform(scrollYProgress, [0, 1], [0, 180]);

  return (
    <section ref={containerRef} className="relative py-20 sm:py-32 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
          className="relative rounded-2xl sm:rounded-3xl border border-border bg-bg-card/40 backdrop-blur-sm p-8 sm:p-12 md:p-20 overflow-hidden"
        >
          {/* Animated background orbs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              style={{ rotate: rotateOrb }}
              className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-primary/[0.06] blur-[80px]"
            />
            <motion.div
              style={{ rotate: rotateOrb }}
              className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-accent/[0.06] blur-[80px]"
            />
          </div>

          {/* Morphing shape accent */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] opacity-[0.03] pointer-events-none">
            <div className="w-full h-full bg-gradient-to-br from-primary to-accent animate-[morph_8s_ease-in-out_infinite]" />
          </div>

          <div className="relative z-10">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mx-auto mb-8"
            >
              <LogoIcon size={56} />
            </motion.div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Your words are waiting
              <br />
              <span className="gradient-text">to be heard</span>
            </h2>
            <p className="text-base sm:text-lg text-text-secondary max-w-xl mx-auto mb-8 sm:mb-10 px-2">
              Start writing your first piece today — completely free.
              No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/signup">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" className="group text-base px-8 py-3.5 h-auto">
                    <span className="flex items-center gap-2">
                      Create Your Account
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </motion.div>
              </Link>
              <Link href="#features">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Button variant="secondary" size="lg" className="text-base px-8 py-3.5 h-auto">
                    See All Features
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
