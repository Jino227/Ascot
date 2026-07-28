"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { getWebsiteContent } from "@/lib/actions";
import { ArrowUp } from "lucide-react";

const DEMO_FOOTER = {
  description: "Bespoke tailoring and ready-to-wear collections crafted on Savile Row since 1985. Every garment is made to measure, made to last, and made for you.",
  address: "152 Savile Row\nLondon, W1S 3NE",
  email: "hello@ascotfashions.com",
  phone: "+44 (0) 20 7946 0128",
  copyright: "Made to last.",
};

export function SiteFooter() {
  const { data } = useQuery({ queryKey: ["website_content"], queryFn: () => getWebsiteContent() });
  const footer = { ...DEMO_FOOTER, ...(data?.footer ?? {}) };
  const contact = data?.contact ?? {};
  const addr = footer.address || contact.address;
  const email = footer.email || contact.email;
  const phone = footer.phone || contact.phone;

  return (
    <footer className="border-t border-border/60 bg-background relative">
      <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="absolute -top-4 right-8 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:bg-accent/90 transition-colors shadow-sm">
        <ArrowUp className="h-4 w-4" />
      </button>
      <div className="container-x grid gap-12 py-16 md:grid-cols-4 md:py-20">
        <div className="md:col-span-2">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <Link href="/" className="font-display text-2xl tracking-tight">Ascot<span className="text-accent">·</span>Fashions</Link>
            {footer.description && <p className="mt-5 max-w-md text-sm text-muted-foreground leading-relaxed">{footer.description}</p>}
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Explore</div>
          <ul className="mt-5 space-y-3 text-sm">
            {[{ href: "/", label: "Home" }, { href: "/about", label: "About" }, { href: "/journey", label: "Our Journey" }, { href: "/collections", label: "Collections" }, { href: "/contact", label: "Contact" }].map((l) => (
              <li key={l.href}><Link href={l.href} className="text-muted-foreground hover:text-accent transition-colors">{l.label}</Link></li>
            ))}
          </ul>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Contact</div>
          <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
            {addr && <li className="whitespace-pre-line leading-relaxed">{addr}</li>}
            {email && <li className="hover:text-accent transition-colors"><a href={`mailto:${email}`}>{email}</a></li>}
            {phone && <li>{phone}</li>}
          </ul>
        </motion.div>
      </div>
      <div className="container-x flex flex-col justify-between gap-4 border-t border-border/60 py-6 text-xs text-muted-foreground md:flex-row">
        <div>© {new Date().getFullYear()} Ascot Fashions. All rights reserved.</div>
        {footer.copyright && <div className="italic">{footer.copyright}</div>}
      </div>
    </footer>
  );
}
