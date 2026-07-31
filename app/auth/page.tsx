"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, ArrowRight } from "lucide-react";
import { Particles } from "@/components/layout/Particles";

export default function AuthPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => { document.title = "Sign in — Ascot Fashions"; }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("clients").select("is_active").eq("user_id", user.id).maybeSingle();
      if (data && !data.is_active) {
        toast.error("Your account has been disabled.");
        supabase.auth.signOut();
        router.refresh();
      } else {
        router.replace("/private-collections");
      }
    })();
  }, [user, router]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-5 pt-24 pb-16">
      {/* Background flourish */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-gold/10 blur-3xl animate-glow" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-gold-deep/[0.08] blur-3xl animate-glow-slow" />
      </div>
      <Particles count={45} className="opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="relative glass rounded-2xl p-8 md:p-10">
          <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gold/15 blur-3xl" />
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
              <Lock className="h-4 w-4 text-accent" />
            </div>
            <div>
              <h1 className="font-display text-3xl">Sign in</h1>
              <p className="mt-1 text-sm text-muted-foreground">Welcome back to Ascot Fashions.</p>
            </div>
          </div>
          <form onSubmit={signIn} className="space-y-5">
            <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 rounded-none focus-visible:ring-accent bg-background/50" /></div>
            <div><Label>Password</Label><Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 rounded-none focus-visible:ring-accent bg-background/50" /></div>
            <Button type="submit" disabled={loading} className="group w-full rounded-none bg-accent text-accent-foreground hover:bg-accent/90 py-6 h-auto text-sm uppercase tracking-[0.15em] shadow-[0_0_25px_rgba(212,175,55,0.25)]">
              {loading ? "Signing in…" : <>Sign in <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></>}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
