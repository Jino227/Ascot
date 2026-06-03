import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { checkIsAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Maison·Loom" }] }),
  component: AdminLayout,
});

const tabs = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/collections", label: "Collections" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/content", label: "Content" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/inquiries", label: "Inquiries" },
];

function AdminLayout() {
  const fn = useServerFn(checkIsAdmin);
  const { data, isLoading } = useQuery({ queryKey: ["isAdmin"], queryFn: () => fn() });
  const path = useRouterState({ select: (s) => s.location.pathname });

  if (isLoading) return <div className="container-x py-20 text-muted-foreground">Checking permissions…</div>;
  if (!data?.isAdmin) {
    return (
      <div className="container-x py-32 text-center">
        <h1 className="font-display text-4xl">Admin access required</h1>
        <p className="mt-4 text-muted-foreground">Your account doesn't have admin privileges.</p>
      </div>
    );
  }

  return (
    <div className="container-x py-12">
      <h1 className="font-display text-4xl">Admin</h1>
      <nav className="mt-6 flex flex-wrap gap-1 border-b border-border/60">
        {tabs.map((t) => {
          const active = path === t.to || (t.to !== "/admin" && path.startsWith(t.to));
          return (
            <Link key={t.to} to={t.to}
              className={`border-b-2 px-4 py-3 text-sm uppercase tracking-wide transition ${active ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t.label}
            </Link>
          );
        })}
      </nav>
      <div className="py-10"><Outlet /></div>
    </div>
  );
}
