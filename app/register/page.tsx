"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => { document.title = "Register — Ascot Fashions"; }, []);

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created. Check your email to verify.");
      router.push("/auth");
    }
  }

  return (
    <div className="container-x grid min-h-[calc(100vh-5rem)] place-items-center py-16">
      <div className="w-full max-w-md border border-border/60 bg-card p-8">
        <h1 className="font-display text-3xl">Create account</h1>
        <p className="mt-2 text-sm text-muted-foreground">Register to access member collections and private content.</p>

        <form onSubmit={signUp} className="mt-8 space-y-4">
          <div><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 rounded-none" /></div>
          <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 rounded-none" /></div>
          <div><Label>Password</Label><Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 rounded-none" /></div>
          <Button type="submit" disabled={loading} className="w-full rounded-none">Create account</Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <a href="/auth" className="text-accent hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}
