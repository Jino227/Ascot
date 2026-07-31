"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User as UserIcon, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/journey", label: "Our Journey" },
  { href: "/designs", label: "Designs" },
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

  const onDarkHero = path === "/" && !scrolled && !open;

  return (
    <header className={cn(
      "fixed inset-x-0 top-0 z-40 transition-all duration-500",
      scrolled || open
        ? "bg-background/85 backdrop-blur-xl border-b border-border/60 shadow-[0_1px_0_0_rgba(0,0,0,0.03)]"
        : "bg-transparent border-b border-transparent"
    )}>
      <div className="container-x flex h-16 items-center justify-between md:h-20">
        <Link href="/" onClick={() => setOpen(false)}
          className={cn("font-display text-xl tracking-tight transition-colors duration-500 md:text-2xl", onDarkHero ? "text-foreground" : "text-foreground")}>
          Ascot<span className="text-accent">·</span>Fashions
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href}
              className={cn(
                "underline-anim text-xs uppercase tracking-[0.18em] transition-colors",
                path === n.href
                  ? cn("active", onDarkHero ? "text-foreground" : "text-foreground")
                  : onDarkHero ? "text-foreground/70 hover:text-foreground" : "text-muted-foreground hover:text-foreground"
              )}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              {isAdmin && <Link href="/admin" className={cn("text-xs uppercase tracking-[0.15em] transition-colors", onDarkHero ? "text-foreground/70 hover:text-foreground" : "text-muted-foreground hover:text-accent")}>Admin</Link>}
              <Button variant="outline" size="sm" className={cn("rounded-none transition-colors", onDarkHero ? "border-foreground/30 text-foreground hover:border-foreground/60 hover:text-foreground" : "hover:border-accent hover:text-accent")} onClick={() => supabase.auth.signOut()}>Sign out</Button>
            </>
          ) : (
            <Button asChild size="sm" className="rounded-none bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/auth"><UserIcon className="mr-1.5 h-4 w-4" />Sign in</Link>
            </Button>
          )}
        </div>

        <button className="md:hidden p-2 -mr-2 relative z-50" aria-label="Toggle menu" onClick={() => setOpen((v) => !v)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div className={cn(
        "fixed inset-0 z-40 flex flex-col bg-background transition-all duration-500 md:hidden",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}>
        <div className="flex flex-1 flex-col justify-center gap-2 px-8 pt-24">
          {nav.map((n, i) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
              className="group flex items-center justify-between border-b border-border/50 py-5">
              <span className="font-display text-4xl tracking-tight">{n.label}</span>
              <ArrowUpRight className="h-6 w-6 text-accent opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          ))}
          <div className="mt-10">
            {user ? (
              <div className="flex flex-col gap-4">
                {isAdmin && <Link href="/admin" onClick={() => setOpen(false)} className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Admin Dashboard</Link>}
                <button onClick={() => supabase.auth.signOut()} className="text-left text-sm uppercase tracking-[0.2em] text-muted-foreground">Sign out</button>
              </div>
            ) : (
              <Link href="/auth" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 border border-accent px-8 py-4 text-sm uppercase tracking-[0.2em] text-accent">
                <UserIcon className="h-4 w-4" /> Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
