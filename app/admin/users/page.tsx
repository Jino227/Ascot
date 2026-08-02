"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { listUsers, promoteToAdmin, listClients, setClientAccountStatus, createClientAccount } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Users, Shield, Crown, UserCheck, Briefcase, Plus, Power, PowerOff } from "lucide-react";

export default function AdminUsers() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => listUsers(user!.id),
    enabled: !!user
  });

  const { data: clients = [], isLoading: loadingClients } = useQuery({
    queryKey: ["admin", "clients"],
    queryFn: () => listClients(user!.id),
    enabled: !!user
  });

  const [creatingClient, setCreatingClient] = useState(false);
  const [open, setOpen] = useState(false);

  async function makeAdmin(id: string) {
    try {
      await promoteToAdmin(user!.id, id);
      toast.success("Promoted to admin");
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function toggleClientStatus(id: string, currentlyActive: boolean) {
    try {
      await setClientAccountStatus(user!.id, id, !currentlyActive);
      toast.success(currentlyActive ? "Client account disabled" : "Client account enabled");
      qc.invalidateQueries({ queryKey: ["admin", "clients"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleCreateClient(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreatingClient(true);
    const fd = new FormData(e.currentTarget);
    try {
      await createClientAccount(user!.id, {
        email: fd.get("email") as string,
        password: fd.get("password") as string,
        company_name: fd.get("company_name") as string,
        contact_person: fd.get("contact_person") as string,
        phone: fd.get("phone") as string,
      });
      toast.success("Client account created successfully");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin", "clients"] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreatingClient(false);
    }
  }

  if (loadingUsers || loadingClients) return <div className="py-12 text-muted-foreground font-light text-sm">Loading accounts…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/40 pb-5">
        <div>
          <h2 className="font-display text-3xl flex items-center gap-2 text-foreground">
            <Users className="h-5 w-5 text-gold" /> Accounts Management
          </h2>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1 font-light">
            Manage users, admins, and B2B clients.
          </p>
        </div>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="bg-black/40 border border-border/60 mb-6 rounded-none p-1">
          <TabsTrigger value="users" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold rounded-none text-xs uppercase tracking-wider">
            All Users ({users.length})
          </TabsTrigger>
          <TabsTrigger value="clients" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold rounded-none text-xs uppercase tracking-wider">
            Clients ({clients.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="rounded-xl border border-border/60 bg-black/30 backdrop-blur-md overflow-hidden shadow-xl">
            {users.map((u: any) => (
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

            {users.length === 0 && (
              <div className="p-12 text-center text-muted-foreground font-light text-sm">
                No registered users found.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-none bg-gold text-background hover:bg-gold/90 text-xs uppercase tracking-wider">
                  <Plus className="h-4 w-4 mr-2" /> Add Client
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-ink border border-gold/30 rounded-none sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl font-light text-gold">Create Client Account</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateClient} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Email Address *</Label>
                    <Input name="email" type="email" required className="rounded-none border-border/60 bg-background/50 focus-visible:ring-gold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Temporary Password *</Label>
                    <Input name="password" type="password" required minLength={8} className="rounded-none border-border/60 bg-background/50 focus-visible:ring-gold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Company Name</Label>
                    <Input name="company_name" type="text" className="rounded-none border-border/60 bg-background/50 focus-visible:ring-gold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Contact Person</Label>
                    <Input name="contact_person" type="text" className="rounded-none border-border/60 bg-background/50 focus-visible:ring-gold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                    <Input name="phone" type="tel" className="rounded-none border-border/60 bg-background/50 focus-visible:ring-gold" />
                  </div>
                  <div className="pt-4 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-none text-xs uppercase tracking-wider border-border/60 hover:bg-white/5">Cancel</Button>
                    <Button type="submit" disabled={creatingClient} className="rounded-none bg-gold text-background hover:bg-gold/90 text-xs uppercase tracking-wider">
                      {creatingClient ? "Creating..." : "Create Client"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-xl border border-border/60 bg-black/30 backdrop-blur-md overflow-hidden shadow-xl">
            {clients.map((c: any) => (
              <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/40 p-5 last:border-0 hover:bg-white/[0.02] transition-colors gap-4">
                <div>
                  <div className="font-display text-xl text-foreground flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gold" />
                    <span>{c.company_name || c.profiles?.full_name || "Unnamed Client"}</span>
                    {!c.is_active && <Badge variant="destructive" className="ml-2 rounded-full text-[10px] px-2 py-0 border-red-500/30">Disabled</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground font-light mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <span>{c.email}</span>
                    {c.phone && <span className="hidden sm:inline">•</span>}
                    {c.phone && <span>{c.phone}</span>}
                    {c.contact_person && <span className="hidden sm:inline">•</span>}
                    {c.contact_person && <span>Contact: {c.contact_person}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleClientStatus(c.id, c.is_active)}
                    className={`rounded-none text-xs uppercase tracking-wider ${c.is_active ? 'border-red-500/40 text-red-500 hover:bg-red-500/10 hover:border-red-500' : 'border-green-500/40 text-green-500 hover:bg-green-500/10 hover:border-green-500'}`}
                  >
                    {c.is_active ? <><PowerOff className="h-3.5 w-3.5 mr-1.5" /> Disable Access</> : <><Power className="h-3.5 w-3.5 mr-1.5" /> Enable Access</>}
                  </Button>
                </div>
              </div>
            ))}

            {clients.length === 0 && (
              <div className="p-12 text-center text-muted-foreground font-light text-sm">
                No clients found.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
