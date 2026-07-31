"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { checkIsAdmin } from "@/lib/actions";

const tabs = [
  { href: "/admin", label: "Overview" },
  // { href: "/admin/works", label: "Works" },
  // { href: "/admin/team", label: "Company Gallery" },
  // { href: "/admin/videos", label: "Videos" },
  { href: "/admin/designs", label: "Designs" },
  { href: "/admin/journey", label: "Journey" },
  { href: "/admin/celebrities", label: "Celebrities" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/inquiries", label: "Inquiries" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const path = usePathname();
  useEffect(() => { document.title = "Admin — Ascot Fashions"; }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["isAdmin", user?.id],
    queryFn: () => checkIsAdmin(user!.id),
    enabled: !!user,
  });

  if (authLoading || isLoading) return <div className="container-x pt-32 py-20 text-muted-foreground">Checking permissions…</div>;
  if (!user) {
    return (
      <div className="container-x pt-32 py-32 text-center">
        <h1 className="font-display text-4xl">Sign in required</h1>
        <p className="mt-4 text-muted-foreground"><Link href="/auth" className="text-accent underline underline-offset-4">Sign in</Link> to access admin.</p>
      </div>
    );
  }
  if (!data?.isAdmin) {
    return (
      <div className="container-x pt-32 py-32 text-center">
        <h1 className="font-display text-4xl">Admin access required</h1>
        <p className="mt-4 text-muted-foreground">Your account doesn't have admin privileges.</p>
      </div>
    );
  }

  return (
    <div className="container-x pt-28 pb-12">
      <h1 className="font-display text-4xl">Admin</h1>
      <nav className="mt-6 flex flex-wrap gap-1 border-b border-border/60">
        {tabs.map((t) => {
          const active = path === t.href || (t.href !== "/admin" && path.startsWith(t.href));
          return (
            <Link key={t.href} href={t.href}
              className={`border-b-2 px-4 py-3 text-sm uppercase tracking-wide transition ${active ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t.label}
            </Link>
          );
        })}
      </nav>
      <div className="py-10">{children}</div>
    </div>
  );
}
