"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { getWebsiteContent, submitInquiry } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, MapPin, Phone, Clock, Send, Sparkles, CheckCircle2 } from "lucide-react";
import { TextReveal } from "@/components/layout/TextReveal";
import { Magnetic } from "@/components/layout/Magnetic";
import { Particles } from "@/components/layout/Particles";
import { Tilt3DCard } from "@/components/layout/Tilt3DCard";
import { SvgMorphDivider } from "@/components/layout/SvgMorphDivider";
import { PageLoader } from "@/components/layout/PageLoader";


export default function Contact() {
  useEffect(() => { document.title = "Contact — Ascotex Fashions"; }, []);
  const { data: content, isLoading } = useQuery({ queryKey: ["website_content"], queryFn: () => getWebsiteContent() });
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", message: "" });
  const contact = content?.contact ?? {};

  if (isLoading && !content) return <PageLoader />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await submitInquiry(form);
      toast.success("Your inquiry was sent. We'll be in touch soon.");
      setForm({ name: "", email: "", phone: "", company: "", message: "" });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to send inquiry");
    } finally {
      setLoading(false);
    }
  }

  const details = [
    { icon: MapPin, label: "Atelier Address", content: contact.address },
    { icon: Mail, label: "Email Inquiry", content: contact.email },
    { icon: Phone, label: "Direct Phone", content: contact.phone },
    { icon: Clock, label: "Consultation Hours", content: "Mon–Fri, 9am – 6pm" },
  ].filter((d) => d.content);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      <Particles count={45} className="opacity-50" />
      
      <div className="container-x grid gap-16 pt-32 pb-24 md:grid-cols-2 md:pt-44 md:pb-36 md:gap-24 items-start relative z-10">
        {/* Left Column: Contact Channels */}
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          {contact.eyebrow && (
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-gold font-medium mb-3">
              <Sparkles className="h-3.5 w-3.5 text-gold" /> {contact.eyebrow}
            </p>
          )}
          {contact.title && (
            <h1 className="mt-2 font-display text-3xl sm:text-5xl md:text-7xl leading-tight">
              <TextReveal text={contact.title} />
            </h1>
          )}
          {contact.body && (
            <p className="mt-6 max-w-md text-base md:text-lg text-muted-foreground leading-relaxed font-light">
              {contact.body}
            </p>
          )}

          <div className="mt-14 space-y-6">
            {details.map((d, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex items-start gap-5 group rounded-xl border border-border/40 bg-secondary/20 p-4 transition-all duration-300 hover:border-gold/40 hover:bg-secondary/40"
              >
                <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-gold group-hover:text-black">
                  <d.icon className="h-5 w-5 text-gold group-hover:text-black transition-colors" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-gold/80 font-medium">{d.label}</div>
                  <div className="mt-1 text-sm whitespace-pre-line leading-relaxed text-foreground font-light">{d.content}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Column: Glass Inquiry Form */}
        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <Tilt3DCard maxTilt={4} scaleOnHover={1.01}>
            <form onSubmit={onSubmit} className="relative rounded-2xl border border-gold/30 bg-black/40 backdrop-blur-xl p-8 md:p-12 shadow-2xl overflow-hidden">
              <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gold/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-gold-deep/10 blur-3xl" />

              <h2 className="font-display text-3xl mb-1 text-foreground">Send an Inquiry</h2>
              <p className="text-xs uppercase tracking-[0.2em] text-gold/80 mb-8 font-light">We reply within 24 hours</p>

              <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">Name *</Label>
                    <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">Email *</Label>
                    <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="company" className="text-xs uppercase tracking-wider text-muted-foreground">Company</Label>
                    <Input id="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-xs uppercase tracking-wider text-muted-foreground">Phone</Label>
                    <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-2" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="message" className="text-xs uppercase tracking-wider text-muted-foreground">Message *</Label>
                  <Textarea id="message" required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-2" />
                </div>

                <Magnetic className="w-full">
                  <Button type="submit" disabled={loading} className="w-full rounded-none bg-accent text-accent-foreground hover:bg-accent/90 py-6 h-auto text-xs uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all">
                    {loading ? "Sending Inquiry…" : <><Send className="mr-2 h-4 w-4" /> Send Inquiry</>}
                  </Button>
                </Magnetic>
              </div>
            </form>
          </Tilt3DCard>
        </motion.div>
      </div>
    </div>
  );
}
