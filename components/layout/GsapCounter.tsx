"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * GSAP animated number counter. Renders a span that counts from 0 up to
 * `value` (which may contain commas, "+" or "%" suffixes) as it scrolls
 * into view.
 */
export function GsapCounter({
  value,
  className,
  duration = 2,
}: {
  value: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const numeric = parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
    const suffix = value.replace(/[0-9.,]/g, "");
    const hasDecimal = value.includes(".");

    if (prefersReduced) {
      el.textContent = value;
      return;
    }

    const obj = { v: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        v: numeric,
        duration,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
        onUpdate: () => {
          el.textContent = (hasDecimal ? obj.v.toFixed(1) : Math.round(obj.v).toLocaleString("en-US")) + suffix;
        },
        onComplete: () => {
          el.textContent = value;
        },
      });
    }, el);

    return () => ctx.revert();
  }, [value, duration]);

  return <span ref={ref} className={className}>{value}</span>;
}
