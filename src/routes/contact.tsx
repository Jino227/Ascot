import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitInquiry } from "@/lib/content.functions";
import { Reveal } from "@/components/layout/Reveal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Maison·Loom" },
      { name: "description", content: "Begin a textile collaboration with our atelier. We reply within two business days." },
      { property: "og:title", content: "Contact — Maison·Loom" },
      { property: "og:description", content: "Begin a textile collaboration with our atelier." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const fn = useServerFn(submitInquiry);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", message: "" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fn({ data: form });
      toast.success("Your inquiry was sent. We'll be in touch soon.");
      setForm({ name: "", email: "", phone: "", company: "", message: "" });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to send inquiry");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-x grid gap-16 py-20 md:grid-cols-2 md:py-28">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.4em] text-accent">Contact</p>
        <h1 className="mt-5 font-display text-5xl md:text-6xl">Begin a collaboration.</h1>
        <p className="mt-6 max-w-md text-lg text-muted-foreground">
          Whether for a single bolt or a season-long partnership, our atelier team replies within two business days.
        </p>
        <div className="mt-12 space-y-5 text-sm">
          <div className="flex items-start gap-3"><MapPin className="h-5 w-5 text-accent" /><div>152 Linen Street<br />New York, NY 10013</div></div>
          <div className="flex items-start gap-3"><Mail className="h-5 w-5 text-accent" /><div>atelier@example.com</div></div>
          <div className="flex items-start gap-3"><Phone className="h-5 w-5 text-accent" /><div>+1 (212) 555-0142</div></div>
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <form onSubmit={onSubmit} className="space-y-5 border border-border/60 bg-card p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <div><Label htmlFor="name">Name *</Label><Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-2 rounded-none" /></div>
            <div><Label htmlFor="email">Email *</Label><Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-2 rounded-none" /></div>
            <div><Label htmlFor="company">Company</Label><Input id="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="mt-2 rounded-none" /></div>
            <div><Label htmlFor="phone">Phone</Label><Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-2 rounded-none" /></div>
          </div>
          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea id="message" required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-2 rounded-none" />
          </div>
          <Button type="submit" disabled={loading} className="rounded-none bg-foreground text-background hover:bg-foreground/90">
            {loading ? "Sending…" : "Send inquiry"}
          </Button>
        </form>
      </Reveal>
    </div>
  );
}
