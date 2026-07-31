"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Glassmorphism floating card with a subtle idle float + entrance reveal.
 * Combines glass, blur, gradient gold edge and float animation for a premium look.
 */
export function FloatingGlass({
  children,
  className,
  delay = 0,
  float = "animate-float",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  float?: "animate-float" | "animate-float-slow" | "animate-float-reverse" | "none";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn("relative", float !== "none" && float, className)}
    >
      <div className="relative h-full overflow-hidden glass-gold rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.55)]">
        <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gold/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-gold-deep/15 blur-3xl" />
        {children}
      </div>
    </motion.div>
  );
}
