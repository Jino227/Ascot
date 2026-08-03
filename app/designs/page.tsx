"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getPublicDesigns, getDesignsForUser } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Lock, X, Crown, ArrowRight, Eye, Sparkles } from "lucide-react";
import { TextReveal } from "@/components/layout/TextReveal";
import { Tilt3DCard } from "@/components/layout/Tilt3DCard";
import { Particles } from "@/components/layout/Particles";
import { Magnetic } from "@/components/layout/Magnetic";
import { SvgMorphDivider } from "@/components/layout/SvgMorphDivider";

export default function DesignsPage() {
  const { user, loading: authLoading } = useAuth();
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => { document.title = "Designs — Ascotex Fashions"; }, []);

  const { data: publicDesigns = [], isLoading: loadingPublic } = useQuery({
    queryKey: ["designs", "public"],
    queryFn: () => getPublicDesigns(),
  });

  const { data: allDesigns, isLoading: loadingAll } = useQuery({
    queryKey: ["designs", "user", user?.id],
    queryFn: () => getDesignsForUser(user!.id),
    enabled: !!user,
  });

  const isLoading = authLoading || loadingPublic || (!!user && loadingAll);
  const images = user ? (allDesigns ?? publicDesigns) : publicDesigns;

  const publicImages = images.filter((d: any) => !d.is_private);
  const privateImages = images.filter((d: any) => d.is_private);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Page Header ── */}
      <section className="relative container-x pt-32 pb-14 md:pt-44 md:pb-20 overflow-hidden">
        <Particles count={40} className="opacity-50" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-gold font-medium mb-3">
            <Sparkles className="h-3.5 w-3.5 text-gold" /> The Portfolio
          </p>
          <div className="font-script text-3xl md:text-4xl text-champagne/90 italic mb-2">Curated Silhouettes & Embroidery</div>
          <h1 className="font-display text-3xl sm:text-5xl md:text-7xl leading-[1.02]">
            <TextReveal text="Designs & Collections" />
          </h1>
          <p className="mt-6 max-w-xl text-base md:text-lg leading-relaxed text-muted-foreground font-light">
            {user
              ? "Your full library — public designs and exclusive private pieces."
              : "Public designs visible to all. Sign in to unlock your exclusive private collection."}
          </p>
        </motion.div>
      </section>

      <SvgMorphDivider />

      {isLoading ? (
        <div className="container-x py-24 text-muted-foreground text-sm font-light">Loading designs…</div>
      ) : (
        <>
          {/* ── Public Images Masonry ── */}
          {publicImages.length > 0 && (
            <section className="container-x py-12 pb-24 md:pb-32">
              <div className="mb-12 flex items-end justify-between border-b border-border/40 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-gold font-medium">Public Collection</p>
                  <h2 className="mt-1 font-display text-3xl md:text-4xl">Atelier Creations</h2>
                </div>
                <span className="text-xs tracking-wider text-muted-foreground uppercase">{publicImages.length} Pieces</span>
              </div>
              <ImageMasonry images={publicImages} onOpen={setLightbox} />
            </section>
          )}

          {/* ── Private Images (Logged-in Users) ── */}
          {user && privateImages.length > 0 && (
            <section className="relative bg-secondary/30 py-20 md:py-32 border-t border-border/30">
              <div className="container-x">
                <div className="mb-12 flex items-end justify-between border-b border-gold/30 pb-4">
                  <div>
                    <p className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-gold font-medium">
                      <Crown className="h-4 w-4 text-gold" /> Exclusive Access
                    </p>
                    <h2 className="mt-1 font-display text-3xl md:text-4xl text-gradient-gold">Private Collection</h2>
                  </div>
                  <span className="text-xs tracking-wider text-gold/80 uppercase">{privateImages.length} Private Pieces</span>
                </div>
                <ImageMasonry images={privateImages} onOpen={setLightbox} premium />
              </div>
            </section>
          )}

          {images.length === 0 && (
            <div className="container-x py-32 text-center text-muted-foreground font-light">No designs published yet.</div>
          )}

          {/* ── Sign-in CTA for unauthenticated users ── */}
          {!user && !authLoading && (
            <section className="relative py-32 overflow-hidden bg-grain border-t border-border/30">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-ink via-espresso to-ink" />
              <Particles count={50} className="opacity-60" />
              
              <div className="container-x relative text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center mx-auto mb-6">
                  <Lock className="h-7 w-7 text-gold" />
                </div>
                <p className="text-xs uppercase tracking-[0.4em] text-gold font-medium">Members Only</p>
                <h2 className="mt-4 font-display text-4xl md:text-6xl text-foreground leading-tight">
                  Unlock Premium Private Designs
                </h2>
                <p className="mt-6 text-base md:text-lg text-foreground/70 leading-relaxed font-light">
                  Sign in to access exclusive designs, bespoke fitting options, and private pieces curated for your account.
                </p>
                <Magnetic className="mt-10 inline-block">
                  <Button asChild size="lg" className="rounded-none bg-accent text-accent-foreground hover:bg-accent/90 text-xs uppercase tracking-[0.2em] px-10 py-6 h-auto shadow-[0_0_30px_rgba(212,175,55,0.35)]">
                    <Link href="/auth">Sign in <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </Magnetic>
              </div>
            </section>
          )}
        </>
      )}

      {/* ── Glassmorphic Lightbox ── */}
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
            <motion.img
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.3 }}
              src={lightbox}
              alt="Design Preview"
              className="max-h-[88vh] max-w-[90vw] object-contain rounded-xl border border-gold/40 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function ImageMasonry({ images, onOpen, premium = false }: { images: any[]; onOpen: (url: string) => void; premium?: boolean }) {
  return (
    <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
      {images.map((img: any, i: number) => (
        <motion.div
          key={img.id ?? i}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: (i % 8) * 0.06 }}
          className="break-inside-avoid"
        >
          <Tilt3DCard maxTilt={8} scaleOnHover={1.03}>
            <div
              className="group relative overflow-hidden rounded-xl border border-border/40 cursor-pointer shadow-md bg-card"
              onClick={() => onOpen(img.url)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt ?? "Ascotex Design"}
                className="w-full object-cover transition-transform duration-700 group-hover:scale-108"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div className="flex items-center justify-between w-full text-white">
                  <span className="text-xs font-light tracking-wider">Expand View</span>
                  <Eye className="h-4 w-4 text-gold" />
                </div>
              </div>
              {premium && (
                <div className="absolute top-3 right-3 opacity-90 group-hover:opacity-100 transition-opacity">
                  <span className="flex items-center gap-1 rounded-full bg-gold/90 border border-gold px-2.5 py-1 text-[9px] uppercase tracking-widest text-black font-semibold shadow-md">
                    <Crown className="h-3 w-3" /> Exclusive
                  </span>
                </div>
              )}
            </div>
          </Tilt3DCard>
        </motion.div>
      ))}
    </div>
  );
}
