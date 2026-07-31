"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Lock, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  useEffect(() => { document.title = "Register — Ascot Fashions"; }, []);

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-5 pt-24 pb-16">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-accent/[0.06] blur-3xl" />
      </div>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-md">
        <div className="relative border border-border/60 bg-card p-8 text-center">
          <div className="absolute top-0 left-0 h-1 w-16 bg-accent" />
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
            <Lock className="h-6 w-6 text-accent" />
          </div>
          <h1 className="mt-5 font-display text-3xl">Access by invitation</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Premium accounts are created and managed by the Ascot team. Please contact us if you need access to a private collection.</p>
          <Link href="/contact" className="group mt-8 inline-flex items-center gap-2 text-sm text-accent">
            Contact the Ascot team <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="mt-8 border-t border-border/50 pt-6 text-xs text-muted-foreground"><Link href="/auth" className="text-accent hover:underline">Sign in with your invitation</Link></p>
        </div>
      </motion.div>
    </div>
  );
}
