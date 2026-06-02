"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "@/lib/motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import { LogoIcon } from "@/components/logo";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#showcase", label: "Showcase" },
  { href: "#community", label: "Community" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 20);
    // Hide on scroll down, show on scroll up
    if (latest > lastScrollY.current && latest > 150) {
      setVisible(false);
    } else {
      setVisible(true);
    }
    lastScrollY.current = latest;
  });

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 sm:pt-5"
      >
        {/* Oval / Pill container */}
        <motion.div
          layout
          className={`
            relative flex items-center justify-between gap-2
            px-3 sm:px-5 py-2.5
            rounded-full
            transition-all duration-500 ease-out
            ${scrolled
              ? "w-full max-w-2xl bg-[rgba(8,4,18,0.72)] border border-[rgba(139,92,246,0.12)] shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(139,92,246,0.06),inset_0_1px_0_rgba(255,255,255,0.03)]"
              : "w-full max-w-3xl bg-[rgba(8,4,18,0.35)] border border-[rgba(139,92,246,0.06)]"
            }
          `}
          style={{
            backdropFilter: "blur(40px) saturate(1.6)",
            WebkitBackdropFilter: "blur(40px) saturate(1.6)",
          }}
        >
          {/* Glow border effect */}
          <div className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute inset-[-1px] rounded-full bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20" />
          </div>

          {/* Inner shine highlight */}
          <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent pointer-events-none" />

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group relative z-10 flex-shrink-0">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.15 }}
              transition={{ type: "spring", stiffness: 400, damping: 12 }}
            >
              <LogoIcon size={30} />
            </motion.div>
            <span className="text-lg font-bold gradient-text">Lyrii</span>
          </Link>

          {/* Desktop Nav Links — centered pills */}
          <div className="hidden md:flex items-center gap-1 relative z-10">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative px-4 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-all duration-200 rounded-full hover:bg-white/[0.04] group"
              >
                {link.label}
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-light opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2 relative z-10 flex-shrink-0">
            <Link href="/login">
              <button className="px-4 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors rounded-full hover:bg-white/[0.04]">
                Log in
              </button>
            </Link>
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium text-white rounded-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary shadow-[0_0_20px_rgba(139,92,246,0.25)] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all duration-300"
              >
                Start Writing
                <ArrowRight size={14} className="opacity-70" />
              </motion.button>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden relative z-10 p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-white/[0.06] transition-colors"
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <X size={18} />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Menu size={18} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </motion.div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-full mt-2 left-4 right-4 md:hidden rounded-2xl border border-[rgba(139,92,246,0.1)] overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
              style={{
                background: "rgba(8, 4, 18, 0.88)",
                backdropFilter: "blur(40px) saturate(1.6)",
                WebkitBackdropFilter: "blur(40px) saturate(1.6)",
              }}
            >
              <div className="p-4 space-y-1">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="block py-2.5 px-3 text-text-secondary hover:text-text-primary hover:bg-white/[0.04] rounded-xl transition-colors text-sm"
                  >
                    {link.label}
                  </motion.a>
                ))}
                <div className="pt-3 mt-2 border-t border-border/50 flex flex-col gap-2">
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="secondary" className="w-full" size="sm">Log in</Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full" size="sm">Start Writing</Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
