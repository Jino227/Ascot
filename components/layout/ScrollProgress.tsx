"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Thin gold progress line fixed at the very top of the viewport
 * that scales with page scroll (GSAP-driven, progress = scrollX).
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        bar,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: document.documentElement,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.4,
          },
        }
      );
    }, bar);

    return () => ctx.revert();
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]">
      <div
        ref={barRef}
        className="h-full w-full origin-left bg-gradient-to-r from-gold-deep via-gold to-champagne shadow-[0_0_12px_rgba(212,175,55,0.6)]"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
