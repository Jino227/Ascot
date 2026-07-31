"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getPublicDesigns, getDesignsForUser } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Lock, X, Crown, ArrowRight } from "lucide-react";
import { TextReveal } from "@/components/layout/TextReveal";

export default function DesignsPage() {
  const { user, loading: authLoading } = useAuth();
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => { document.title = "Designs — Ascot Fashions"; }, []);

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
    <main>
      {/* ── Page header ── */}
      <section className="container-x pt-28 pb-16 md:pt-40 md:pb-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <p className="text-xs uppercase tracking-[0.4em] text-accent/80">The Portfolio</p>
          <h1 className="mt-5 font-display text-5xl md:text-7xl leading-[1.02]">
            <TextReveal text="Designs & Collections" />
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {user
              ? "Your full library — public designs and exclusive pieces."
              : "Public designs visible to all. Sign in to unlock your exclusive collection."}
          </p>
        </motion.div>
      </section>

      {isLoading ? (
        <div className="container-x py-24 text-muted-foreground text-sm">Loading designs…</div>
      ) : (
        <>
          {/* ── Public images ── */}
          {publicImages.length > 0 && (
            <section className="container-x pb-20 md:pb-28">
              <div className="mb-10 flex items-end justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-accent/70">Public</p>
                  <h2 className="mt-2 font-display text-3xl md:text-4xl">Our designs</h2>
                </div>
                <span className="text-xs text-muted-foreground">{publicImages.length} pieces</span>
              </div>
              <ImageMasonry images={publicImages} onOpen={setLightbox} />
            </section>
          )}

          {/* ── Private images (logged-in users) ── */}
          {user && privateImages.length > 0 && (
            <section className="bg-secondary/30 py-20 md:py-28">
              <div className="container-x">
                <div className="mb-10 flex items-end justify-between">
                  <div>
                    <p className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-amber-600/80">
                      <Crown className="h-3.5 w-3.5" /> Exclusive
                    </p>
                    <h2 className="mt-2 font-display text-3xl md:text-4xl">Private collection</h2>
                  </div>
                  <span className="text-xs text-muted-foreground">{privateImages.length} pieces</span>
                </div>
                <ImageMasonry images={privateImages} onOpen={setLightbox} premium />
              </div>
            </section>
          )}

          {images.length === 0 && (
            <div className="container-x py-32 text-center text-muted-foreground">No designs published yet.</div>
          )}

          {/* ── Sign-in CTA for unauthenticated users ── */}
          {!user && !authLoading && (
            <section className="relative py-28 overflow-hidden bg-grain">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-ink via-espresso to-ink" />
              {publicImages[0] && (
                <div
                  className="absolute inset-0 -z-10 opacity-25"
                  style={{ backgroundImage: `url(${publicImages[0].url})`, backgroundSize: "cover", backgroundPosition: "center", filter: "blur(20px)" }}
                />
              )}
              <div className="container-x relative text-center max-w-2xl mx-auto">
                <Lock className="mx-auto h-10 w-10 text-accent/70 mb-6" />
                <p className="text-xs uppercase tracking-[0.4em] text-accent/70">Members only</p>
                <h2 className="mt-5 font-display text-4xl md:text-5xl text-foreground leading-tight">
                  Unlock premium designs &amp; collections
                </h2>
                <p className="mt-6 text-lg text-foreground/60 leading-relaxed">
                  Sign in to access exclusive designs and private pieces curated for your account.
                </p>
                <div className="mt-10 flex flex-wrap gap-4 justify-center">
                  <Button asChild size="lg" className="rounded-none bg-accent text-accent-foreground hover:bg-accent/90 text-sm uppercase tracking-[0.15em] px-8 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                    <Link href="/auth">Sign in <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/92 p-4"
            onClick={() => setLightbox(null)}
          >
            <button onClick={() => setLightbox(null)}
              className="absolute top-5 right-5 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition">
              <X className="h-5 w-5" />
            </button>
            <motion.img
              initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
              transition={{ duration: 0.3 }}
              src={lightbox} alt=""
              className="max-h-[90vh] max-w-[92vw] object-contain shadow-2xl"
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
    <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
      {images.map((img: any, i: number) => (
        <motion.div
          key={img.id ?? i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: (i % 8) * 0.05 }}
          className="break-inside-avoid group relative overflow-hidden cursor-zoom-in"
          onClick={() => onOpen(img.url)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.url} alt={img.alt ?? ""} className="w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          {premium && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="flex items-center gap-1 rounded-sm bg-amber-700/90 px-2 py-0.5 text-[10px] uppercase tracking-wider text-amber-50">
                <Crown className="h-2.5 w-2.5" /> Exclusive
              </span>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
