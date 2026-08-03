"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User as UserIcon, Shield, ArrowUpRight } from "lucide-react";
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
    const onScroll = () => setScrolled(window.scrollY > 15);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled || open
            ? "bg-black/95 backdrop-blur-2xl border-b border-gold/30 shadow-[0_10px_35px_rgba(0,0,0,0.9)] py-2"
            : "bg-black/80 backdrop-blur-xl border-b border-gold/20 shadow-[0_4px_20px_rgba(0,0,0,0.8)] py-2.5 sm:py-3"
        )}
      >
        <div className="container-x flex h-14 sm:h-20 items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" onClick={() => setOpen(false)} className="flex items-center group shrink-0 relative z-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Ascotex Fashions"
              className="h-9 sm:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation Pill Bar */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 bg-secondary/40 backdrop-blur-xl border border-gold/25 rounded-full px-4 py-1.5 shadow-inner">
            {nav.map((n) => {
              const active = path === n.href || (n.href !== "/" && path.startsWith(n.href));
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "relative text-[11px] uppercase tracking-[0.2em] font-medium transition-all px-4 py-1.5 rounded-full",
                    active
                      ? "text-gold font-semibold bg-gold/15 border border-gold/30 shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                      : "text-foreground/80 hover:text-gold hover:bg-gold/10"
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          {/* User / Admin Action Buttons */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {user ? (
              <>
                {isAdmin && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="rounded-full border-gold/40 text-gold hover:border-gold hover:bg-gold hover:text-black uppercase tracking-widest text-[10px] px-5 py-2.5 transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                  >
                    <Link href="/admin">
                      <Shield className="mr-1.5 h-3.5 w-3.5" /> Admin
                    </Link>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-muted-foreground hover:text-gold hover:bg-gold/10 text-[10px] uppercase tracking-widest px-4 transition-all"
                  onClick={() => supabase.auth.signOut()}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <Button
                asChild
                size="sm"
                className="rounded-full bg-accent text-accent-foreground hover:bg-gold hover:text-black uppercase tracking-[0.18em] text-[10px] px-6 py-2.5 transition-all shadow-[0_0_25px_rgba(212,175,55,0.35)]"
              >
                <Link href="/auth">
                  <UserIcon className="mr-1.5 h-3.5 w-3.5" /> Sign In
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="lg:hidden p-2 relative z-50 rounded-full border border-gold/40 bg-black/60 text-gold hover:bg-gold hover:text-black transition-all shadow-[0_0_15px_rgba(212,175,55,0.25)]"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu Overlay (Rendered outside header to prevent backdrop-filter containing block trap) */}
      <div
        className={cn(
          "fixed inset-0 z-40 flex flex-col bg-black/95 backdrop-blur-3xl transition-all duration-300 lg:hidden overflow-y-auto pt-24 sm:pt-28 pb-12 px-6 sm:px-12",
          open ? "pointer-events-auto opacity-100 scale-100" : "pointer-events-none opacity-0 scale-95"
        )}
      >
        <div className="flex flex-col w-full max-w-lg mx-auto space-y-2">
          {nav.map((n, i) => {
            const active = path === n.href || (n.href !== "/" && path.startsWith(n.href));
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "group flex items-center justify-between rounded-xl px-5 py-3.5 transition-all duration-300 border",
                  active
                    ? "bg-gold/15 border-gold/40 text-gold font-medium shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                    : "border-border/30 text-foreground/85 hover:text-gold hover:bg-gold/10 hover:border-gold/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-gold/60 uppercase tracking-widest">
                    0{i + 1}
                  </span>
                  <span className="font-display text-xl sm:text-2xl tracking-wide">
                    {n.label}
                  </span>
                </div>
                <ArrowUpRight
                  className={cn(
                    "h-4 w-4 transition-all duration-300",
                    active
                      ? "text-gold opacity-100 translate-x-0"
                      : "text-gold/50 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  )}
                />
              </Link>
            );
          })}

          <div className="pt-6 mt-4 border-t border-border/40">
            {user ? (
              <div className="flex flex-col gap-3">
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center gap-2 border border-gold/40 bg-gold/15 rounded-full px-6 py-4 text-xs uppercase tracking-[0.2em] text-gold font-medium shadow-[0_0_20px_rgba(212,175,55,0.25)]"
                  >
                    <Shield className="h-4 w-4" /> Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => { supabase.auth.signOut(); setOpen(false); }}
                  className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground py-3"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-gold bg-gold text-black font-semibold px-8 py-4 text-xs uppercase tracking-[0.2em] shadow-[0_0_25px_rgba(212,175,55,0.4)]"
              >
                <UserIcon className="h-4 w-4" /> Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
