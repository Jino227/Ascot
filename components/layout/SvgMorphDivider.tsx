"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface SvgMorphDividerProps {
  className?: string;
}

export function SvgMorphDivider({ className = "" }: SvgMorphDividerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const gemRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!containerRef.current || !pathRef.current) return;

    const path = pathRef.current;
    const length = path.getTotalLength();

    // Set initial dasharray & dashoffset for drawing animation
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
      opacity: 0.3,
    });

    if (gemRef.current) {
      gsap.set(gemRef.current, { scale: 0, opacity: 0, transformOrigin: "center center" });
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 85%",
        end: "bottom 50%",
        scrub: 0.8,
      },
    });

    tl.to(path, {
      strokeDashoffset: 0,
      opacity: 0.9,
      ease: "power2.out",
    });

    if (gemRef.current) {
      tl.to(
        gemRef.current,
        {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          ease: "back.out(1.7)",
        },
        "-=0.2"
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === containerRef.current) {
          trigger.kill();
        }
      });
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full py-8 flex justify-center items-center overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 1200 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-5xl h-auto stroke-accent/40"
      >
        {/* Luxury Embroidery Flourish Path */}
        <path
          ref={pathRef}
          d="M0,60 C200,60 300,20 450,60 C550,86.6 570,35 600,35 C630,35 650,86.6 750,60 C900,20 1000,60 1200,60"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Central Luxury Crest Gem Accent */}
        <g ref={gemRef}>
          <polygon
            points="600,20 612,35 600,50 588,35"
            fill="currentColor"
            className="text-gold"
          />
          <circle cx="600" cy="35" r="2" fill="#FFFFFF" />
        </g>
      </svg>
    </div>
  );
}
