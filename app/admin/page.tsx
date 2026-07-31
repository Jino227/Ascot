"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function AdminDash() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {[
        // { href: "/admin/works", label: "Works", desc: "Manage portfolio projects with images and videos." },
        // { href: "/admin/team", label: "Team", desc: "Manage employee profiles and photos." },
        // { href: "/admin/videos", label: "Videos", desc: "Upload and manage video gallery." },
        { href: "/admin/designs", label: "Designs", desc: "Upload design portfolio." },
        { href: "/admin/journey", label: "Journey", desc: "Add, reorder, publish, and edit the manufacturing journey." },
        { href: "/admin/celebrities", label: "Celebrities", desc: "Manage the celebrity showcase." },
        { href: "/admin/content", label: "Website content", desc: "Edit hero, about, and other sections." },
        { href: "/admin/users", label: "Users", desc: "View users and promote admins." },
        { href: "/admin/inquiries", label: "Inquiries", desc: "Read and triage incoming inquiries." },
      ].map((c) => (
        <Link key={c.href} href={c.href} className="group border border-border/60 bg-card p-6 transition-all duration-300 hover:border-accent hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5">
          <div className="flex items-center justify-between">
            <div className="font-display text-2xl">{c.label}</div>
            <ArrowUpRight className="h-5 w-5 text-accent opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
          <div className="mt-2 text-sm text-muted-foreground">{c.desc}</div>
        </Link>
      ))}
    </div>
  );
}
