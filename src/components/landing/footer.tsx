"use client";

import Link from "next/link";
import { LogoIcon } from "@/components/logo";

const links = {
  Platform: [
    { href: "#features", label: "Features" },
    { href: "/feed", label: "Explore" },
    { href: "/write", label: "Write" },
  ],
  Features: [
    { href: "/bottles", label: "Bottles" },
    { href: "/whispers", label: "Whispers" },
    { href: "/verse-exchange", label: "Verse Exchange" },
    { href: "/secret-crush", label: "Secret Crush" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/contact", label: "Contact" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-primary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <LogoIcon size={36} />
              <span className="text-lg font-bold gradient-text">Lyrii</span>
            </Link>
            <p className="text-sm text-text-muted leading-relaxed mb-4">
              Because some stories deserve more than a caption.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-text-primary mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-text-muted hover:text-primary-light transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Lyrii. All rights reserved.
          </p>
          <p className="text-xs text-text-muted/60">
            Made with love for writers everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}
