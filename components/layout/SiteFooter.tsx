"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { getWebsiteContent } from "@/lib/actions";
import { ArrowUp, ArrowUpRight } from "lucide-react";

const DEMO_FOOTER = {
  description: "Bespoke tailoring and ready-to-wear collections crafted on Savile Row since 1985. Every garment is made to measure, made to last, and made for you.",
  address: "152 Savile Row\nLondon, W1S 3NE",
  email: "hello@ascotexfashions.com",
  phone: "+44 (0) 20 7946 0128",
  copyright: "Made to last.",
};

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/journey", label: "Our Journey" },
  { href: "/designs", label: "Designs" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  const { data } = useQuery({ queryKey: ["website_content"], queryFn: () => getWebsiteContent() });
  const footer = { ...DEMO_FOOTER, ...(data?.footer ?? {}) };
  const contact = data?.contact ?? {};
  const addr = footer.address || contact.address;
  const email = footer.email || contact.email;
  const phone = footer.phone || contact.phone;

  return (
    <footer className="relative border-t border-gold/15 bg-background overflow-hidden">
      {/* Giant watermark word */}
      <div className="pointer-events-none select-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap font-display text-[18vw] leading-none text-foreground/[0.03]">
        Ascotex
      </div>

      <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="absolute -top-5 right-8 group z-10">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-deep text-espresso shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 group-hover:-translate-y-1">
          <ArrowUp className="h-4 w-4" />
        </span>
      </button>

      <div className="container-x relative grid gap-12 py-20 md:grid-cols-4 md:py-24">
        <div className="md:col-span-2">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <Link href="/" className="inline-block group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Ascotex Fashions"
                className="h-16 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                style={{ mixBlendMode: "screen" }}
              />
            </Link>
            {footer.description && <p className="mt-6 max-w-md text-sm text-muted-foreground leading-relaxed">{footer.description}</p>}
            <div className="mt-8 flex gap-3">
              {[{ label: "Est. 2004" }, { label: "Savile Row" }, { label: "Bespoke" }].map((tag) => (
                <span key={tag.label} className="rounded-full border border-border/60 px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                  {tag.label}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Explore</div>
          <ul className="mt-5 space-y-3 text-sm">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="group inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-accent">
                  {l.label}
                  <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0" />
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Contact</div>
          <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
            {addr && <li className="whitespace-pre-line leading-relaxed">{addr}</li>}
            {email && <li><a href={`mailto:${email}`} className="transition-colors hover:text-accent">{email}</a></li>}
            {phone && <li className="transition-colors hover:text-accent">{phone}</li>}
          </ul>
        </motion.div>
      </div>

      <div className="container-x relative flex flex-col justify-between gap-4 border-t border-border/60 py-6 text-xs text-muted-foreground md:flex-row">
        <div>© {new Date().getFullYear()} Ascotex Fashions. All rights reserved.</div>
        {footer.copyright && <div className="font-display italic text-accent/70">{footer.copyright}</div>}
      </div>
    </footer>
  );
}
