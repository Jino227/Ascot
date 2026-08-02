"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { getPublicCelebrities } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Star, Crown, Sparkles, ArrowRight, Eye, X } from "lucide-react";
import { TextReveal } from "@/components/layout/TextReveal";
import { Tilt3DCard } from "@/components/layout/Tilt3DCard";
import { Particles } from "@/components/layout/Particles";
import { Magnetic } from "@/components/layout/Magnetic";
import { SvgMorphDivider } from "@/components/layout/SvgMorphDivider";
import { PageLoader } from "@/components/layout/PageLoader";

export default function CelebritiesPage() {
  const [lightbox, setLightbox] = useState<{ image: string; name: string; description?: string } | null>(null);

  useEffect(() => { document.title = "Celebrities — Ascotex Fashions"; }, []);

  const { data: celebrities = [], isLoading } = useQuery({
    queryKey: ["public", "celebrities"],
    queryFn: () => getPublicCelebrities(),
  });

  if (isLoading) return <PageLoader />;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Ambient Background Glows ── */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-24 left-1/4 h-[30rem] w-[30rem] rounded-full bg-gold/[0.08] blur-3xl animate-glow" />
        <div className="absolute top-1/2 right-1/4 h-[28rem] w-[28rem] rounded-full bg-gold-deep/[0.07] blur-3xl animate-glow-slow" />
      </div>

      {/* Floating Gold Particles Canvas */}
      <Particles count={50} className="opacity-50 pointer-events-none" />

      {/* ── Page Header ── */}
      <section className="relative container-x pt-32 pb-14 md:pt-44 md:pb-20 overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-gold font-medium mb-3">
            <Star className="h-3.5 w-3.5 text-gold" /> Red Carpet &amp; Icons
          </p>
          <div className="font-script text-3xl md:text-4xl text-champagne/90 italic mb-2">Spotted in Ascotex</div>
          <h1 className="font-display text-5xl md:text-7xl leading-[1.02]">
            <TextReveal text="Celebrity Showcase" />
          </h1>
          <p className="mt-6 max-w-xl text-base md:text-lg leading-relaxed text-muted-foreground font-light">
            Discover distinguished figures, global icons, and red-carpet celebrities wearing bespoke Ascotex Fashions creations.
          </p>
        </motion.div>
      </section>

      <SvgMorphDivider />

      {/* ── Celebrities Showcase Grid ── */}
      <section className="container-x py-12 pb-28 md:pb-40">
        {isLoading ? (
          <div className="py-24 text-muted-foreground text-sm font-light">Loading celebrity showcase…</div>
        ) : celebrities.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {celebrities.map((c: any, i: number) => (
              <motion.div
                key={c.id || i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: (i % 4) * 0.08 }}
              >
                <Tilt3DCard maxTilt={8} scaleOnHover={1.03}>
                  <div
                    onClick={() => c.image && setLightbox({ image: c.image, name: c.name, description: c.description })}
                    className="group flex flex-col rounded-xl overflow-hidden border border-border/50 bg-black/40 p-3 shadow-xl cursor-pointer transition-all duration-500 hover:border-gold/50"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted mb-4 border border-gold/15">
                      {c.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.image}
                          alt={c.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground/40 text-xs font-light">
                          No Photo
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <div className="flex items-center justify-between w-full text-white">
                          <span className="text-xs font-light tracking-wider">View Feature</span>
                          <Eye className="h-4 w-4 text-gold" />
                        </div>
                      </div>
                    </div>
                    <div className="px-2 pb-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-xl text-foreground font-normal">{c.name}</h3>
                        <Star className="h-4 w-4 text-gold fill-gold/20 shrink-0" />
                      </div>
                      {c.description && (
                        <p className="mt-1.5 text-xs text-muted-foreground font-light line-clamp-2 leading-relaxed">
                          {c.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Tilt3DCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-gold/20 bg-black/20 p-20 text-center text-muted-foreground font-light text-sm">
            Celebrity showcase features are being curated. Check back soon.
          </div>
        )}
      </section>

      {/* ── Bottom Custom Commission CTA ── */}
      <section className="relative py-32 overflow-hidden bg-grain border-t border-border/30">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-ink via-espresso to-ink" />
        <Particles count={55} className="opacity-60 pointer-events-none" />

        <div className="container-x relative text-center max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center mx-auto mb-6">
            <Crown className="h-6 w-6 text-gold" />
          </div>
          <p className="text-xs uppercase tracking-[0.4em] text-gold font-medium">Haute Tailoring</p>
          <h2 className="mt-4 font-display text-4xl md:text-6xl text-foreground leading-tight">
            Inquire for Custom Fitting
          </h2>
          <p className="mt-6 text-base md:text-lg text-foreground/70 leading-relaxed font-light">
            Book a private atelier consultation or request custom red-carpet commission styling from our master artisans.
          </p>
          <Magnetic className="mt-10 inline-block">
            <Button asChild size="lg" className="rounded-none bg-accent text-accent-foreground hover:bg-accent/90 text-xs uppercase tracking-[0.2em] px-10 py-6 h-auto shadow-[0_0_35px_rgba(212,175,55,0.35)]">
              <Link href="/contact">
                Contact Sales Team <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Magnetic>
        </div>
      </section>

      {/* ── Fullscreen Lightbox Preview Modal ── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/92 backdrop-blur-md p-4 cursor-zoom-out"
            onClick={() => setLightbox(null)}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-6 right-6 rounded-full bg-black/60 p-3 text-white hover:bg-gold hover:text-black transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-2xl w-full rounded-2xl border border-gold/40 bg-black/90 backdrop-blur-2xl p-6 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl mb-4 border border-gold/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={lightbox.image}
                  alt={lightbox.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-display text-2xl text-foreground font-normal">{lightbox.name}</h3>
              {lightbox.description && (
                <p className="mt-2 text-sm text-muted-foreground font-light leading-relaxed">
                  {lightbox.description}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
