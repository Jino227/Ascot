"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

/**
 * GSAP word-by-word reveal that clips each word up on scroll.
 * Usage: <TextReveal text="..." className="..."> or pass children string.
 */
export function TextReveal({
  text = "",
  className,
  as: Tag = "span",
  delay = 0,
}: {
  text?: string;
  className?: string;
  as?: "span" | "h1" | "h2" | "h3" | "p" | "div";
  delay?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = el.querySelectorAll<HTMLElement>("[data-word]");
    if (!words.length) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      el.style.opacity = "1";
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.1,
          ease: "power4.out",
          stagger: 0.06,
          delay,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [delay]);

  const TagAny = Tag as any;
  if (!text) return null;
  return (
    <TagAny ref={ref} className={cn(className)} aria-label={text}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-block">
        {text.split(" ").map((word, i) => (
          <span key={i} className="inline-block overflow-hidden align-bottom">
            <span data-word className="inline-block will-change-transform">
              {word}
              {i < text.split(" ").length - 1 ? "\u00A0" : ""}
            </span>
          </span>
        ))}
      </span>
    </TagAny>
  );
}
