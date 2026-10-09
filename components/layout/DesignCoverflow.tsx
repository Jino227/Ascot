"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";

type CoverflowImage = { id?: string | number; url: string; alt?: string };

export function DesignCoverflow({
  images,
  onOpen,
  className = "",
}: {
  images: CoverflowImage[];
  onOpen: (url: string, index: number) => void;
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images.length) return null;

  const move = (direction: number) => {
    setActiveIndex((current) => (current + direction + images.length) % images.length);
  };

  return (
    <div className={`relative mx-auto w-full ${className}`}>
      <div className="relative flex h-[340px] items-center justify-center overflow-hidden sm:h-[430px] [perspective:1200px]">
        {images.map((image, index) => {
          let offset = index - activeIndex;
          if (offset > images.length / 2) offset -= images.length;
          if (offset < -images.length / 2) offset += images.length;
          const isVisible = Math.abs(offset) <= 2;

          return (
            <motion.button
              key={image.id ?? image.url ?? index}
              type="button"
              aria-label={offset === 0 ? `Open ${image.alt || "design"}` : `Show ${image.alt || "next design"}`}
              aria-hidden={!isVisible}
              tabIndex={isVisible ? 0 : -1}
              onClick={() => offset === 0 ? onOpen(image.url, index) : setActiveIndex(index)}
              className="absolute h-[280px] w-[min(72vw,340px)] overflow-hidden rounded-2xl border border-gold/30 bg-black shadow-[0_20px_65px_rgba(0,0,0,0.55)] outline-none transition-colors focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/70 sm:h-[370px] sm:w-[min(58vw,400px)]"
              initial={false}
              animate={isVisible ? {
                x: `${offset * 64}%`,
                scale: offset === 0 ? 1 : Math.max(0.72, 0.86 - Math.abs(offset) * 0.045),
                rotateY: offset * -32,
                opacity: offset === 0 ? 1 : 0.52 / Math.abs(offset),
                zIndex: 10 - Math.abs(offset),
              } : { opacity: 0, zIndex: -1 }}
              transition={isVisible
                ? { type: "spring", stiffness: 320, damping: 32, mass: 0.7 }
                : { duration: 0.12 }}
              style={{
                transformStyle: "preserve-3d",
                pointerEvents: isVisible ? "auto" : "none",
                willChange: isVisible ? "transform, opacity" : undefined,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.alt ?? "Ascotex Design"}
                className="h-full w-full object-contain"
                loading={Math.abs(offset) <= 1 ? "eager" : "lazy"}
                decoding="async"
              />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/90 via-black/35 to-transparent px-5 pb-4 pt-12 text-white">
                <span className="text-[10px] uppercase tracking-[0.28em] text-white/75">{String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
                {offset === 0 && <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gold"><Eye className="h-3.5 w-3.5" /> View design</span>}
              </span>
            </motion.button>
          );
        })}
      </div>

      {images.length > 1 && (
        <div className="mt-5 flex items-center justify-center gap-5">
          <button type="button" onClick={() => move(-1)} aria-label="Previous design" className="rounded-full border border-gold/30 p-2.5 text-gold transition-colors hover:bg-gold hover:text-black">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-14 text-center font-mono text-[10px] tracking-[0.2em] text-muted-foreground">{String(activeIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
          <button type="button" onClick={() => move(1)} aria-label="Next design" className="rounded-full border border-gold/30 p-2.5 text-gold transition-colors hover:bg-gold hover:text-black">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
