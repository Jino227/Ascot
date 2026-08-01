"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User as UserIcon, ArrowUpRight, Shield, Crown } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Home" },
  { href: "/#our-story", label: "Our Story" },
  { href: "/about", label: "About" },
  { href: "/journey", label: "Our Journey" },
  { href: "/designs", label: "Designs" },
  { href: "/celebrities", label: "Celebrities" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const { user } = useAuth();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: adminData } = useQuery({
    queryKey: ["isAdmin", user?.id],
    queryFn: () => checkIsAdmin(user!.id),
    enabled: !!user,
  });
  const isAdmin = adminData?.isAdmin ?? false;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className={cn(
      "fixed inset-x-0 top-0 z-50 transition-all duration-500",
      scrolled || open
        ? "bg-black/85 backdrop-blur-xl border-b border-gold/25 shadow-[0_10px_30px_rgba(0,0,0,0.8)] py-1"
        : "bg-gradient-to-b from-black/80 via-black/40 to-transparent border-b border-transparent py-2"
    )}>
      <div className="container-x flex h-20 items-center justify-between">
        {/* Brand Logo with Official Needle Emblem */}
        <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3 group shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Ascotex Fashions"
            className="h-12 sm:h-14 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
            style={{ mixBlendMode: "screen" }}
          />
        </Link>

        {/* Desktop Navigation Menu */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {nav.map((n) => {
            const active = path === n.href || (n.href !== "/" && path.startsWith(n.href));
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "relative text-[11px] uppercase tracking-[0.2em] font-medium transition-all py-1",
                  active
                    ? "text-gold font-semibold"
                    : "text-foreground/75 hover:text-gold"
                )}
              >
                {n.label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold shadow-[0_0_8px_#D4AF37]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User / Admin Action Buttons */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {user ? (
            <>
              {isAdmin && (
                <Button asChild variant="outline" size="sm" className="rounded-none border-gold/40 text-gold hover:bg-gold/10 uppercase tracking-widest text-[10px]">
                  <Link href="/admin">
                    <Shield className="mr-1.5 h-3.5 w-3.5" /> Admin
                  </Link>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="rounded-none text-muted-foreground hover:text-foreground text-[10px] uppercase tracking-widest"
                onClick={() => supabase.auth.signOut()}
              >
                Sign out
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="rounded-none bg-accent text-accent-foreground hover:bg-accent/90 uppercase tracking-[0.18em] text-[10px] px-5 py-4 h-auto shadow-[0_0_20px_rgba(212,175,55,0.25)]">
              <Link href="/auth">
                <UserIcon className="mr-1.5 h-3.5 w-3.5" /> Sign In
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="lg:hidden p-2.5 -mr-2 relative z-50 rounded-lg border border-gold/30 bg-black/50 text-gold"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <div className={cn(
        "fixed inset-0 z-40 flex flex-col bg-black/95 backdrop-blur-2xl transition-all duration-500 lg:hidden",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}>
        <div className="flex flex-1 flex-col justify-center gap-1 px-8 pt-24 pb-12 overflow-y-auto">
          <div className="flex items-center justify-center mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Ascotex Fashions" className="h-16 w-auto object-contain" style={{ mixBlendMode: "screen" }} />
          </div>

          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="group flex items-center justify-between border-b border-border/40 py-4"
            >
              <span className="font-display text-3xl tracking-tight text-foreground group-hover:text-gold transition-colors">
                {n.label}
              </span>
              <ArrowUpRight className="h-5 w-5 text-gold opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          ))}

          <div className="mt-8 pt-4">
            {user ? (
              <div className="flex flex-col gap-3">
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center gap-2 border border-gold/40 bg-gold/10 px-6 py-3 text-xs uppercase tracking-[0.2em] text-gold"
                  >
                    <Shield className="h-4 w-4" /> Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => { supabase.auth.signOut(); setOpen(false); }}
                  className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground py-2"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-2 border border-gold bg-gold text-black font-semibold px-8 py-4 text-xs uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(212,175,55,0.4)]"
              >
                <UserIcon className="h-4 w-4" /> Sign in to Account
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
