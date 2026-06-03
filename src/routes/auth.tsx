import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Maison·Loom" },
      { name: "description", content: "Sign in or create an account to access member collections." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (user) navigate({ to: "/private-collections", replace: true });
  }, [user, navigate]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message); else toast.success("Welcome back.");
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Account created. Check your email to verify.");
  }

  async function google() {
    const { error } = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (error) toast.error((error as Error).message ?? "Google sign-in failed");
  }

  return (
    <div className="container-x grid min-h-[calc(100vh-5rem)] place-items-center py-16">
      <div className="w-full max-w-md border border-border/60 bg-card p-8">
        <h1 className="font-display text-3xl">Atelier access</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in or create an account.</p>

        <Button onClick={google} variant="outline" className="mt-6 w-full rounded-none">
          Continue with Google
        </Button>
        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
        </div>

        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2 rounded-none">
            <TabsTrigger value="signin" className="rounded-none">Sign in</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-none">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={signIn} className="space-y-4">
              <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 rounded-none" /></div>
              <div><Label>Password</Label><Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 rounded-none" /></div>
              <Button type="submit" disabled={loading} className="w-full rounded-none">Sign in</Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={signUp} className="space-y-4">
              <div><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 rounded-none" /></div>
              <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 rounded-none" /></div>
              <div><Label>Password</Label><Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 rounded-none" /></div>
              <Button type="submit" disabled={loading} className="w-full rounded-none">Create account</Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
