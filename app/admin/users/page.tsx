"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { listUsers, promoteToAdmin } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AdminUsers() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin", "users"], queryFn: () => listUsers(user!.id) });

  async function makeAdmin(id: string) {
    try { await promoteToAdmin(user!.id, id); toast.success("Promoted"); qc.invalidateQueries({ queryKey: ["admin", "users"] }); }
    catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="border border-border/60">
      {data.map((u: any) => (
        <div key={u.id} className="flex items-center justify-between border-b border-border/60 p-4 last:border-0">
          <div>
            <div className="font-medium">{u.full_name ?? "—"}</div>
            <div className="text-xs text-muted-foreground">{u.email} · joined {new Date(u.created_at).toLocaleDateString()}</div>
          </div>
          <div className="flex items-center gap-2">
            {u.roles?.map((r: string) => <Badge key={r} variant="secondary" className="rounded-none">{r}</Badge>)}
            {!u.roles?.includes("admin") && <Button size="sm" variant="outline" onClick={() => makeAdmin(u.id)} className="rounded-none">Make admin</Button>}
          </div>
        </div>
      ))}
      {data.length === 0 && <div className="p-8 text-center text-muted-foreground">No users yet.</div>}
    </div>
  );
}
