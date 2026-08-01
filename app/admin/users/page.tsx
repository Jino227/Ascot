"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { listUsers, promoteToAdmin } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, Shield, Crown, UserCheck } from "lucide-react";

export default function AdminUsers() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ 
    queryKey: ["admin", "users"], 
    queryFn: () => listUsers(user!.id) 
  });

  async function makeAdmin(id: string) {
    try { 
      await promoteToAdmin(user!.id, id); 
      toast.success("Promoted to admin"); 
      qc.invalidateQueries({ queryKey: ["admin", "users"] }); 
    } catch (e: any) { 
      toast.error(e.message); 
    }
  }

  if (isLoading) return <div className="py-12 text-muted-foreground font-light text-sm">Loading user accounts…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/40 pb-5">
        <div>
          <h2 className="font-display text-3xl flex items-center gap-2 text-foreground">
            <Users className="h-5 w-5 text-gold" /> Registered Accounts
          </h2>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1 font-light">
            View user profiles and assign administrative permissions.
          </p>
        </div>
        <span className="text-xs tracking-wider text-gold font-medium uppercase border border-gold/30 rounded-full px-3 py-1 bg-gold/10">
          {data.length} Accounts
        </span>
      </div>

      <div className="rounded-xl border border-border/60 bg-black/30 backdrop-blur-md overflow-hidden shadow-xl">
        {data.map((u: any) => (
          <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/40 p-5 last:border-0 hover:bg-white/[0.02] transition-colors gap-4">
            <div>
              <div className="font-display text-xl text-foreground flex items-center gap-2">
                <span>{u.full_name ?? "User"}</span>
                {u.roles?.includes("admin") && <Crown className="h-4 w-4 text-gold fill-gold/20" />}
              </div>
              <div className="text-xs text-muted-foreground font-light mt-1">
                {u.email} • Joined {new Date(u.created_at).toLocaleDateString()}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-wrap gap-1.5">
                {u.roles?.map((r: string) => (
                  <Badge key={r} variant="outline" className="rounded-full border-gold/30 bg-gold/10 text-gold text-[10px] uppercase tracking-wider px-3 py-0.5 font-medium">
                    {r}
                  </Badge>
                ))}
              </div>

              {!u.roles?.includes("admin") && (
                <Button size="sm" variant="outline" onClick={() => makeAdmin(u.id)} className="rounded-none text-xs border-gold/40 hover:border-gold hover:bg-gold/10 uppercase tracking-wider">
                  <Shield className="h-3.5 w-3.5 mr-1.5 text-gold" /> Make Admin
                </Button>
              )}
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div className="p-12 text-center text-muted-foreground font-light text-sm">
            No registered users found.
          </div>
        )}
      </div>
    </div>
  );
}
