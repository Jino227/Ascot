import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: () => (
    <div className="grid gap-6 md:grid-cols-3">
      {[
        { to: "/admin/collections", label: "Collections", desc: "Create, edit, and reorder collections." },
        { to: "/admin/products", label: "Products", desc: "Manage products and their images." },
        { to: "/admin/content", label: "Website content", desc: "Edit hero, about, and other sections." },
        { to: "/admin/users", label: "Users", desc: "View users and promote admins." },
        { to: "/admin/inquiries", label: "Inquiries", desc: "Read and triage incoming inquiries." },
      ].map((c) => (
        <Link key={c.to} to={c.to} className="border border-border/60 bg-card p-6 transition hover:border-accent">
          <div className="font-display text-2xl">{c.label}</div>
          <div className="mt-2 text-sm text-muted-foreground">{c.desc}</div>
        </Link>
      ))}
    </div>
  ),
});
