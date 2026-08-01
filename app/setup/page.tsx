"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, ArrowRight } from "lucide-react";

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => { document.title = "Admin Setup — Ascotex Fashions"; }, []);

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
      <div className="relative grid min-h-screen place-items-center overflow-hidden px-5 pt-24 pb-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-accent/[0.06] blur-3xl" />
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-md">
          <div className="relative border border-border/60 bg-card p-8 text-center">
            <div className="absolute top-0 left-0 h-1 w-16 bg-accent" />
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
              <Shield className="h-6 w-6 text-accent" />
            </div>
            <h1 className="mt-5 font-display text-2xl">Account created</h1>
            <p className="mt-3 text-sm text-muted-foreground">If this is the first account, you are now an admin. Sign in to access the admin panel.</p>
            <Button asChild className="group mt-8 w-full rounded-none py-6 h-auto text-sm uppercase tracking-[0.15em]">
              <Link href="/auth">Sign in <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-5 pt-24 pb-16">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-accent/[0.06] blur-3xl" />
      </div>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-md">
        <div className="relative border border-border/60 bg-card p-8">
          <div className="absolute top-0 left-0 h-1 w-16 bg-accent" />
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
              <Shield className="h-4 w-4 text-accent" />
            </div>
            <div>
              <h1 className="font-display text-2xl">Admin registration</h1>
              <p className="mt-1 text-sm text-muted-foreground">The first account is automatically promoted to admin.</p>
            </div>
          </div>
          <form onSubmit={handleRegister} className="space-y-5">
            <div><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="mt-2 rounded-none bg-background focus-visible:ring-accent" /></div>
            <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 rounded-none bg-background focus-visible:ring-accent" /></div>
            <div><Label>Password</Label><Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className="mt-2 rounded-none bg-background focus-visible:ring-accent" /></div>
            <Button type="submit" disabled={loading} className="group w-full rounded-none py-6 h-auto text-sm uppercase tracking-[0.15em]">
              {loading ? "Creating account…" : <>Register admin <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></>}
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-muted-foreground">Already have an account? <Link href="/auth" className="text-accent hover:underline">Sign in</Link></p>
        </div>
      </motion.div>
    </div>
  );
}
