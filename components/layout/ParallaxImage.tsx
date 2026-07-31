"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

/**
 * GSAP parallax image. Wraps children (an <img>) and gently moves the
 * image inside its container as the user scrolls past it.
 */
export function ParallaxImage({
  children,
  className,
  speed = 12,
  scale = 1.15,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  scale?: number;
}) {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.set(inner, { scale });
      const tween = gsap.fromTo(
        inner,
        { yPercent: -speed },
        { yPercent: speed, ease: "none", scrollTrigger: { trigger: outer, start: "top bottom", end: "bottom top", scrub: true } }
      );
      return () => { tween.scrollTrigger?.kill(); tween.kill(); };
    }, outer);

    return () => ctx.revert();
  }, [speed, scale]);

  return (
    <div ref={outerRef} className={cn("overflow-hidden", className)}>
      <div ref={innerRef} className="h-[115%] w-full will-change-transform">
        {children}
      </div>
    </div>
  );
}
