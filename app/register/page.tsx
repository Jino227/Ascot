"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function RegisterPage() {
  useEffect(() => { document.title = "Register — Ascot Fashions"; }, []);

  return (
    <div className="container-x grid min-h-[calc(100vh-5rem)] place-items-center py-16">
      <div className="w-full max-w-md border border-border/60 bg-card p-8">
        <h1 className="font-display text-3xl">Access by invitation</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Premium accounts are created and managed by the Ascot team. Please contact us if you need access to a private collection.</p>
        <Link href="/contact" className="mt-8 block text-center text-sm text-accent hover:underline">Contact the Ascot team</Link>
        <p className="mt-6 text-center text-xs text-muted-foreground"><Link href="/auth" className="text-accent hover:underline">Sign in with your invitation</Link></p>
      </div>
    </div>
  );
}
