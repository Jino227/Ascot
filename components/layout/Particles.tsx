"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface Particle {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  alpha: number;
  alphaSpeed: number;
  hue: number;
}

/**
 * Canvas-based gold-dust particle system.
 * Renders gently drifting, twinkling particles for a premium ambience.
 * Respects prefers-reduced-motion (renders nothing).
 */
export function Particles({
  className,
  count = 70,
  gold = true,
}: {
  className?: string;
  count?: number;
  gold?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current!;
    if (!canvasEl) return;
    const ctx = canvasEl.getContext("2d")!;
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    let particles: Particle[] = [];

    const palette = gold
      ? [
          { h: 42, s: 90, l: 62 },
          { h: 45, s: 85, l: 72 },
          { h: 38, s: 80, l: 55 },
          { h: 50, s: 75, l: 82 },
        ]
      : [
          { h: 210, s: 70, l: 70 },
          { h: 190, s: 60, l: 75 },
          { h: 230, s: 60, l: 65 },
        ];

    function resize() {
      const rect = canvasEl.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvasEl.width = w * dpr;
      canvasEl.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const desired = Math.min(count, Math.floor((w * h) / 16000));
      particles = Array.from({ length: Math.max(desired, 12) }, () => makeParticle(true));
    }

    function makeParticle(initial: boolean): Particle {
      const c = palette[Math.floor(Math.random() * palette.length)];
      return {
        x: Math.random() * w,
        y: initial ? Math.random() * h : h + 10,
        r: Math.random() * 1.8 + 0.4,
        vx: (Math.random() - 0.5) * 0.18,
        vy: -(Math.random() * 0.28 + 0.05),
        alpha: Math.random() * 0.6 + 0.1,
        alphaSpeed: Math.random() * 0.02 + 0.004,
        hue: c.h,
      };
    }

    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.alphaSpeed;
        if (p.alpha > 0.85 || p.alpha < 0.05) p.alphaSpeed *= -1;
        if (p.y < -12) particles[i] = makeParticle(false);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 68%, ${p.alpha})`;
        ctx.shadowColor = `hsla(${p.hue}, 95%, 70%, ${p.alpha * 0.9})`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      raf = requestAnimationFrame(tick);
    }

    resize();
    tick();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [count, gold]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    />
  );
}
