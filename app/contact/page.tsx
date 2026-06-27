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
import { Mail, MapPin, Phone, Clock, Send } from "lucide-react";

const DEMO_CONTACT = {
  eyebrow: "Get in touch",
  title: "Begin your fitting.",
  body: "Book a consultation or inquire about a custom commission. Our team typically responds within 24 hours.",
  address: "152 Savile Row\nLondon, W1S 3NE",
  email: "hello@ascotfashions.com",
  phone: "+44 (0) 20 7946 0128",
};

export default function Contact() {
  useEffect(() => { document.title = "Contact — Ascot Fashions"; }, []);
  const { data: content } = useQuery({ queryKey: ["website_content"], queryFn: () => getWebsiteContent() });
  const contact = { ...DEMO_CONTACT, ...(content?.contact ?? {}) };

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", message: "" });

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
    { icon: MapPin, content: contact.address },
    { icon: Mail, content: contact.email },
    { icon: Phone, content: contact.phone },
    { icon: Clock, content: "Mon–Fri, 9am – 6pm" },
  ].filter((d) => d.content);

  return (
    <div className="container-x grid gap-16 py-20 md:grid-cols-2 md:py-32 md:gap-24">
      <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
        {contact.eyebrow && <p className="text-xs uppercase tracking-[0.4em] text-accent/80">{contact.eyebrow}</p>}
        {contact.title && <h1 className="mt-5 font-display text-5xl md:text-6xl leading-tight">{contact.title}</h1>}
        {contact.body && <p className="mt-6 max-w-md text-lg text-muted-foreground leading-relaxed">{contact.body}</p>}

        <motion.div className="mt-14 space-y-8" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>
          {details.map((d, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="flex items-start gap-4 group">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                <d.icon className="h-5 w-5 text-accent" />
              </div>
              <div className="pt-1.5 text-sm whitespace-pre-line leading-relaxed">{d.content}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
        <form onSubmit={onSubmit} className="border border-border/60 bg-card p-8 md:p-10">
          <h2 className="font-display text-2xl mb-8">Send an inquiry</h2>
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div><Label htmlFor="name">Name *</Label><Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-2 rounded-none focus-visible:ring-accent" /></div>
              <div><Label htmlFor="email">Email *</Label><Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-2 rounded-none focus-visible:ring-accent" /></div>
              <div><Label htmlFor="company">Company</Label><Input id="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="mt-2 rounded-none focus-visible:ring-accent" /></div>
              <div><Label htmlFor="phone">Phone</Label><Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-2 rounded-none focus-visible:ring-accent" /></div>
            </div>
            <div><Label htmlFor="message">Message *</Label><Textarea id="message" required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-2 rounded-none focus-visible:ring-accent" /></div>
            <Button type="submit" disabled={loading} className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90 py-6 h-auto text-sm uppercase tracking-[0.15em]">
              {loading ? "Sending…" : <><Send className="mr-2 h-4 w-4" /> Send inquiry</>}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
