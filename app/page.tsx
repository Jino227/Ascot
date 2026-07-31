"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from "motion/react";
import { ArrowRight, Play, X, Award, Leaf, Scissors, Sparkles, ChevronDown, Quote, Gem, Crown } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getWebsiteContent, getFeaturedCollections, getVideos, getFeaturedVideos, getJourneySteps, getPublicDesigns, getPublicCelebrities } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { TextReveal } from "@/components/layout/TextReveal";
import { Magnetic } from "@/components/layout/Magnetic";
import { Reveal } from "@/components/layout/Reveal";
import { Particles } from "@/components/layout/Particles";
import { FloatingGlass } from "@/components/layout/FloatingGlass";
import { GsapCounter } from "@/components/layout/GsapCounter";

gsap.registerPlugin(ScrollTrigger);

// ── Hero slide type ──
interface HeroSlide {
  type: "image" | "video";
  url: string;
  alt?: string;
}

// ── Demo data ──
const DEMO = {
  hero: { eyebrow: "Est. 1985", title: "Where craftsmanship meets contemporary style.", subtitle: "Bespoke tailoring and ready-to-wear collections crafted for those who value precision, quality, and timeless design.", cta: "Explore collections", cta_url: "/collections", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=2000&q=80", video_url: "", slides: [] as HeroSlide[] },
  about: { eyebrow: "Our Heritage", title: "Four decades of tailoring excellence.", body: "Founded in 1985, Ascot Fashions began as a small tailoring atelier with a commitment to exceptional craftsmanship. Today we create bespoke and ready-to-wear garments for discerning clients worldwide.", stats: [{ key: "40+", label: "Years" }, { key: "200+", label: "Artisans" }, { key: "50+", label: "Export countries" }, { key: "10K+", label: "Garments/year" }] },
  process: {
    eyebrow: "Our Manufacturing Strength", title: "From design to dispatch.", pillars: [
      { icon: "Sparkles", title: "Design Studio", body: "Creative designers transform concepts into embroidery-ready artwork." },
      { icon: "Scissors", title: "Sampling", body: "Rapid prototyping with meticulous attention to detail." },
      { icon: "Award", title: "Embroidery", body: "Master craftsmen with decades of stitching expertise." },
      { icon: "Leaf", title: "Production", body: "Scalable manufacturing with consistent quality." },
      { icon: "Sparkles", title: "Quality Control", body: "Detailed inspection for stitches, beads and finishing." },
      { icon: "Leaf", title: "Packaging", body: "Carefully packed and shipped worldwide." },
    ]
  },
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
  designs: [
    { id: "dd1", url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80" },
    { id: "dd2", url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80" },
    { id: "dd3", url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80" },
    { id: "dd4", url: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80" },
  ]
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

// ── HeroCarousel ─────────────────────────────────────────────────────────────
const CAROUSEL_INTERVAL = 5000;

function HeroCarousel({ slides, fallbackImage }: { slides: HeroSlide[]; fallbackImage: string }) {
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = useCallback(() => {
    setActive((a) => {
      const next = (a + 1) % slides.length;
      setPrev(a);
      return next;
    });
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    timerRef.current = setInterval(advance, CAROUSEL_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [advance, slides.length]);

  function goTo(idx: number) {
    if (timerRef.current) clearInterval(timerRef.current);
    setPrev(active);
    setActive(idx);
    timerRef.current = setInterval(advance, CAROUSEL_INTERVAL);
  }

  // Single fallback
  if (slides.length === 0) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={fallbackImage} alt="" className="h-full w-full object-cover" />
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence initial={false}>
        {slides.map((slide, idx) =>
          idx === active ? (
            <motion.div
              key={`${slide.url}-${idx}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              {slide.type === "video" ? (
                <video
                  src={slide.url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={slide.url}
                  alt={slide.alt ?? ""}
                  className="h-full w-full object-cover"
                />
              )}
            </motion.div>
          ) : null
        )}
      </AnimatePresence>

      {/* Dot navigation — only shown for multiple slides */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${idx === active
                ? "w-8 bg-foreground/90"
                : "w-1.5 bg-foreground/40 hover:bg-foreground/60"
                }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  useEffect(() => { document.title = "Ascot Fashions — Bespoke Craftsmanship"; }, []);
  const { user } = useAuth();
  const { data: content } = useQuery({ queryKey: ["website_content"], queryFn: () => getWebsiteContent() });
  const { data: featuredColl = [] } = useQuery({ queryKey: ["collections", "featured"], queryFn: () => getFeaturedCollections() });
  const { data: journeySteps = [] } = useQuery({ queryKey: ["journey_steps"], queryFn: () => getJourneySteps() });
  const { data: celebrities = [] } = useQuery({ queryKey: ["public", "celebrities"], queryFn: () => getPublicCelebrities() });
  const { data: videos = [] } = useQuery({ queryKey: ["videos"], queryFn: () => getVideos() });
  const { data: featuredVids = [] } = useQuery({ queryKey: ["videos", "featured"], queryFn: () => getFeaturedVideos() });
  const { data: designImages = [] } = useQuery({ queryKey: ["designs", "public", "preview"], queryFn: () => getPublicDesigns(12) });

  const c = content ?? {};
  const rawHero = c.hero ?? {};
  const hero = { ...DEMO.hero, ...rawHero };

  // Build slides array: prefer hero.slides[], fall back to legacy video_url / image
  const heroSlides: HeroSlide[] = (() => {
    const s = Array.isArray(rawHero.slides) ? rawHero.slides as HeroSlide[] : [];
    if (s.length > 0) return s;
    if (hero.video_url) return [{ type: "video" as const, url: hero.video_url }];
    if (rawHero.image) return [{ type: "image" as const, url: rawHero.image }];
    return []; // triggers fallback to DEMO.hero.image
  })();
  const about = { ...DEMO.about, ...(c.about ?? {}) };
  const process = { ...DEMO.process, ...(c.process ?? {}) };
  const testimonials = c.testimonials?.items?.length ? c.testimonials.items : DEMO.testimonials;
  const contact = { ...DEMO.contact, ...(c.contact ?? {}) };
  const jSteps = journeySteps.length > 0 ? journeySteps : DEMO.journey;
  const displayVideos = featuredVids.length > 0 ? featuredVids : videos;
  const showVids = displayVideos.length > 0 ? displayVideos : DEMO.videos;

  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  // ── Mouse parallax for hero ──
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const bgX = useTransform(sx, [-0.5, 0.5], ["-12px", "12px"]);
  const bgY = useTransform(sy, [-0.5, 0.5], ["-12px", "12px"]);
  const textX = useTransform(sx, [-0.5, 0.5], ["6px", "-6px"]);
  const textY = useTransform(sy, [-0.5, 0.5], ["6px", "-6px"]);

  function onHeroMouse(e: React.MouseEvent) {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  const sv = { hidden: { opacity: 0, y: 60 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: i * 0.15, ease: "easeOut" as const } }) };

  return (
    <div>
      {/* ══════ HERO (cinematic) ══════ */}
      <section ref={heroRef} onMouseMove={onHeroMouse} className="relative h-screen flex items-center overflow-hidden">
        <motion.div style={{ scale: heroScale, x: bgX, y: bgY }} className="absolute inset-0 -z-10">
          <HeroCarousel slides={heroSlides} fallbackImage={DEMO.hero.image} />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
        </motion.div>

        {/* Gold dust particles */}
        <Particles count={90} className="z-[5] opacity-70" />

        {/* Floating glass badges */}
        <FloatingGlass float="animate-float" className="absolute right-[6%] top-[20%] z-20 hidden lg:block" delay={0.4}>
          <div className="px-6 py-5 text-center">
            <Gem className="mx-auto h-5 w-5 text-gold" />
            <div className="mt-2 font-display text-2xl">40+</div>
            <div className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Years of craft</div>
          </div>
        </FloatingGlass>
        <FloatingGlass float="animate-float-reverse" className="absolute right-[16%] bottom-[24%] z-20 hidden lg:block" delay={0.7}>
          <div className="px-6 py-5 text-center">
            <Crown className="mx-auto h-5 w-5 text-gold" />
            <div className="mt-2 font-display text-2xl">5,000+</div>
            <div className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Garments crafted</div>
          </div>
        </FloatingGlass>

          <motion.div style={{ x: textX, y: textY }} className="container-x relative z-10 pb-20 md:pb-32">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            {hero.eyebrow && <span className="inline-block text-[10px] uppercase tracking-[0.5em] text-foreground/70 mb-6 border-b border-accent/40 pb-2">{hero.eyebrow}</span>}
          </motion.div>
          <div className="mb-2 font-script text-3xl md:text-4xl text-champagne/90 italic">Crafted with passion</div>
          <h1 className="max-w-4xl font-display text-5xl leading-[1.05] md:text-8xl text-foreground">
            <TextReveal text={hero.title} delay={0.15} />
          </h1>
          {hero.subtitle && <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.6 }} className="mt-6 max-w-xl text-base text-foreground/75 md:text-lg leading-relaxed">{hero.subtitle}</motion.p>}
          {/* <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }} className="mt-10 flex flex-wrap gap-4">
            <Button asChild size="lg" className="rounded-none bg-accent text-accent-foreground hover:bg-accent/90 text-sm uppercase tracking-[0.15em] px-8">
              <Link href={hero.cta_url || (hero.cta === "Explore collections" ? "/collections" : "/contact")}>{hero.cta}<ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </motion.div> */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <ChevronDown className="h-6 w-6 text-foreground/50 animate-bounce" />
          </motion.div>
        </motion.div>
      </section>

      {/* ══════ MARQUEE BAND ══════ */}
      <div className="relative overflow-hidden border-y border-gold/20 bg-gradient-to-r from-espresso via-charcoal to-espresso py-5">
        <div className="flex w-max animate-marquee gap-0" style={{ ["--marquee-duration" as any]: "28s" }}>
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center gap-0">
              {["Hand Embroidery", "Bespoke Tailoring", "Premium Fabrics", "Made to Measure", "Since 1985", "Worldwide Delivery"].map((word) => (
                <span key={word + dup} className="flex items-center gap-8 px-8 text-sm uppercase tracking-[0.3em] text-champagne/80">
                  {word}
                  <span className="h-1 w-1 rounded-full bg-gold" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ══════ COMPANY INTRODUCTION + STATS ══════ */}
      <section className="container-x py-28 md:py-40">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}>
            {about.eyebrow && <p className="text-xs uppercase tracking-[0.4em] text-accent/80">{about.eyebrow}</p>}
            <h2 className="mt-6 font-display text-4xl md:text-5xl leading-tight">{about.title}</h2>
            <div className="h-px w-14 bg-accent/40 my-8" />
            {about.body && <p className="text-lg leading-relaxed text-muted-foreground max-w-xl">{about.body}</p>}
            <Magnetic>
              <Button asChild variant="link" className="mt-8 h-auto p-0 text-accent text-sm uppercase tracking-widest group">
                <Link href="/about">Read our story <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /></Link>
              </Button>
            </Magnetic>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}>
            <div className="grid grid-cols-2 gap-8">
              {(about.stats || []).map((s: any, i: number) => (
                <FloatingGlass key={i} className={i % 2 ? "animate-float-reverse" : "animate-float"} delay={i * 0.1}>
                  <div className="group px-6 py-8 text-center">
                    <div className="font-display text-3xl md:text-4xl text-gradient-gold"><GsapCounter value={s.key} /></div>
                    <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground/80">{s.label}</div>
                    <div className="mx-auto mt-4 h-px w-0 bg-gold/50 transition-all duration-700 group-hover:w-12" />
                  </div>
                </FloatingGlass>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════ DESIGNS PREVIEW ══════ */}
      <section className="container-x pb-28 md:pb-40">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sv} custom={0}>
          <p className="text-xs uppercase tracking-[0.4em] text-accent/80 text-center">Designs &amp; Collections</p>
          <h2 className="mt-4 font-display text-4xl md:text-5xl text-center">Our work</h2>
          <p className="mt-4 text-center text-sm text-muted-foreground">Public designs — click any image to view full size.</p>
        </motion.div>

        {designImages.length > 0 ? (
          <div className="mt-14 columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
            {designImages.slice(0, 12).map((img: any, i: number) => (
              <motion.div
                key={img.id ?? i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: (i % 6) * 0.07 }}
                className="break-inside-avoid group relative overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.alt ?? ""}
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />
              </motion.div>
            ))}
          </div>
        ) : (
          /* Fallback when no images uploaded yet — show demo designs */
          <div className="mt-14 columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
            {DEMO.designs.map((img, i) => (
              <div key={img.id} className="break-inside-avoid group relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="w-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        )}

        {/* View all */}
        <div className="text-center mt-14">
          <Button asChild variant="outline" className="rounded-none text-xs uppercase tracking-widest">
            <Link href="/designs">View all designs <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* ══════ OUR STORY ══════ */}
      {c.our_story?.content && (
        <section className="container-x py-20 md:py-32">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sv} custom={0} className="max-w-4xl mx-auto">
            <p className="text-xs uppercase tracking-[0.4em] text-accent/80 text-center">Our Story</p>
            <div className="mt-12 text-base md:text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {c.our_story.content}
            </div>
          </motion.div>
        </section>
      )}

      {/* ══════ JOURNEY PREVIEW ══════ */}
      {jSteps.length > 0 && (
        <section className="relative bg-secondary/40 py-28 md:py-40 overflow-hidden">
          <div className="absolute inset-0 bg-grain pointer-events-none" />
          <div className="container-x relative">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sv} custom={0}>
              <p className="text-xs uppercase tracking-[0.4em] text-accent/80 text-center">Our process</p>
              <h2 className="mt-4 font-display text-4xl md:text-5xl text-center">The Journey.</h2>
            </motion.div>
            <div className="mt-16 grid gap-4 md:grid-cols-4">
              {jSteps.slice(0, 8).map((step: any, i: number) => (
                <motion.div
                  key={step.id || i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (i % 4) * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-border/40 card-hover"
                >
                  {step.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={step.image} alt="" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground/40 text-xs">No image</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="absolute bottom-4 left-4 font-display text-4xl text-foreground/90 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-3 group-hover:translate-y-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
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

      {/* ══════ CELEBRITY SHOWCASE ══════ */}
      {celebrities.length > 0 && (
        <section className="py-28 md:py-40">
          <div className="container-x">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sv} custom={0}>
              <p className="text-xs uppercase tracking-[0.4em] text-accent/80 text-center">Spotted</p>
              <h2 className="mt-4 font-display text-4xl md:text-5xl text-center">Celebrity Showcase</h2>
            </motion.div>
            <div className="mt-16 grid gap-8 md:gap-12 md:grid-cols-3 lg:grid-cols-4">
              {celebrities.map((c: any, i: number) => (
                <motion.div
                  key={c.id || i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: (i % 4) * 0.1 }}
                  className="group flex flex-col"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-4 border border-border/40">
                    {c.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.image} alt={c.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground/40 text-xs">No image</div>
                    )}
                  </div>
                  <h3 className="font-display text-xl">{c.name}</h3>
                  {c.description && <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>}
                </motion.div>
              ))}
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
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }} whileHover={{ y: -6 }} className="group glass rounded-lg p-8 text-center card-hover">
                <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-6 overflow-hidden">
                  <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/15 transition-colors duration-500 rounded-full" />
                  <Icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-display text-lg">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ══════ TESTIMONIALS ══════ */}
      {testimonials.length > 0 && (
        <section className="relative bg-secondary/40 py-28 md:py-40 overflow-hidden">
          <div className="absolute inset-0 bg-grain pointer-events-none" />
          <div className="container-x relative">
            <p className="text-xs uppercase tracking-[0.4em] text-accent/80 text-center">Global trust</p>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {testimonials.map((t: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.12 }} whileHover={{ y: -4 }} className="glass rounded-lg p-8 card-hover">
                  <Quote className="h-8 w-8 text-gold/40 mb-4" />
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
      <section className="relative py-32 md:py-48 overflow-hidden bg-grain">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-ink via-espresso to-ink" />
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-gold/[0.07] rounded-full blur-3xl animate-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold-deep/[0.06] rounded-full blur-3xl animate-glow-slow" />
        <Particles count={60} className="opacity-60" />
        <div className="container-x relative">
          <div className="max-w-2xl mx-auto text-center">
            {contact.eyebrow && <p className="text-xs uppercase tracking-[0.4em] text-accent/70">{contact.eyebrow}</p>}
            <h2 className="mt-6 font-display text-4xl md:text-6xl text-foreground leading-tight text-balance">{contact.title}</h2>
            {contact.body && <p className="mt-6 text-lg text-foreground/60 leading-relaxed">{contact.body}</p>}
            <Magnetic className="mt-12">
              <Button asChild size="lg" className="rounded-none bg-accent text-accent-foreground hover:bg-accent/90 text-sm uppercase tracking-[0.15em] px-10 py-6 h-auto shadow-[0_0_30px_rgba(212,175,55,0.35)]">
                <Link href="/contact">{contact.cta || "Get in touch"} <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </Magnetic>
          </div>
        </div>
      </section>
    </div>
  );
}
