"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Magnetic hover wrapper — the child gently follows the cursor
 * and springs back on leave. Great for premium CTA buttons.
 */
export function Magnetic({
  children,
  className,
  strength = 0.35,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 160, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 160, damping: 16, mass: 0.4 });

  function onMove(e: MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    x.set(dx * strength);
    y.set(dy * strength);
  }
  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      className={cn("inline-block", className)}
    >
      {children}
    </motion.div>
  );
}
