"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield } from "lucide-react";

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => { document.title = "Admin Setup — Ascot Fashions"; }, []);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name || email } },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setDone(true);
    toast.success("Account created. The first account is automatically admin.");
  }

  if (done) {
    return (
      <div className="container-x grid min-h-screen place-items-center py-16">
        <div className="w-full max-w-md border border-border/60 bg-card p-8 text-center">
          <Shield className="mx-auto h-10 w-10 text-accent" />
          <h1 className="mt-4 font-display text-2xl">Account created</h1>
          <p className="mt-3 text-sm text-muted-foreground">If this is the first account, you are now an admin. Sign in to access the admin panel.</p>
          <Button asChild className="mt-6 w-full rounded-none">
            <Link href="/auth">Sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x grid min-h-screen place-items-center py-16">
      <div className="w-full max-w-md border border-border/60 bg-card p-8">
        <Shield className="h-8 w-8 text-accent" />
        <h1 className="mt-4 font-display text-2xl">Admin registration</h1>
        <p className="mt-2 text-sm text-muted-foreground">Register to access the admin panel. The first account is automatically promoted to admin.</p>
        <form onSubmit={handleRegister} className="mt-6 space-y-4">
          <div><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="mt-2 rounded-none" /></div>
          <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 rounded-none" /></div>
          <div><Label>Password</Label><Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className="mt-2 rounded-none" /></div>
          <Button type="submit" disabled={loading} className="w-full rounded-none">{loading ? "Creating account…" : "Register admin"}</Button>
        </form>
        <p className="mt-6 text-center text-xs text-muted-foreground">Already have an account? <Link href="/auth" className="text-accent hover:underline">Sign in</Link></p>
      </div>
    </div>
  );
}
