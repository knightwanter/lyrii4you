"use client";

import { useCallback, useState } from "react";
import { motion } from "@/lib/motion";
import { LandingIntro } from "@/components/landing/landing-intro";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Showcase } from "@/components/landing/showcase";
import { Community } from "@/components/landing/community";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export function LandingPageShell() {
  const [introComplete, setIntroComplete] = useState(false);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
  }, []);

  return (
    <main className="relative">
      {!introComplete && <LandingIntro onComplete={handleIntroComplete} />}

      <motion.div
        initial={{ opacity: 0 }}
        animate={introComplete ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <Navbar />
        <Hero />
        <Features />
        <Showcase />
        <Community />
        <CTA />
        <Footer />
      </motion.div>
    </main>
  );
}
