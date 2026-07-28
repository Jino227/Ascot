"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { createAdminAccount } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield } from "lucide-react";

export default function AdminRegister() {
  const { user } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => { document.title = "Register Admin — Ascot Fashions"; }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await createAdminAccount(user.id, form);
      setDone(true);
      toast.success("Admin account created");
    } catch (error: any) { toast.error(error.message); }
    finally { setLoading(false); }
  }

  if (done) {
    return (
      <div className="max-w-md border border-border/60 bg-card p-8 text-center">
        <Shield className="mx-auto h-10 w-10 text-accent" />
        <h2 className="mt-4 font-display text-2xl">Admin created</h2>
        <p className="mt-2 text-sm text-muted-foreground">The new admin can sign in at /auth.</p>
        <Button onClick={() => { setDone(false); setForm({ email: "", password: "", name: "" }); }} className="mt-6 rounded-none">Create another</Button>
      </div>
    );
  }

  return (
    <div className="max-w-md border border-border/60 bg-card p-6 md:p-8">
      <Shield className="h-8 w-8 text-accent" />
      <h2 className="mt-4 font-display text-2xl">Create admin account</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Create a new admin who will have full access to the CMS. Share the credentials securely.</p>
      <form onSubmit={handleCreate} className="mt-6 space-y-4">
        <div><Label>Full name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-2 rounded-none" /></div>
        <div><Label>Email</Label><Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-2 rounded-none" /></div>
        <div><Label>Temporary password</Label><Input required minLength={8} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-2 rounded-none" /></div>
        <Button type="submit" disabled={loading} className="w-full rounded-none">{loading ? "Creating…" : "Create admin"}</Button>
      </form>
    </div>
  );
}
