"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getCollections, getCollectionClients, listClients, assignCollectionToClient, unassignCollectionFromClient, createClientAccount, setClientAccountStatus } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AdminClients() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({ email: "", password: "", company_name: "", contact_person: "", phone: "" });
  const { data: clients = [] } = useQuery({ queryKey: ["admin", "clients"], queryFn: () => listClients(user!.id), enabled: !!user });
  const { data: collections = [] } = useQuery({ queryKey: ["admin", "collections", "assignment"], queryFn: () => getCollections({ includePrivate: true }), enabled: !!user });
  const { data: assignments = [] } = useQuery({ queryKey: ["admin", "collection-clients"], queryFn: () => getCollectionClients(user!.id), enabled: !!user });

  const assigned = new Set(assignments.map((item: any) => `${item.collection_id}:${item.client_id}`));

  async function createClient() {
    if (!form.email || !form.password) return toast.error("Enter both email and temporary password");
    try {
      await createClientAccount(user!.id, form);
      setForm({ email: "", password: "", company_name: "", contact_person: "", phone: "" });
      qc.invalidateQueries({ queryKey: ["admin", "clients"] });
      toast.success("Client login created");
    } catch (error: any) { toast.error(error.message); }
  }

  async function toggle(collectionId: string, clientId: string) {
    try {
      if (assigned.has(`${collectionId}:${clientId}`)) await unassignCollectionFromClient(user!.id, collectionId, clientId);
      else await assignCollectionToClient(user!.id, collectionId, clientId);
      qc.invalidateQueries({ queryKey: ["admin", "collection-clients"] });
    } catch (error: any) { toast.error(error.message); }
  }

  async function toggleAccount(client: any) {
    try {
      await setClientAccountStatus(user!.id, client.id, !client.is_active);
      qc.invalidateQueries({ queryKey: ["admin", "clients"] });
      toast.success(client.is_active ? "Client disabled" : "Client enabled");
    } catch (error: any) { toast.error(error.message); }
  }

  return (
    <div className="space-y-10">
      <section className="border border-border/60 bg-card p-6">
        <h2 className="font-display text-2xl">Create premium client login</h2>
        <p className="mt-2 text-sm text-muted-foreground">Create the invitation-only premium user from the admin side, then assign collections below. The client will sign in with the email and password shared by the admin.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="client@company.com" className="mt-2 rounded-none" />
          </div>
          <div>
            <Label>Temporary password</Label>
            <Input type="password" minLength={8} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Minimum 8 characters" className="mt-2 rounded-none" />
          </div>
          <div>
            <Label>Company</Label>
            <Input value={form.company_name} onChange={(event) => setForm({ ...form, company_name: event.target.value })} placeholder="Optional company" className="mt-2 rounded-none" />
          </div>
          <div>
            <Label>Contact person</Label>
            <Input value={form.contact_person} onChange={(event) => setForm({ ...form, contact_person: event.target.value })} placeholder="Primary contact" className="mt-2 rounded-none" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Optional phone" className="mt-2 rounded-none" />
          </div>
        </div>
        <div className="mt-5">
          <Button onClick={createClient} className="rounded-none">Create client login</Button>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl">Collection access matrix</h2>
        <p className="mt-2 text-sm text-muted-foreground">Only assigned clients can see private images and private collections.</p>
        <div className="mt-5 overflow-x-auto border border-border/60">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead><tr className="border-b border-border/60 bg-muted/30"><th className="p-4 font-medium">Client</th>{collections.map((collection: any) => <th key={collection.id} className="min-w-32 p-4 font-medium">{collection.name}</th>)}<th className="p-4 font-medium">Account</th></tr></thead>
            <tbody>{clients.map((client: any) => <tr key={client.id} className="border-b border-border/60 last:border-0"><td className="p-4"><div className="font-medium">{client.company_name || client.contact_person || "Unnamed client"}</div><div className="text-xs text-muted-foreground">{client.email || client.profiles?.email || "—"}</div><div className={`mt-1 text-[10px] uppercase tracking-widest ${client.is_active ? "text-emerald-600" : "text-destructive"}`}>{client.is_active ? "Enabled" : "Disabled"}</div></td>{collections.map((collection: any) => <td key={collection.id} className="p-4"><label className="inline-flex cursor-pointer items-center gap-2"><input type="checkbox" disabled={!client.is_active} checked={assigned.has(`${collection.id}:${client.id}`)} onChange={() => toggle(collection.id, client.id)} className="h-4 w-4 accent-[hsl(var(--accent))]" /><span className="text-xs text-muted-foreground">Allow</span></label></td>)}<td className="p-4"><Button size="sm" variant="outline" onClick={() => toggleAccount(client)} className="rounded-none">{client.is_active ? "Disable" : "Enable"}</Button></td></tr>)}{clients.length === 0 && <tr><td colSpan={Math.max(collections.length + 2, 3)} className="p-10 text-center text-muted-foreground">No client profiles yet.</td></tr>}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
