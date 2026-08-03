"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Sparkles, Award, Scissors, Crown, ArrowRight, ShieldCheck, Gem } from "lucide-react";
import { getWebsiteContent } from "@/lib/actions";
import { TextReveal } from "@/components/layout/TextReveal";
import { ParallaxImage } from "@/components/layout/ParallaxImage";
import { GsapCounter } from "@/components/layout/GsapCounter";
import { Tilt3DCard } from "@/components/layout/Tilt3DCard";
import { SvgMorphDivider } from "@/components/layout/SvgMorphDivider";
import { Particles } from "@/components/layout/Particles";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/layout/Magnetic";

const DEMO_IMG = "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=80";
const DEMO = {
  title: "Four decades of tailoring excellence.",
  subtitle: "From our founding in 1985 to our atelier on Savile Row, every garment tells a story of precision and passion.",
  image: DEMO_IMG,
  body1: "Ascotex Fashions was founded by master tailor William Ascotex, who apprenticed on Savile Row before opening his own atelier. His vision was simple: create garments that honour the traditions of British tailoring while embracing modern silhouettes and sensibilities.",
  body2: "Today, our team of twelve master tailors continues this legacy. Each garment passes through dozens of hands — from pattern cutter to finisher — before it reaches our fitting rooms. We believe that clothing should not just fit, but feel like it belongs to you.",
  body3: "We serve clients from London to Tokyo, creating everything from business suits and evening wear to casual jackets and overcoats. Every commission is treated with the same attention to detail that has defined our house for four decades.",
  stats: [
    { key: "40+", label: "Years of Craft" },
    { key: "12", label: "Master Tailors" },
    { key: "5,000+", label: "Garments Crafted" },
  ],
};

const PILLARS = [
  {
    icon: Scissors,
    title: "Bespoke Precision",
    desc: "Over 80 individual anatomical measurements taken to craft a unique paper pattern exclusive to your body.",
  },
  {
    icon: Gem,
    title: "Artisanal Embroidery",
    desc: "Intricate hand-stitching, zari wirework, and precious beadwork crafted by master artisans with decades of experience.",
  },
  {
    icon: Award,
    title: "Timeless Heritage",
    desc: "Four decades of tailoring traditions honoring classic Savile Row techniques paired with modern silhouettes.",
  },
];

export default function About() {
  useEffect(() => { document.title = "About Atelier — Ascotex Fashions"; }, []);
  const { data: content } = useQuery({ queryKey: ["website_content"], queryFn: () => getWebsiteContent() });
  const page = { ...DEMO, ...(content?.about_page ?? {}) };

  const sectionVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, delay: i * 0.12, ease: "easeOut" as const },
    }),
  };

  return (
    <div className="relative overflow-x-hidden bg-background text-foreground">
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-24 left-1/4 h-[32rem] w-[32rem] rounded-full bg-gold/[0.08] blur-3xl animate-glow" />
        <div className="absolute top-1/2 right-1/4 h-[30rem] w-[30rem] rounded-full bg-gold-deep/[0.07] blur-3xl animate-glow-slow" />
      </div>

      {/* Floating Gold Particles Canvas */}
      <Particles count={55} className="opacity-50 pointer-events-none" />

      {/* ── Header / Hero ── */}
      <section className="relative container-x pt-32 pb-14 md:pt-44 md:pb-20 overflow-hidden">
        <motion.div initial="hidden" animate="visible" custom={0} variants={sectionVariant} className="relative z-10 max-w-4xl">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-gold font-medium mb-3">
            <Sparkles className="h-3.5 w-3.5 text-gold" /> Our Heritage &amp; Legacy
          </p>
          <div className="font-script text-3xl md:text-5xl text-champagne/95 italic mb-2">The Legacy of Ascotex</div>
          <h1 className="font-display text-3xl sm:text-5xl leading-[1.05] md:text-7xl">
            <TextReveal text={page.title} />
          </h1>

          <div className="mt-8 flex flex-wrap gap-3">
            {[{ label: "Est. 1985" }, { label: "Savile Row Atelier" }, { label: "Haute Couture" }].map((tag) => (
              <span
                key={tag.label}
                className="rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-[10px] uppercase tracking-widest text-gold font-medium shadow-sm"
              >
                {tag.label}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Parallax Image Showcase ── */}
      {page.image && (
        <section className="relative w-full overflow-hidden border-y border-gold/25 shadow-2xl">
          <ParallaxImage className="w-full h-[55vh] md:h-[72vh]" speed={12}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={page.image} alt="Ascotex Fashions Atelier" className="h-full w-full object-cover filter brightness-95" />
          </ParallaxImage>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50 pointer-events-none" />
          <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 pointer-events-none border border-gold/40 bg-black/70 backdrop-blur-md px-5 py-2.5 rounded-full text-[10px] uppercase tracking-[0.25em] text-gold font-medium">
            Savile Row Atelier · Crafting Excellence
          </div>
        </section>
      )}

      {/* ── Story Content Grid ── */}
      <section className="container-x py-24 md:py-36">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={sectionVariant} className="grid gap-16 md:grid-cols-2 md:gap-24 items-start">
          {/* Left Column: Quote & Highlights */}
          <div className="space-y-8">
            {page.subtitle && (
              <div className="relative rounded-2xl border border-gold/30 bg-black/40 backdrop-blur-xl p-8 shadow-xl">
                <div className="text-4xl text-gold/40 font-display font-bold leading-none mb-2">&ldquo;</div>
                <p className="text-xl md:text-2xl text-champagne leading-relaxed font-display italic">
                  {page.subtitle}
                </p>
                <div className="mt-6 flex items-center gap-3 pt-4 border-t border-border/40 text-xs uppercase tracking-[0.25em] text-gold font-medium">
                  <Crown className="h-4 w-4 text-gold" />
                  <span>Savile Row Atelier Heritage</span>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border/50 bg-secondary/20 p-5">
                <ShieldCheck className="h-6 w-6 text-gold mb-2" />
                <div className="text-sm font-display text-foreground font-medium">100% Hand-Tailored</div>
                <div className="text-xs text-muted-foreground font-light mt-1">Every seam hand-stitched by senior artisans.</div>
              </div>
              <div className="rounded-xl border border-border/50 bg-secondary/20 p-5">
                <Gem className="h-6 w-6 text-gold mb-2" />
                <div className="text-sm font-display text-foreground font-medium">Bespoke Fitting</div>
                <div className="text-xs text-muted-foreground font-light mt-1">Private fitting appointments worldwide.</div>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative Story */}
          <div className="space-y-6 text-base md:text-lg leading-relaxed text-muted-foreground font-light">
            {page.body1 && (
              <p className="first-letter:text-5xl first-letter:font-display first-letter:text-gold first-letter:mr-3 first-letter:float-left first-letter:leading-none">
                {page.body1}
              </p>
            )}
            {page.body2 && <p>{page.body2}</p>}
            {page.body3 && <p>{page.body3}</p>}
          </div>
        </motion.div>
      </section>

      {/* ── Brand Pillars & Craftsmanship Values ── */}
      <section className="relative container-x pb-24 md:pb-36">
        <div className="text-center max-w-xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-[0.4em] text-gold font-medium mb-2">Our House Philosophy</p>
          <h2 className="font-display text-3xl sm:text-4xl text-foreground">The Three Pillars of Ascotex</h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <Tilt3DCard key={i} maxTilt={6} scaleOnHover={1.03}>
                <div className="group h-full rounded-2xl border border-gold/25 bg-black/40 backdrop-blur-xl p-8 transition-all duration-500 hover:border-gold/60 hover:shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                  <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-6 transition-colors group-hover:bg-gold group-hover:text-black">
                    <Icon className="h-6 w-6 text-gold group-hover:text-black transition-colors" />
                  </div>
                  <h3 className="font-display text-2xl text-foreground font-normal group-hover:text-gold transition-colors">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed font-light">
                    {p.desc}
                  </p>
                </div>
              </Tilt3DCard>
            );
          })}
        </div>
      </section>

      {/* SVG Morphing Divider */}
      <SvgMorphDivider />

      {/* ── Stats Showcase (3D Cards) ── */}
      {page.stats && page.stats.length > 0 && (
        <section className="relative bg-secondary/30 py-24 md:py-36 overflow-hidden border-t border-border/30">
          <div className="absolute inset-0 bg-grain pointer-events-none opacity-40" />
          <div className="container-x relative">
            <p className="text-xs uppercase tracking-[0.4em] text-gold text-center font-medium mb-12">By The Numbers</p>
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
              {page.stats.map((s: any, i: number) => (
                <Tilt3DCard key={i} maxTilt={10} scaleOnHover={1.04}>
                  <div className="h-full rounded-2xl border border-gold/25 bg-black/50 backdrop-blur-md p-8 text-center shadow-xl transition-all duration-500 hover:border-gold/60 hover:shadow-[0_0_25px_rgba(212,175,55,0.2)]">
                    <div className="font-display text-4xl md:text-6xl text-gradient-gold">
                      <GsapCounter value={s.key} />
                    </div>
                    <div className="mt-3 text-xs uppercase tracking-[0.25em] text-muted-foreground font-light">{s.label}</div>
                    <div className="mx-auto mt-6 h-0.5 w-12 bg-gold/50 rounded-full" />
                  </div>
                </Tilt3DCard>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Consultation CTA Banner ── */}
      <section className="relative py-28 overflow-hidden bg-black border-t border-border/30">
        <div className="container-x relative text-center max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center mx-auto mb-6">
            <Crown className="h-6 w-6 text-gold" />
          </div>
          <p className="text-xs uppercase tracking-[0.4em] text-gold font-medium">Bespoke Tailoring</p>
          <h2 className="mt-4 font-display text-4xl md:text-6xl text-foreground leading-tight">
            Book a Fitting Consultation
          </h2>
          <p className="mt-6 text-base md:text-lg text-muted-foreground leading-relaxed font-light">
            Experience four decades of artisanal tailoring excellence. Schedule a private consultation with our master artisans.
          </p>
          <Magnetic className="mt-10 inline-block">
            <Button asChild size="lg" className="rounded-full bg-accent text-accent-foreground hover:bg-gold hover:text-black text-xs uppercase tracking-[0.2em] px-10 py-6 h-auto shadow-[0_0_35px_rgba(212,175,55,0.35)] transition-all">
              <Link href="/contact">
                Schedule Fitting <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Magnetic>
        </div>
      </section>
    </div>
  );
}
