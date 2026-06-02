"use client";

import { useEffect, useState } from "react";
import { Monitor, X } from "lucide-react";
import { motion, AnimatePresence } from "@/lib/motion";

const STORAGE_KEY = "lyrii_mobile_notice_dismissed";

export function MobileNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Only show on mobile widths, and only once per session
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    if (window.matchMedia("(min-width: 768px)").matches) return;

    // Small delay so it doesn't fight with initial page paint
    const t = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    setOpen(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // sessionStorage unavailable — ignore
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm md:hidden"
          onClick={dismiss}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-notice-title"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
            className="relative w-full max-w-md m-4 rounded-2xl border border-border bg-bg-card p-6 pr-12 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={dismiss}
              aria-label="Close"
              className="absolute top-3 right-3 p-2 rounded-full text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary/15 text-primary-light flex items-center justify-center">
                <Monitor size={22} />
              </div>
              <div className="min-w-0">
                <h2
                  id="mobile-notice-title"
                  className="text-base font-semibold text-text-primary mb-1"
                >
                  Better on a bigger screen
                </h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Use a laptop or computer browser to enjoy the full Lyrii
                  experience.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={dismiss}
              className="mt-5 w-full rounded-xl bg-primary text-white text-sm font-medium py-2.5 hover:bg-primary/90 transition-colors"
            >
              Continue on mobile
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
