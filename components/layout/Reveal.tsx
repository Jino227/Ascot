"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right" | "fade";

const offsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 40 },
  down: { x: 0, y: -40 },
  left: { x: 48, y: 0 },
  right: { x: -48, y: 0 },
  fade: { x: 0, y: 0 },
};

export function Reveal({
  children,
  delay = 0,
  className,
  direction = "up",
  duration = 0.9,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: Direction;
  duration?: number;
  once?: boolean;
}) {
  const off = offsets[direction];
  const variants: Variants = {
    hidden: { opacity: 0, x: off.x, y: off.y },
    visible: { opacity: 1, x: 0, y: 0, transition: { duration, ease: [0.22, 1, 0.36, 1] } },
  };
  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-80px" }}
      variants={variants}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
