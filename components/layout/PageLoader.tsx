"use client";

import { motion } from "motion/react";

export function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <motion.div
        animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-t-2 border-gold rounded-full animate-spin" style={{ animationDuration: "1.5s" }} />
          <div className="absolute inset-2 border-r-2 border-gold/50 rounded-full animate-spin" style={{ animationDuration: "2s", animationDirection: "reverse" }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Ascotex" className="absolute inset-0 m-auto h-8 object-contain" style={{ mixBlendMode: "screen" }} />
        </div>
        <div className="text-[10px] uppercase tracking-[0.4em] text-gold/70 font-light">Loading Atelier</div>
      </motion.div>
    </div>
  );
}
