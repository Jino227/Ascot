"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AuthPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => { document.title = "Sign in — Ascot Fashions"; }, []);
  useEffect(() => { if (user) router.replace("/private-collections"); }, [user, router]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message); else toast.success("Welcome back.");
  }

  async function google() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) toast.error(error.message ?? "Google sign-in failed");
  }

  return (
    <div className="container-x grid min-h-[calc(100vh-5rem)] place-items-center py-16">
      <div className="w-full max-w-md border border-border/60 bg-card p-8">
        <h1 className="font-display text-3xl">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">Welcome back to Ascot Fashions.</p>

        <Button onClick={google} variant="outline" className="mt-6 w-full rounded-none">
          Continue with Google
        </Button>
        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={signIn} className="space-y-4">
          <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 rounded-none" /></div>
          <div><Label>Password</Label><Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 rounded-none" /></div>
          <Button type="submit" disabled={loading} className="w-full rounded-none">Sign in</Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          No account?{" "}
          <a href="/register" className="text-accent hover:underline">Register here</a>
        </p>
      </div>
    </div>
  );
}
