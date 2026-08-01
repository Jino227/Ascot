"use client";

import Link from "next/link";
import { ArrowUpRight, Image, Route, Star, FileText, Users, Mail } from "lucide-react";
import { Tilt3DCard } from "@/components/layout/Tilt3DCard";

const adminCards = [
  { href: "/admin/designs", label: "Designs", desc: "Upload and manage public and private design portfolio.", icon: Image },
  { href: "/admin/journey", label: "Journey", desc: "Add, reorder, publish, and edit the manufacturing journey steps.", icon: Route },
  { href: "/admin/celebrities", label: "Celebrities", desc: "Manage the celebrity showcase and red carpet appearances.", icon: Star },
  { href: "/admin/content", label: "Website Content", desc: "Edit hero text, story content, about page, and contact details.", icon: FileText },
  { href: "/admin/users", label: "Users", desc: "View registered accounts and manage admin role permissions.", icon: Users },
  { href: "/admin/inquiries", label: "Inquiries", desc: "Read and triage incoming client consultation inquiries.", icon: Mail },
];

export default function AdminDash() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
      {adminCards.map((c) => {
        const Icon = c.icon;
        return (
          <Tilt3DCard key={c.href} maxTilt={8} scaleOnHover={1.03}>
            <Link
              href={c.href}
              className="group block h-full rounded-xl border border-border/60 bg-black/30 backdrop-blur-md p-7 transition-all duration-300 hover:border-gold/50 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-gold" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-gold opacity-40 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
              <div className="mt-5 font-display text-2xl text-foreground font-normal">{c.label}</div>
              <div className="mt-2 text-xs text-muted-foreground font-light leading-relaxed">{c.desc}</div>
            </Link>
          </Tilt3DCard>
        );
      })}
    </div>
  );
}
