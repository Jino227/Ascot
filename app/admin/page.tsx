"use client";

import Link from "next/link";

export default function AdminDash() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {[
        { href: "/admin/works", label: "Works", desc: "Manage portfolio projects with images and videos." },
        { href: "/admin/team", label: "Team", desc: "Manage employee profiles and photos." },
        { href: "/admin/videos", label: "Videos", desc: "Upload and manage video gallery." },
        { href: "/admin/collections", label: "Collections", desc: "Create, edit, and reorder collections." },
        { href: "/admin/products", label: "Products", desc: "Manage products and their images." },
        { href: "/admin/clients", label: "Client access", desc: "Create client profiles and assign private collections." },
        { href: "/admin/journey", label: "Journey", desc: "Add, reorder, publish, and edit the manufacturing journey." },
        { href: "/admin/content", label: "Website content", desc: "Edit hero, about, and other sections." },
        { href: "/admin/users", label: "Users", desc: "View users and promote admins." },
        { href: "/admin/inquiries", label: "Inquiries", desc: "Read and triage incoming inquiries." },
      ].map((c) => (
        <Link key={c.href} href={c.href} className="border border-border/60 bg-card p-6 transition hover:border-accent">
          <div className="font-display text-2xl">{c.label}</div>
          <div className="mt-2 text-sm text-muted-foreground">{c.desc}</div>
        </Link>
      ))}
    </div>
  );
}
