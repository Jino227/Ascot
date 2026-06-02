import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border/60 bg-background">
      <div className="container-x grid gap-12 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-display text-2xl">Maison·Loom</div>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            Heritage textile manufacturing for fashion houses, interior designers,
            and discerning brands. Crafted in our vertically integrated mills since 1962.
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Explore</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/collections" className="hover:text-accent">Collections</Link></li>
            <li><Link to="/about" className="hover:text-accent">The Atelier</Link></li>
            <li><Link to="/contact" className="hover:text-accent">Contact</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Atelier</div>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>152 Linen Street</li>
            <li>New York, NY 10013</li>
            <li>atelier@example.com</li>
          </ul>
        </div>
      </div>
      <div className="container-x flex flex-col justify-between gap-4 border-t border-border/60 py-6 text-xs text-muted-foreground md:flex-row">
        <div>© {new Date().getFullYear()} Maison·Loom. All rights reserved.</div>
        <div>Woven in good faith.</div>
      </div>
    </footer>
  );
}
