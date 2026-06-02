"use client";

import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);
  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const visibleRef = useRef(false);
  const hoveringRef = useRef(false);

  useEffect(() => {
    // Only on devices with fine pointer (desktop)
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    document.body.classList.add("custom-cursor");
    let raf: number;
    let running = true;

    function updateLoop() {
      if (!running || document.hidden || !visibleRef.current) {
        raf = 0;
        return;
      }

      ring.current.x += (mouse.current.x - ring.current.x) * 0.15;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.15;

      if (ringRef.current) {
        const size = hoveringRef.current ? 25 : 18;
        ringRef.current.style.transform = `translate(${ring.current.x - size}px, ${ring.current.y - size}px)`;
      }

      raf = requestAnimationFrame(updateLoop);
    }

    function ensureLoop() {
      if (!raf && !document.hidden && visibleRef.current) {
        raf = requestAnimationFrame(updateLoop);
      }
    }

    function onMove(e: MouseEvent) {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (!visibleRef.current) {
        visibleRef.current = true;
        setVisible(true);
      }

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
      }

      ensureLoop();
    }

    function onLeave() {
      visibleRef.current = false;
      setVisible(false);
    }

    function onVisibilityChange() {
      if (document.hidden && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else {
        ensureLoop();
      }
    }

    function onOverInteractive(e: Event) {
      const el = e.target as HTMLElement;
      if (
        el.tagName === "A" || el.tagName === "BUTTON" ||
        el.closest("a") || el.closest("button") ||
        el.closest("[role='button']") ||
        el.classList.contains("cursor-pointer")
      ) {
        hoveringRef.current = true;
        setHovering(true);
      }
    }

    function onOutInteractive() {
      hoveringRef.current = false;
      setHovering(false);
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("mouseover", onOverInteractive);
    document.addEventListener("mouseout", onOutInteractive);

    return () => {
      running = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("mouseover", onOverInteractive);
      document.removeEventListener("mouseout", onOutInteractive);
      document.body.classList.remove("custom-cursor");
      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, []);

  // Don't render on non-desktop
  if (typeof window !== "undefined" && !window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    return null;
  }

  return (
    <>
      <div
        ref={dotRef}
        className={`cursor-dot ${!visible ? "opacity-0" : ""}`}
        style={{ opacity: visible ? 1 : 0 }}
      />
      <div
        ref={ringRef}
        className={`cursor-ring ${hovering ? "cursor-hover" : ""}`}
        style={{ opacity: visible ? 1 : 0 }}
      />
    </>
  );
}
