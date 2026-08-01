"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Lock, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Particles } from "@/components/layout/Particles";
import { Tilt3DCard } from "@/components/layout/Tilt3DCard";
import { Magnetic } from "@/components/layout/Magnetic";

export default function RegisterPage() {
  useEffect(() => { document.title = "Register — Ascotex Fashions"; }, []);

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-background text-foreground px-5 pt-28 pb-16">
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute -top-32 right-1/4 h-[30rem] w-[30rem] rounded-full bg-gold/[0.09] blur-3xl animate-glow" />
        <div className="absolute -bottom-32 left-1/4 h-[30rem] w-[30rem] rounded-full bg-gold-deep/[0.08] blur-3xl animate-glow-slow" />
      </div>

      {/* Floating Gold Dust Particles */}
      <Particles count={65} className="opacity-60 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <Tilt3DCard maxTilt={5} scaleOnHover={1.01}>
          <div className="relative rounded-2xl border border-gold/40 bg-black/60 backdrop-blur-2xl p-8 sm:p-12 text-center shadow-2xl overflow-hidden">
            <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gold/15 blur-3xl" />

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 border border-gold/40 shadow-inner mb-4">
              <Lock className="h-6 w-6 text-gold" />
            </div>

            <div className="text-[10px] uppercase tracking-[0.25em] text-gold font-medium">Members Only</div>
            <h1 className="font-display text-3xl text-foreground mt-1">Access by Invitation</h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground font-light">
              Premium accounts are created and managed by the Ascotex team. Please contact us if you need access to a private collection.
            </p>

            <Magnetic className="mt-8 inline-block w-full">
              <Button asChild className="w-full rounded-none bg-accent text-accent-foreground hover:bg-accent/90 uppercase tracking-[0.2em] text-xs py-6 h-auto shadow-[0_0_30px_rgba(212,175,55,0.35)]">
                <Link href="/contact" className="group">
                  Contact the Ascotex team <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </Magnetic>

            <p className="mt-8 border-t border-border/40 pt-6 text-xs text-muted-foreground font-light">
              Already have an invitation?{" "}
              <Link href="/auth" className="text-gold hover:underline font-normal">
                Sign in to your account
              </Link>
            </p>
          </div>
        </Tilt3DCard>
      </motion.div>
    </div>
  );
}
