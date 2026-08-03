"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { getPublicCelebrities } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Crown, Sparkles, ArrowRight, Eye, X, Search } from "lucide-react";
import { TextReveal } from "@/components/layout/TextReveal";
import { Tilt3DCard } from "@/components/layout/Tilt3DCard";
import { Particles } from "@/components/layout/Particles";
import { Magnetic } from "@/components/layout/Magnetic";
import { SvgMorphDivider } from "@/components/layout/SvgMorphDivider";
import { PageLoader } from "@/components/layout/PageLoader";

export default function CelebritiesPage() {
  const [lightbox, setLightbox] = useState<{ image: string; name: string; description?: string } | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => { document.title = "Celebrity Showcase — Ascotex Fashions"; }, []);

  const { data: celebrities = [], isLoading } = useQuery({
    queryKey: ["public", "celebrities"],
    queryFn: () => getPublicCelebrities(),
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const filteredCelebrities = celebrities.filter((c: any) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q));
  });

  if (isLoading && celebrities.length === 0) return <PageLoader />;

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
      <section className="relative container-x pt-32 pb-12 md:pt-44 md:pb-16 overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-gold font-medium mb-3">
            <Star className="h-3.5 w-3.5 text-gold" /> Red Carpet &amp; Icons
          </p>
          <div className="font-script text-3xl md:text-4xl text-champagne/90 italic mb-2">Spotted in Ascotex</div>
          <h1 className="font-display text-3xl sm:text-5xl md:text-7xl leading-[1.02]">
            <TextReveal text="Celebrity Showcase" />
          </h1>
          <p className="mt-6 max-w-xl text-base md:text-lg leading-relaxed text-muted-foreground font-light">
            Discover distinguished figures, global icons, and red-carpet celebrities wearing bespoke Ascotex Fashions creations.
          </p>

          {/* Search & Filter Bar */}
          {celebrities.length > 0 && (
            <div className="mt-8 max-w-md relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/70 pointer-events-none" />
              <Input
                type="text"
                placeholder="Search celebrity or collection..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-full border-gold/30 bg-black/50 focus-visible:ring-gold text-xs"
              />
            </div>
          )}
        </motion.div>
      </section>

      <SvgMorphDivider />

      {/* ── Celebrities Showcase Grid ── */}
      <section className="container-x py-12 pb-28 md:pb-40">
        {isLoading ? (
          <div className="py-24 text-muted-foreground text-sm font-light">Loading celebrity showcase…</div>
        ) : filteredCelebrities.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredCelebrities.map((c: any, i: number) => (
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
                    className="group flex flex-col h-full rounded-2xl overflow-hidden border border-gold/20 bg-black/40 p-3.5 shadow-xl cursor-pointer transition-all duration-500 hover:border-gold/60 hover:shadow-[0_0_30px_rgba(212,175,55,0.2)]"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted border border-gold/15">
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
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <div className="flex items-center justify-between w-full text-white">
                          <span className="text-xs font-medium tracking-wider text-gold uppercase">View Feature Details</span>
                          <Eye className="h-4 w-4 text-gold" />
                        </div>
                      </div>
                    </div>

                    {/* Content Footer */}
                    <div className="pt-3.5 px-1 flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="font-display text-xl text-foreground font-medium group-hover:text-gold transition-colors">{c.name}</h3>
                          <Star className="h-4 w-4 text-gold fill-gold/30 shrink-0" />
                        </div>
                        {c.description && (
                          <p className="mt-1.5 text-xs text-muted-foreground font-light line-clamp-2 leading-relaxed">
                            {c.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="mt-3 pt-2 border-t border-border/30 flex items-center justify-between text-[10px] uppercase tracking-widest text-gold/80 font-medium">
                        <span>Ascotex Icon</span>
                        <span className="group-hover:translate-x-1 transition-transform text-gold">Explore →</span>
                      </div>
                    </div>
                  </div>
                </Tilt3DCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-gold/20 bg-black/30 p-16 text-center text-muted-foreground font-light text-sm">
            {search ? "No celebrity features found matching your search query." : "Celebrity showcase features are being curated. Check back soon."}
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
            <Button asChild size="lg" className="rounded-full bg-accent text-accent-foreground hover:bg-gold hover:text-black text-xs uppercase tracking-[0.2em] px-10 py-6 h-auto shadow-[0_0_35px_rgba(212,175,55,0.35)] transition-all">
              <Link href="/contact">
                Contact Atelier Team <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Magnetic>
        </div>
      </section>

      {/* ── Responsive Lightbox Preview Modal ── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/92 backdrop-blur-md p-4 sm:p-6 overflow-y-auto cursor-zoom-out"
            onClick={() => setLightbox(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setLightbox(null)}
              className="fixed top-5 right-5 z-[10000] rounded-full bg-black/80 border border-gold/40 p-3 text-gold hover:bg-gold hover:text-black transition-all shadow-[0_0_20px_rgba(212,175,55,0.35)]"
              aria-label="Close preview"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative my-auto w-full max-w-3xl rounded-2xl border border-gold/40 bg-black/95 backdrop-blur-3xl p-5 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.95)] max-h-[88vh] overflow-y-auto flex flex-col md:flex-row gap-6 items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Column */}
              <div className="w-full md:w-1/2 shrink-0 relative aspect-[3/4] max-h-[45vh] md:max-h-[60vh] overflow-hidden rounded-xl border border-gold/30 bg-muted/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={lightbox.image}
                  alt={lightbox.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content Details Column */}
              <div className="w-full md:w-1/2 flex flex-col justify-between self-stretch">
                <div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gold font-medium mb-2">
                    <Crown className="h-3.5 w-3.5 text-gold" /> Featured Celebrity
                  </div>
                  <h3 className="font-display text-2xl sm:text-4xl text-foreground font-normal leading-tight">
                    {lightbox.name}
                  </h3>
                  <div className="h-0.5 w-12 bg-gold/50 my-3.5" />

                  {lightbox.description ? (
                    <div className="max-h-40 md:max-h-60 overflow-y-auto pr-2">
                      <p className="text-sm text-muted-foreground font-light leading-relaxed whitespace-pre-line">
                        {lightbox.description}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground/60 italic font-light">
                      Exclusive red carpet feature by Ascotex Fashions.
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-[10px] uppercase tracking-widest text-gold/80 font-medium">
                    Ascotex Haute Couture
                  </span>
                  <Button
                    asChild
                    size="sm"
                    className="rounded-full bg-accent text-accent-foreground hover:bg-gold hover:text-black uppercase tracking-widest text-[10px] px-5 py-2.5 h-auto shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all shrink-0"
                  >
                    <Link href="/contact" onClick={() => setLightbox(null)}>
                      Inquire Custom Piece
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
