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
      <section className="relative h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src="https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=2000&q=80" alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
        <div className="container-x relative z-10">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <p className="text-xs uppercase tracking-[0.4em] text-background/70 border-b border-accent/40 pb-2 inline-block">Our process</p>
            <h1 className="mt-6 font-display text-5xl md:text-7xl text-background max-w-3xl leading-tight">From concept to creation.</h1>
            <p className="mt-4 text-base text-background/70 max-w-xl">Every garment tells a story — follow our complete craftsmanship journey from raw materials to finished piece.</p>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <div className="container-x py-28 md:py-40">
        {displaySteps.map((step: any, i: number) => (
          <GsapReveal key={step.id}>
            <div className={`flex flex-col md:flex-row gap-10 md:gap-16 items-center mb-28 md:mb-40 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 text-accent text-sm font-display mb-4">
                    {String(step.step_order).padStart(2, '0')}
                  </span>
                  <h2 className="font-display text-3xl md:text-5xl leading-tight">{step.title}</h2>
                  {step.subtitle && <p className="mt-3 text-xs uppercase tracking-[0.3em] text-accent/80">{step.subtitle}</p>}
                  <div className="h-px w-12 bg-accent/40 my-6" />
                  <p className="text-base leading-relaxed text-muted-foreground max-w-lg">{step.description}</p>
                  <Button asChild variant="link" className="mt-6 h-auto p-0 text-accent text-xs uppercase tracking-widest group">
                    <Link href="/collections">View collections <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" /></Link>
                  </Button>
                </motion.div>
              </div>
              <div className="flex-1 w-full">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="aspect-[4/3] overflow-hidden bg-muted relative group"
                >
                  {step.image ? (
                    <img src={step.image} alt={step.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground/40 text-xs">No image</div>
                  )}
                </motion.div>
              </div>
            </div>
          </GsapReveal>
        ))}
      </div>

      {/* Bottom CTA */}
      <section className="bg-foreground py-28">
        <div className="container-x text-center">
          <h2 className="font-display text-4xl md:text-6xl text-background leading-tight">Ready to start your project?</h2>
          <p className="mt-4 text-background/60 max-w-lg mx-auto">Contact our team to discuss your requirements and receive a personalised quote.</p>
          <Button asChild size="lg" className="mt-10 rounded-none bg-accent text-accent-foreground hover:bg-accent/90 uppercase tracking-[0.15em] px-10">
            <Link href="/contact">Get in touch <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
