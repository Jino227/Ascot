"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, Award, Scissors, Crown } from "lucide-react";
import { getWebsiteContent } from "@/lib/actions";
import { TextReveal } from "@/components/layout/TextReveal";
import { ParallaxImage } from "@/components/layout/ParallaxImage";
import { GsapCounter } from "@/components/layout/GsapCounter";
import { Tilt3DCard } from "@/components/layout/Tilt3DCard";
import { SvgMorphDivider } from "@/components/layout/SvgMorphDivider";
import { Particles } from "@/components/layout/Particles";

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

export default function About() {
  useEffect(() => { document.title = "About — Ascotex Fashions"; }, []);
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
      {/* ── Header / Hero ── */}
      <section className="relative container-x pt-32 pb-12 md:pt-44 md:pb-16 overflow-hidden">
        <Particles count={40} className="opacity-50" />
        <motion.div initial="hidden" animate="visible" custom={0} variants={sectionVariant} className="relative z-10 max-w-4xl">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-gold font-medium mb-4">
            <Sparkles className="h-3.5 w-3.5 text-gold" /> Our Heritage
          </p>
          <div className="font-script text-3xl md:text-4xl text-champagne/90 italic mb-2">The Legacy of Ascotex</div>
          <h1 className="font-display text-5xl leading-[1.05] md:text-7xl">
            <TextReveal text={page.title} />
          </h1>
        </motion.div>
      </section>

      {/* ── Parallax Image Showcase ── */}
      {page.image && (
        <section className="relative w-full overflow-hidden border-y border-gold/20">
          <ParallaxImage className="w-full h-[55vh] md:h-[72vh]" speed={12}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={page.image} alt="Ascotex Fashions Atelier" className="h-full w-full object-cover" />
          </ParallaxImage>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
        </section>
      )}

      {/* ── Story Content Grid ── */}
      <section className="container-x py-24 md:py-36">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={sectionVariant} className="grid gap-16 md:grid-cols-2 md:gap-20 items-start">
          <div className="space-y-6">
            {page.subtitle && (
              <p className="text-xl md:text-2xl text-champagne leading-relaxed font-display italic border-l-2 border-gold/50 pl-6 py-1">
                &ldquo;{page.subtitle}&rdquo;
              </p>
            )}
            <div className="pt-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent/80">
              <Crown className="h-4 w-4 text-gold" />
              <span>Savile Row Heritage</span>
            </div>
          </div>

          <div className="space-y-6 text-base md:text-lg leading-relaxed text-muted-foreground font-light">
            {page.body1 && <p>{page.body1}</p>}
            {page.body2 && <p>{page.body2}</p>}
            {page.body3 && <p>{page.body3}</p>}
          </div>
        </motion.div>
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
                  <div className="h-full rounded-xl border border-border/60 bg-black/40 backdrop-blur-md p-8 text-center shadow-xl transition-all duration-500 hover:border-gold/50">
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
    </div>
  );
}
