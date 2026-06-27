"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/actions";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const { user } = useAuth();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const { data: adminData } = useQuery({
    queryKey: ["isAdmin", user?.id],
    queryFn: () => checkIsAdmin(user!.id),
    enabled: !!user,
  });
  const isAdmin = adminData?.isAdmin ?? false;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="container-x flex h-16 items-center justify-between md:h-20">
        <Link href="/" className="font-display text-xl tracking-tight md:text-2xl" onClick={() => setOpen(false)}>
          Ascot<span className="text-accent">·</span>Fashions
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href}
              className={`text-sm tracking-wide uppercase transition-colors hover:text-foreground ${path === n.href ? "text-foreground" : "text-muted-foreground"}`}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link href="/private-collections" className="text-sm text-muted-foreground hover:text-foreground">Members</Link>
              {isAdmin && <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">Admin</Link>}
              <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>Sign out</Button>
            </>
          ) : (
            <Button asChild size="sm" className="rounded-none">
              <Link href="/auth"><UserIcon className="mr-2 h-4 w-4" />Sign in</Link>
            </Button>
          )}
        </div>

        <button className="md:hidden p-2 -mr-2" aria-label="Toggle menu" onClick={() => setOpen((v) => !v)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/60 bg-background">
          <div className="container-x flex flex-col py-4">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="py-3 text-sm uppercase tracking-wide">{n.label}</Link>
            ))}
            {user ? (
              <>
                <Link href="/private-collections" onClick={() => setOpen(false)} className="py-3 text-sm uppercase tracking-wide">Members</Link>
                {isAdmin && <Link href="/admin" onClick={() => setOpen(false)} className="py-3 text-sm uppercase tracking-wide">Admin</Link>}
                <button onClick={() => supabase.auth.signOut()} className="py-3 text-left text-sm uppercase tracking-wide">Sign out</button>
              </>
            ) : (
              <Link href="/auth" onClick={() => setOpen(false)} className="py-3 text-sm uppercase tracking-wide">Sign in</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
