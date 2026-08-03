"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { checkIsAdmin } from "@/lib/actions";
import { Shield, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { Particles } from "@/components/layout/Particles";
import { SvgMorphDivider } from "@/components/layout/SvgMorphDivider";

const tabs = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/designs", label: "Designs" },
  { href: "/admin/journey", label: "Journey" },
  { href: "/admin/celebrities", label: "Celebrities" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/inquiries", label: "Inquiries" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const path = usePathname();
  useEffect(() => { document.title = "Admin — Ascotex Fashions"; }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["isAdmin", user?.id],
    queryFn: () => checkIsAdmin(user!.id),
    enabled: !!user,
  });

  if (authLoading || (isLoading && !data)) {
    return (
      <div className="relative min-h-screen bg-background text-foreground flex items-center justify-center">
        <Particles count={30} className="opacity-40 pointer-events-none" />
        <div className="text-sm font-light text-muted-foreground animate-pulse flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gold animate-spin" /> Verifying Admin Permissions…
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="relative min-h-screen bg-background text-foreground flex items-center justify-center px-5">
        <Particles count={30} className="opacity-40 pointer-events-none" />
        <div className="max-w-md w-full text-center rounded-2xl border border-gold/30 bg-black/40 backdrop-blur-xl p-8 shadow-2xl">
          <Shield className="h-10 w-10 text-gold mx-auto mb-4" />
          <h1 className="font-display text-4xl text-foreground">Sign In Required</h1>
          <p className="mt-4 text-sm text-muted-foreground font-light">
            <Link href="/auth" className="text-gold underline underline-offset-4 font-normal hover:text-gold/80">Sign in</Link> to access administrative tools.
          </p>
        </div>
      </div>
    );
  }
  
  if (!data?.isAdmin) {
    return (
      <div className="relative min-h-screen bg-background text-foreground flex items-center justify-center px-5">
        <Particles count={30} className="opacity-40 pointer-events-none" />
        <div className="max-w-md w-full text-center rounded-2xl border border-destructive/40 bg-black/40 backdrop-blur-xl p-8 shadow-2xl">
          <Shield className="h-10 w-10 text-destructive mx-auto mb-4" />
          <h1 className="font-display text-4xl text-foreground">Admin Access Required</h1>
          <p className="mt-4 text-sm text-muted-foreground font-light">Your account does not have admin privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden pt-32 pb-20">
      {/* Ambient background glows */}
      <div className="absolute top-24 left-12 w-[28rem] h-[28rem] bg-gold/[0.07] rounded-full blur-3xl pointer-events-none animate-glow" />
      <div className="absolute bottom-24 right-12 w-[24rem] h-[24rem] bg-gold-deep/[0.06] rounded-full blur-3xl pointer-events-none animate-glow-slow" />

      {/* Floating Gold Particles Canvas */}
      <Particles count={50} className="opacity-60 pointer-events-none" />

      <div className="container-x relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div>
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-gold font-medium">
              <Shield className="h-3.5 w-3.5 text-gold" /> Admin Console
            </span>
            <div className="font-script text-2xl md:text-3xl text-champagne/90 italic mt-1">Ascotex Atelier Management</div>
            <h1 className="font-display text-4xl md:text-5xl mt-1 text-foreground">Management Portal</h1>
          </div>
        </div>

        {/* Luxury Glass Tab Navigation Bar */}
        <div className="mt-8 rounded-xl border border-gold/30 bg-black/40 backdrop-blur-xl p-1.5 shadow-xl overflow-x-auto">
          <nav className="flex items-center gap-1 min-w-max">
            {tabs.map((t) => {
              const active = path === t.href || (t.href !== "/admin" && path.startsWith(t.href));
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`relative px-5 py-3 text-xs uppercase tracking-[0.2em] transition-all rounded-lg ${
                    active ? "text-gold font-semibold bg-gold/10" : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                  }`}
                >
                  {t.label}
                  {active && (
                    <motion.div
                      layoutId="adminTabIndicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-gold shadow-[0_0_10px_#D4AF37]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Morphing SVG Divider */}
        <SvgMorphDivider className="py-6" />

        {/* Content Children Container */}
        <main className="relative z-10">{children}</main>
      </div>
    </div>
  );
}
