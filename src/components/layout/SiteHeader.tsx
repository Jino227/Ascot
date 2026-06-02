import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/collections", label: "Collections" },
  { to: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const { user } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="container-x flex h-16 items-center justify-between md:h-20">
        <Link to="/" className="font-display text-xl tracking-tight md:text-2xl" onClick={() => setOpen(false)}>
          Maison<span className="text-accent">·</span>Loom
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`text-sm tracking-wide uppercase transition-colors hover:text-foreground ${
                path === n.to ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link to="/private-collections" className="text-sm text-muted-foreground hover:text-foreground">
                Members
              </Link>
              <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">
                Admin
              </Link>
              <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>
                Sign out
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="rounded-none">
              <Link to="/auth"><UserIcon className="mr-2 h-4 w-4" />Sign in</Link>
            </Button>
          )}
        </div>

        <button
          className="md:hidden p-2 -mr-2"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/60 bg-background">
          <div className="container-x flex flex-col py-4">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-3 text-sm uppercase tracking-wide"
              >
                {n.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/private-collections" onClick={() => setOpen(false)} className="py-3 text-sm uppercase tracking-wide">
                  Members
                </Link>
                <Link to="/admin" onClick={() => setOpen(false)} className="py-3 text-sm uppercase tracking-wide">
                  Admin
                </Link>
                <button onClick={() => supabase.auth.signOut()} className="py-3 text-left text-sm uppercase tracking-wide">
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="py-3 text-sm uppercase tracking-wide">
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
