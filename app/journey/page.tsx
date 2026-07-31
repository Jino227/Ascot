"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, CheckCircle } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getJourneySteps } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { TextReveal } from "@/components/layout/TextReveal";
import { Magnetic } from "@/components/layout/Magnetic";
import { Particles } from "@/components/layout/Particles";

gsap.registerPlugin(ScrollTrigger);

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
    gsap.fromTo(el, { opacity: 0, y: 80 }, {
      opacity: 1, y: 0, duration: 1.2, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none reverse" },
    });
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}

export default function Journey() {
  useEffect(() => { document.title = "Our Journey — Ascot Fashions"; }, []);
  const { data: steps = [] } = useQuery({ queryKey: ["journey_steps"], queryFn: () => getJourneySteps() });
  const displaySteps = steps.length > 0 ? steps : DEMO_STEPS;

  return (
    <div>
      {/* Hero */}
      <section className="container-x pt-32 pb-16 md:pt-44 md:pb-24">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <p className="text-xs uppercase tracking-[0.4em] text-accent/80 border-b border-accent/40 pb-2 inline-block">Our process</p>
          <h1 className="mt-6 font-display text-5xl md:text-7xl max-w-3xl leading-tight">
            <TextReveal text="The Journey." delay={0.1} />
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
            A step-by-step visual exploration of our craftsmanship and dedication to perfection.
          </p>
        </motion.div>
      </section>

      {/* Journey Sequence */}
      <div className="container-x pb-28 md:pb-40">
        <div className="space-y-16 md:space-y-24">
          {displaySteps.map((step: any, i: number) => {
            if (!step.image) return null;
            return (
              <GsapReveal key={step.id || i}>
                <div className="relative w-full aspect-[4/3] md:aspect-[21/9] overflow-hidden bg-muted group rounded-lg border border-gold/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={step.image}
                    alt="Journey step"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                  <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-display text-5xl text-gradient-gold">{String(i + 1).padStart(2, "0")}</span>
                        <span className="h-px w-10 bg-gold/50" />
                      </div>
                      {step.title && <h3 className="mt-3 font-display text-2xl md:text-3xl text-foreground">{step.title}</h3>}
                    </div>
                    {step.description && <p className="hidden max-w-md text-sm text-foreground/70 leading-relaxed md:block">{step.description}</p>}
                  </div>
                </div>
              </GsapReveal>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <section className="relative bg-gradient-to-br from-ink via-espresso to-ink py-28 overflow-hidden bg-grain">
        <Particles count={50} className="opacity-60" />
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-gold/[0.06] rounded-full blur-3xl" />
        <div className="container-x relative text-center">
          <h2 className="font-display text-4xl md:text-6xl text-foreground leading-tight text-balance">Ready to start your project?</h2>
          <p className="mt-4 text-foreground/60 max-w-lg mx-auto">Contact our team to discuss your requirements and receive a personalised quote.</p>
          <Magnetic className="mt-10">
            <Button asChild size="lg" className="rounded-none bg-accent text-accent-foreground hover:bg-accent/90 uppercase tracking-[0.15em] px-10 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
              <Link href="/contact">Get in touch <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </Magnetic>
        </div>
      </section>
    </div>
  );
}
