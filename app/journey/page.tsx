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
import { PageLoader } from "@/components/layout/PageLoader";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}



function GsapReveal({ children, className, index = 1 }: { children: React.ReactNode; className?: string; index?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    // First item triggers as soon as it enters the viewport to avoid a blank gap
    const startPoint = index === 0 ? "top bottom" : "top 90%";
    
    gsap.fromTo(el, { opacity: 0, y: 50 }, {
      opacity: 1, y: 0, duration: 1.2, ease: "power3.out",
      scrollTrigger: { trigger: el, start: startPoint, toggleActions: "play none none reverse" },
    });
  }, [index]);
  return <div ref={ref} className={className}>{children}</div>;
}

export default function Journey() {
  useEffect(() => { document.title = "Our Journey — Ascotex Fashions"; }, []);
  const { data: steps = [], isLoading } = useQuery({ queryKey: ["journey_steps"], queryFn: () => getJourneySteps() });
  const displaySteps = steps;

  if (isLoading) return <PageLoader />;

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
        <div className="space-y-24 lg:space-y-32">
          {displaySteps.map((step: any, i: number) => {
            if (!step.image) return null;
            const isEven = i % 2 === 0;
            return (
              <GsapReveal key={step.id || i} index={i} className="group">
                <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-24`}>
                  
                  {/* Image Section */}
                  <div className="w-full lg:w-1/2">
                    <Tilt3DCard maxTilt={5} scaleOnHover={1.02}>
                      <div className="relative w-full aspect-[4/3] md:aspect-[16/10] rounded-2xl overflow-hidden border border-gold/20 shadow-2xl bg-black/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={step.image}
                          alt={step.title || "Journey step"}
                          className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700" />
                      </div>
                    </Tilt3DCard>
                  </div>

                  {/* Content Section */}
                  <div className="w-full lg:w-1/2 space-y-8">
                    <div className="flex items-center gap-6">
                      <span className="font-display text-6xl lg:text-8xl text-transparent bg-clip-text bg-gradient-to-br from-gold via-gold/50 to-transparent opacity-60 font-light">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className={`h-[1px] flex-1 bg-gradient-to-r ${isEven ? 'from-gold/60 to-transparent' : 'from-transparent to-gold/60'}`} />
                    </div>
                    
                    <div className="space-y-4">
                      {step.title && (
                        <h3 className="font-display text-4xl lg:text-5xl text-foreground font-normal tracking-wide">
                          {step.title}
                        </h3>
                      )}
                      
                      {step.subtitle && (
                        <p className="text-sm uppercase tracking-[0.25em] text-gold/80 font-medium">
                          {step.subtitle}
                        </p>
                      )}
                      
                      {step.description && (
                        <p className="text-base lg:text-lg text-foreground/70 leading-relaxed font-light mt-6 max-w-xl">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                </div>
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
