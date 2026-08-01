"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getJourneySteps } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { TextReveal } from "@/components/layout/TextReveal";
import { Magnetic } from "@/components/layout/Magnetic";
import { Particles } from "@/components/layout/Particles";
import { Tilt3DCard } from "@/components/layout/Tilt3DCard";
import { SvgMorphDivider } from "@/components/layout/SvgMorphDivider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const DEMO_STEPS = [
  { id: "js1", title: "Material Sourcing", subtitle: "Premium materials from trusted suppliers", description: "Every masterpiece begins by selecting premium fabrics, threads, beads, sequins, zari and trims from trusted suppliers. Every material is inspected before entering production.", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80", step_order: 1 },
  { id: "js2", title: "Hand Dyeing", subtitle: "Traditional colour mastery", description: "Traditional dyeing techniques produce rich colours with excellent consistency and durability, creating the perfect foundation for every garment.", image: "https://images.unsplash.com/photo-1567789884554-0b844b597180?w=1200&q=80", step_order: 2 },
  { id: "js3", title: "Design Studio", subtitle: "Concepts to embroidery-ready artwork", description: "Creative designers transform concepts into embroidery-ready artwork and sampling, working closely with clients to bring visions to life.", image: "https://images.unsplash.com/photo-1604328698692-f76ea9498e72?w=1200&q=80", step_order: 3 },
  { id: "js4", title: "Artwork Preparation", subtitle: "Designs transferred to fabric", description: "Designs are accurately transferred to fabric using precision techniques that guide every stitch with absolute accuracy.", image: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=1200&q=80", step_order: 4 },
  { id: "js5", title: "Hand Embroidery", subtitle: "Traditional craftsmanship", description: "Experienced artisans create intricate embroidery using traditional techniques passed down through generations.", image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=1200&q=80", step_order: 5 },
  { id: "js6", title: "Stitching & Production", subtitle: "Pattern to final garment", description: "Pattern making, cutting, stitching, finishing and pressing produce the final garment with meticulous attention to every detail.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80", step_order: 6 },
  { id: "js7", title: "Quality Inspection", subtitle: "Detailed quality assurance", description: "Each piece undergoes detailed inspection for stitches, beads, finishing and overall quality before approval.", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80", step_order: 7 },
  { id: "js8", title: "Final Approval", subtitle: "Senior verification", description: "Senior merchandisers verify workmanship and client specifications meet our exacting standards.", image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&q=80", step_order: 8 },
  { id: "js9", title: "Packaging & Dispatch", subtitle: "Worldwide delivery", description: "Products are carefully packed and shipped to clients around the world, ensuring they arrive in perfect condition.", image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1200&q=80", step_order: 9 },
];

function GsapReveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(el, { opacity: 0, y: 70 }, {
      opacity: 1, y: 0, duration: 1, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" },
    });
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}

export default function Journey() {
  useEffect(() => { document.title = "Our Journey — Ascotex Fashions"; }, []);
  const { data: steps = [] } = useQuery({ queryKey: ["journey_steps"], queryFn: () => getJourneySteps() });
  const displaySteps = steps.length > 0 ? steps : DEMO_STEPS;

  return (
    <div className="relative overflow-x-hidden bg-background text-foreground">
      {/* ── Hero Section ── */}
      <section className="relative container-x pt-32 pb-16 md:pt-44 md:pb-24 overflow-hidden">
        <Particles count={40} className="opacity-50" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-gold font-medium border-b border-gold/30 pb-2">
            <Sparkles className="h-3.5 w-3.5 text-gold" /> Atelier Craftsmanship
          </p>
          <div className="font-script text-3xl md:text-4xl text-champagne/90 italic mt-3">From Concept to Creation</div>
          <h1 className="mt-2 font-display text-5xl md:text-7xl max-w-3xl leading-tight">
            <TextReveal text="The Journey." delay={0.1} />
          </h1>
          <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed font-light">
            A step-by-step visual exploration of our master tailoring techniques, artisan embroidery, and dedication to perfection.
          </p>
        </motion.div>
      </section>

      {/* SVG Morphing Divider */}
      <SvgMorphDivider />

      {/* ── Journey Sequence Timeline ── */}
      <div className="container-x pb-28 md:pb-40">
        <div className="space-y-16 md:space-y-24">
          {displaySteps.map((step: any, i: number) => {
            if (!step.image) return null;
            return (
              <GsapReveal key={step.id || i}>
                <Tilt3DCard maxTilt={5} scaleOnHover={1.02}>
                  <div className="relative w-full aspect-[4/3] md:aspect-[21/9] overflow-hidden bg-black/40 group rounded-xl border border-gold/20 shadow-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={step.image}
                      alt={step.title || "Journey step"}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-108"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    <div className="absolute inset-0 bg-black/15 group-hover:bg-transparent transition-colors duration-500" />
                    
                    <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-display text-5xl md:text-6xl text-gradient-gold font-light">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="h-0.5 w-12 bg-gold/60" />
                        </div>
                        {step.title && (
                          <h3 className="mt-2 font-display text-2xl md:text-4xl text-foreground font-normal">
                            {step.title}
                          </h3>
                        )}
                        {step.subtitle && (
                          <p className="text-xs uppercase tracking-widest text-gold/80 mt-1">
                            {step.subtitle}
                          </p>
                        )}
                      </div>
                      {step.description && (
                        <p className="max-w-md text-sm text-foreground/80 leading-relaxed font-light backdrop-blur-sm bg-black/40 p-4 rounded-lg border border-gold/10">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Tilt3DCard>
              </GsapReveal>
            );
          })}
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <section className="relative bg-gradient-to-br from-ink via-espresso to-ink py-32 overflow-hidden bg-grain border-t border-border/30">
        <Particles count={60} className="opacity-70" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-gold/[0.07] rounded-full blur-3xl" />
        <div className="container-x relative text-center max-w-2xl mx-auto">
          <h2 className="font-display text-4xl md:text-6xl text-foreground leading-tight text-balance">
            Ready to start your bespoke project?
          </h2>
          <p className="mt-6 text-lg text-foreground/70 font-light max-w-lg mx-auto">
            Contact our sales and design team to discuss custom commissions and receive a personalised catalogue.
          </p>
          <Magnetic className="mt-10 inline-block">
            <Button asChild size="lg" className="rounded-none bg-accent text-accent-foreground hover:bg-accent/90 uppercase tracking-[0.2em] px-10 py-6 h-auto text-xs shadow-[0_0_30px_rgba(212,175,55,0.35)]">
              <Link href="/contact">Get in touch <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </Magnetic>
        </div>
      </section>
    </div>
  );
}
