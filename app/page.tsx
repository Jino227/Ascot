"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Play, X, Award, Leaf, Scissors, Sparkles, ChevronDown, Quote } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getWebsiteContent, getFeaturedCollections, getVideos, getFeaturedVideos, getJourneySteps } from "@/lib/actions";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(ScrollTrigger);

// ── Demo data ──
const DEMO = {
  hero: { eyebrow: "Est. 1985", title: "Where craftsmanship meets contemporary style.", subtitle: "Bespoke tailoring and ready-to-wear collections crafted for those who value precision, quality, and timeless design.", cta: "Explore collections", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=2000&q=80", video_url: "" },
  about: { eyebrow: "Our Heritage", title: "Four decades of tailoring excellence.", body: "Founded in 1985, Ascot Fashions began as a small tailoring atelier with a commitment to exceptional craftsmanship. Today we create bespoke and ready-to-wear garments for discerning clients worldwide.", stats: [{ key: "40+", label: "Years" }, { key: "200+", label: "Artisans" }, { key: "50+", label: "Export countries" }, { key: "10K+", label: "Garments/year" }] },
  process: { eyebrow: "Our Manufacturing Strength", title: "From design to dispatch.", pillars: [
    { icon: "Sparkles", title: "Design Studio", body: "Creative designers transform concepts into embroidery-ready artwork." },
    { icon: "Scissors", title: "Sampling", body: "Rapid prototyping with meticulous attention to detail." },
    { icon: "Award", title: "Embroidery", body: "Master craftsmen with decades of stitching expertise." },
    { icon: "Leaf", title: "Production", body: "Scalable manufacturing with consistent quality." },
    { icon: "Sparkles", title: "Quality Control", body: "Detailed inspection for stitches, beads and finishing." },
    { icon: "Leaf", title: "Packaging", body: "Carefully packed and shipped worldwide." },
  ] },
  testimonials: [
    { quote: "The attention to detail is extraordinary. Every aspect was executed perfectly.", name: "James H.", role: "Client" },
    { quote: "Working with Ascot was an absolute pleasure. The results speak for themselves.", name: "Victoria L.", role: "Private client" },
    { quote: "From consultation to delivery, an exceptional experience.", name: "Alexander P.", role: "Corporate client" },
  ],
  contact: { eyebrow: "Get in touch", title: "Start your next project.", body: "Request a catalogue or contact our sales team.", cta: "Request Catalogue" },
  videos: [
    { id: "dv1", title: "Behind the Scenes", description: "A look behind the scenes at our latest estate project.", url: "https://www.w3schools.com/html/mov_bbb.mp4", thumbnail: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80", category: "Behind the Scenes" },
    { id: "dv2", title: "Process — Sketch to Stitch", description: "Watch our process from sketch to final garment.", url: "https://www.w3schools.com/html/mov_bbb.mp4", thumbnail: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&q=80", category: "Process" },
    { id: "dv3", title: "Client Testimonial", description: "Our client shares their experience.", url: "https://www.w3schools.com/html/mov_bbb.mp4", thumbnail: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80", category: "Testimonial" },
  ],
  journey: [
    { id: "j1", title: "Material Sourcing", step_order: 1, image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80" },
    { id: "j2", title: "Hand Dyeing", step_order: 2, image: "https://images.unsplash.com/photo-1567789884554-0b844b597180?w=600&q=80" },
    { id: "j3", title: "Design Studio", step_order: 3, image: "https://images.unsplash.com/photo-1604328698692-f76ea9498e72?w=600&q=80" },
    { id: "j9", title: "Packaging & Dispatch", step_order: 9, image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80" },
  ],
  collections: [
    { id: "dc1", name: "Evening Wear", slug: "evening-wear", cover_image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80", description: "Bespoke evening attire" },
    { id: "dc2", name: "Bridal Collection", slug: "bridal", cover_image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80", description: "Custom bridal & groom" },
    { id: "dc3", name: "Corporate Uniforms", slug: "corporate", cover_image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80", description: "Corporate identity" },
    { id: "dc4", name: "Heritage Archive", slug: "heritage", cover_image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80", description: "Preservation projects" },
  ],
};

function GsapNumber({ value, suffix = "" }: { value: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const num = parseInt(value);
    if (isNaN(num)) return;
    const el = ref.current;
    if (!el) return;
    let obj = { val: 0 };
    gsap.to(obj, {
      val: num, duration: 2, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
      onUpdate: () => { el.textContent = Math.round(obj.val) + suffix; },
    });
  }, [value, suffix]);
  return <span ref={ref}>{value}</span>;
}

export default function Home() {
  useEffect(() => { document.title = "Ascot Fashions — Bespoke Craftsmanship"; }, []);
  const { data: content } = useQuery({ queryKey: ["website_content"], queryFn: () => getWebsiteContent() });
  const { data: featuredColl = [] } = useQuery({ queryKey: ["collections", "featured"], queryFn: () => getFeaturedCollections() });
  const { data: journeySteps = [] } = useQuery({ queryKey: ["journey_steps"], queryFn: () => getJourneySteps() });
  const { data: videos = [] } = useQuery({ queryKey: ["videos"], queryFn: () => getVideos() });
  const { data: featuredVids = [] } = useQuery({ queryKey: ["videos", "featured"], queryFn: () => getFeaturedVideos() });

  const c = content ?? {};
  const hero = { ...DEMO.hero, ...(c.hero ?? {}) };
  const about = { ...DEMO.about, ...(c.about ?? {}) };
  const process = { ...DEMO.process, ...(c.process ?? {}) };
  const testimonials = c.testimonials?.items?.length ? c.testimonials.items : DEMO.testimonials;
  const contact = { ...DEMO.contact, ...(c.contact ?? {}) };
  const colls = featuredColl.length > 0 ? featuredColl : DEMO.collections;
  const jSteps = journeySteps.length > 0 ? journeySteps : DEMO.journey;
  const displayVideos = featuredVids.length > 0 ? featuredVids : videos;
  const showVids = displayVideos.length > 0 ? displayVideos : DEMO.videos;

  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  const sv = { hidden: { opacity: 0, y: 60 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: i * 0.15, ease: "easeOut" as const } }) };

  return (
    <div>
      {/* ══════ HERO (cinematic) ══════ */}
      <section ref={heroRef} className="relative h-screen flex items-center overflow-hidden">
        <motion.div style={{ scale: heroScale }} className="absolute inset-0 -z-10">
          {hero.video_url ? (
            <video src={hero.video_url} autoPlay muted loop playsInline className="h-full w-full object-cover" />
          ) : (
            <img src={hero.image || DEMO.hero.image} alt="" className="h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/10 to-transparent" />
        </motion.div>
        <div className="container-x relative z-10 pb-20 md:pb-32">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            {hero.eyebrow && <span className="inline-block text-[10px] uppercase tracking-[0.5em] text-background/70 mb-6 border-b border-accent/40 pb-2">{hero.eyebrow}</span>}
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }} className="max-w-4xl font-display text-5xl leading-[1.05] md:text-8xl text-background">{hero.title}</motion.h1>
          {hero.subtitle && <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.4 }} className="mt-6 max-w-xl text-base text-background/75 md:text-lg leading-relaxed">{hero.subtitle}</motion.p>}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }} className="mt-10 flex flex-wrap gap-4">
            <Button asChild size="lg" className="rounded-none bg-accent text-accent-foreground hover:bg-accent/90 text-sm uppercase tracking-[0.15em] px-8">
              <Link href={hero.cta === "Explore collections" ? "/collections" : "/contact"}>{hero.cta}<ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <ChevronDown className="h-6 w-6 text-background/50 animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* ══════ COMPANY INTRODUCTION + STATS ══════ */}
      <section className="container-x py-28 md:py-40">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}>
            {about.eyebrow && <p className="text-xs uppercase tracking-[0.4em] text-accent/80">{about.eyebrow}</p>}
            <h2 className="mt-6 font-display text-4xl md:text-5xl leading-tight">{about.title}</h2>
            <div className="h-px w-14 bg-accent/40 my-8" />
            {about.body && <p className="text-lg leading-relaxed text-muted-foreground max-w-xl">{about.body}</p>}
            <Button asChild variant="link" className="mt-8 h-auto p-0 text-accent text-sm uppercase tracking-widest group">
              <Link href="/about">Read our story <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /></Link>
            </Button>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}>
            <div className="grid grid-cols-2 gap-8">
              {(about.stats || []).map((s: any, i: number) => (
                <motion.div key={i} whileHover={{ y: -4 }} className="border border-border/60 p-6 text-center bg-card/50 backdrop-blur-sm">
                  <div className="font-display text-3xl md:text-4xl text-accent"><GsapNumber value={s.key} /></div>
                  <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground/70">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════ COLLECTIONS PREVIEW ══════ */}
      <section className="container-x pb-28 md:pb-40">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sv} custom={0}>
          <p className="text-xs uppercase tracking-[0.4em] text-accent/80 text-center">Collections</p>
          <h2 className="mt-4 font-display text-4xl md:text-5xl text-center">Browse our work</h2>
        </motion.div>
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {colls.slice(0, 4).map((col: any, i: number) => (
            <Link key={col.id} href={`/collections/${col.slug}`}>
              <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }} whileHover={{ y: -6 }} className="group relative aspect-[3/4] overflow-hidden bg-muted">
                {col.cover_image ? (
                  <img src={col.cover_image} alt={col.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground/40 text-xs">No image</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-display text-xl text-white">{col.name}</h3>
                  {col.description && <p className="mt-1 text-xs text-white/60">{col.description}</p>}
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-12">
          <Button asChild variant="outline" className="rounded-none text-xs uppercase tracking-widest">
            <Link href="/collections">View all collections <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* ══════ JOURNEY PREVIEW ══════ */}
      {jSteps.length > 0 && (
        <section className="bg-secondary/40 py-28 md:py-40">
          <div className="container-x">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sv} custom={0}>
              <p className="text-xs uppercase tracking-[0.4em] text-accent/80 text-center">Our process</p>
              <h2 className="mt-4 font-display text-4xl md:text-5xl text-center">The craftsmanship journey</h2>
            </motion.div>
            <div className="mt-16 grid gap-4 md:grid-cols-4">
              {jSteps.slice(0, 4).map((step: any, i: number) => (
                <motion.div key={step.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.12 }} whileHover={{ y: -6 }} className="group relative aspect-square overflow-hidden bg-muted">
                  {step.image ? (
                    <img src={step.image} alt={step.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground/40 text-xs">No image</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="text-[10px] uppercase text-accent/80">Step {String(step.step_order).padStart(2, '0')}</span>
                    <h3 className="font-display text-base text-white">{step.title}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Button asChild variant="outline" className="rounded-none text-xs uppercase tracking-widest">
                <Link href="/journey">See full journey <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ══════ MANUFACTURING STRENGTH ══════ */}
      <section className="container-x py-28 md:py-40">
        {process.eyebrow && <p className="text-xs uppercase tracking-[0.4em] text-accent/80 text-center">{process.eyebrow}</p>}
        <h2 className="mt-4 font-display text-4xl md:text-5xl text-center">{process.title}</h2>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {process.pillars.map((p: any, i: number) => {
            const Icon = { Leaf: Leaf, Scissors: Scissors, Award: Award, Sparkles: Sparkles }[p.icon as string] ?? Sparkles;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }} whileHover={{ y: -4 }} className="border border-border/60 p-8 text-center bg-card/50 backdrop-blur-sm">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-6"><Icon className="h-6 w-6 text-accent" /></div>
                <h3 className="font-display text-lg">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ══════ VIDEOS ══════ */}
      {showVids.length > 0 && (
        <section className="container-x pb-28 md:pb-40">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sv} custom={0}>
            <p className="text-xs uppercase tracking-[0.4em] text-accent/80 text-center">Videos</p>
            <h2 className="mt-4 font-display text-4xl md:text-5xl text-center">Watch our work</h2>
          </motion.div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {showVids.slice(0, 3).map((v: any, i: number) => (
              <motion.div key={v.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}>
                <div className="aspect-video overflow-hidden bg-muted relative group cursor-pointer" onClick={() => setPlayingVideo(v.id === playingVideo ? null : v.id)}>
                  {playingVideo === v.id ? (
                    <video src={v.url} controls autoPlay className="h-full w-full" />
                  ) : (
                    <>
                      {v.thumbnail ? <img src={v.thumbnail} alt={v.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      : <div className="h-full flex items-center justify-center text-muted-foreground/40 text-xs">No thumbnail</div>}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                        <div className="w-16 h-16 rounded-full bg-accent/90 flex items-center justify-center group-hover:scale-110 transition-transform"><Play className="h-7 w-7 text-accent-foreground ml-0.5" /></div>
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-4">
                  <h3 className="font-display text-lg">{v.title}</h3>
                  {v.description && <p className="mt-1 text-sm text-muted-foreground">{v.description}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ══════ TESTIMONIALS ══════ */}
      {testimonials.length > 0 && (
        <section className="bg-secondary/40 py-28 md:py-40">
          <div className="container-x">
            <p className="text-xs uppercase tracking-[0.4em] text-accent/80 text-center">Global trust</p>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {testimonials.map((t: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.12 }} whileHover={{ y: -3 }} className="border border-border/60 p-8 bg-card/50 backdrop-blur-sm">
                  <Quote className="h-8 w-8 text-accent/30 mb-4" />
                  <blockquote className="font-display text-lg leading-relaxed text-foreground/90">&ldquo;{t.quote}&rdquo;</blockquote>
                  <div className="mt-8 pt-5 border-t border-border/40 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-medium text-accent">{t.name.charAt(0)}</div>
                    <div>
                      <div className="text-xs font-medium">{t.name}</div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60">{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════ CONTACT CTA ══════ */}
      <section className="relative py-32 md:py-48 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-foreground via-foreground to-foreground/95" />
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-accent/[0.04] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/[0.03] rounded-full blur-3xl" />
        <div className="container-x relative">
          <div className="max-w-2xl mx-auto text-center">
            {contact.eyebrow && <p className="text-xs uppercase tracking-[0.4em] text-accent/70">{contact.eyebrow}</p>}
            <h2 className="mt-6 font-display text-4xl md:text-6xl text-background leading-tight">{contact.title}</h2>
            {contact.body && <p className="mt-6 text-lg text-background/60 leading-relaxed">{contact.body}</p>}
            <motion.div whileHover={{ scale: 1.02 }} className="mt-12">
              <Button asChild size="lg" className="rounded-none bg-accent text-accent-foreground hover:bg-accent/90 text-sm uppercase tracking-[0.15em] px-10 py-6 h-auto">
                <Link href="/contact">{contact.cta || "Get in touch"} <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
