"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { getWebsiteContent } from "@/lib/actions";
import { ArrowUp, ArrowUpRight } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/#our-story", label: "Our Story" },
  { href: "/about", label: "About" },
  { href: "/journey", label: "Our Journey" },
  { href: "/designs", label: "Designs" },
  { href: "/celebrities", label: "Celebrities" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  const { data } = useQuery({ queryKey: ["website_content"], queryFn: () => getWebsiteContent() });
  const footer = data?.footer ?? {};
  const contact = data?.contact ?? {};

  const description = footer.description || "Bespoke tailoring and haute couture collections crafted with passion and precision.";
  const address = footer.address || contact.address;
  const email = footer.email || contact.email;
  const phone = footer.phone || contact.phone;

  return (
    <footer className="relative border-t border-gold/20 bg-black overflow-hidden text-foreground">
      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="absolute -top-5 right-8 group z-20"
        aria-label="Scroll to top"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-black shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 group-hover:-translate-y-1">
          <ArrowUp className="h-4 w-4" />
        </span>
      </button>

      <div className="container-x relative z-10 grid gap-10 py-16 md:grid-cols-12 md:py-20">
        {/* Logo & Brand Description */}
        <div className="md:col-span-5">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <Link href="/" className="inline-block group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Ascotex Fashions"
                className="h-12 sm:h-16 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </Link>

            {description && (
              <p className="mt-5 max-w-md text-sm text-muted-foreground leading-relaxed font-light whitespace-pre-line">
                {description}
              </p>
            )}
          </motion.div>
        </div>

        {/* Quick Navigation Links */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="md:col-span-3">
          <div className="text-xs uppercase tracking-[0.2em] text-gold font-medium mb-4">Navigation</div>
          <ul className="space-y-2.5 text-sm">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="group inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-gold"
                >
                  <span>{l.label}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all duration-300 group-hover:opacity-100 text-gold" />
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Contact Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="md:col-span-4">
          <div className="text-xs uppercase tracking-[0.2em] text-gold font-medium mb-4">Contact</div>
          <ul className="space-y-3 text-sm text-muted-foreground font-light">
            {address && <li className="whitespace-pre-line leading-relaxed">{address}</li>}
            {email && (
              <li>
                <a href={`mailto:${email}`} className="transition-colors hover:text-gold">
                  {email}
                </a>
              </li>
            )}
            {phone && (
              <li>
                <a href={`tel:${phone.replace(/\s+/g, '')}`} className="transition-colors hover:text-gold">
                  {phone}
                </a>
              </li>
            )}
          </ul>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/40 py-6">
        <div className="container-x flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} Ascotex Fashions. All rights reserved.</div>
          {footer.copyright && (
            <div className="font-display italic text-gold/80">
              {footer.copyright}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
