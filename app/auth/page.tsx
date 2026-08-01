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
import { Lock, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { Particles } from "@/components/layout/Particles";
import { Tilt3DCard } from "@/components/layout/Tilt3DCard";
import { Magnetic } from "@/components/layout/Magnetic";

export default function AuthPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => { document.title = "Sign in — Ascotex Fashions"; }, []);

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
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-background text-foreground px-5 pt-28 pb-16">
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute -top-32 right-1/4 h-[30rem] w-[30rem] rounded-full bg-gold/[0.09] blur-3xl animate-glow" />
        <div className="absolute -bottom-32 left-1/4 h-[30rem] w-[30rem] rounded-full bg-gold-deep/[0.08] blur-3xl animate-glow-slow" />
      </div>

      {/* Floating Gold Dust Particles */}
      <Particles count={65} className="opacity-60 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <Tilt3DCard maxTilt={5} scaleOnHover={1.01}>
          <div className="relative rounded-2xl border border-gold/40 bg-black/60 backdrop-blur-2xl p-8 sm:p-12 shadow-2xl overflow-hidden">
            <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gold/15 blur-3xl" />

            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 border border-gold/40 shadow-inner">
                <Lock className="h-5 w-5 text-gold" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-gold font-medium">Atelier Access</div>
                <h1 className="font-display text-3xl text-foreground mt-0.5">Sign In</h1>
                <p className="text-xs text-muted-foreground font-light">Welcome back to Ascotex Fashions.</p>
              </div>
            </div>

            <form onSubmit={signIn} className="space-y-6">
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Email Address *</Label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 rounded-none border-border/60 bg-black/50 focus-visible:ring-gold text-foreground"
                />
              </div>

              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Password *</Label>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 rounded-none border-border/60 bg-black/50 focus-visible:ring-gold text-foreground"
                />
              </div>

              <Magnetic className="w-full">
                <Button
                  type="submit"
                  disabled={loading}
                  className="group w-full rounded-none bg-accent text-accent-foreground hover:bg-accent/90 py-6 h-auto text-xs uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(212,175,55,0.35)] transition-all"
                >
                  {loading ? (
                    "Signing in…"
                  ) : (
                    <>
                      Sign in <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </Magnetic>
            </form>
          </div>
        </Tilt3DCard>
      </motion.div>
    </div>
  );
}
