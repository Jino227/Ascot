"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useAuth } from "@/hooks/use-auth";
import { getAllCollectionsAuthed } from "@/lib/actions";
import { Reveal } from "@/components/layout/Reveal";
import { Badge } from "@/components/ui/badge";
import { Crown, ArrowRight } from "lucide-react";

const DEMO_COLLECTIONS = [
  { id: "d1", name: "The Vault", slug: "the-vault", description: "Exclusive archive pieces from past seasons.", cover_image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&q=80", is_public: false },
  { id: "d2", name: "Bespoke Commission Archive", slug: "bespoke-archive", description: "A showcase of our finest bespoke work.", cover_image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=900&q=80", is_public: false },
  { id: "d3", name: "Autumn Legacy", slug: "autumn-legacy", description: "Current season public collection.", cover_image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=80", is_public: true },
];

export default function PrivateCollections() {
  const { user, loading: authLoading } = useAuth();
  useEffect(() => { document.title = "Member Collections — Ascot Fashions"; }, []);

  const { data: collectionsData = [] } = useQuery({
    queryKey: ["collections", "authed"],
    queryFn: () => getAllCollectionsAuthed(user!.id),
    enabled: !!user,
  });

  if (authLoading) return <div className="container-x py-20 text-muted-foreground">Loading…</div>;
  if (!user) {
    return (
      <div className="container-x py-32 text-center">
        <h1 className="font-display text-4xl">Sign in required</h1>
        <p className="mt-4 text-muted-foreground"><Link href="/auth" className="text-accent underline underline-offset-4">Sign in</Link> to view member collections.</p>
      </div>
    );
  }

  const collections = collectionsData.length > 0 ? collectionsData : DEMO_COLLECTIONS;

  return (
    <div className="container-x py-20 md:py-28">
      <Reveal>
        <div className="flex items-center gap-3 mb-4">
          <Crown className="h-5 w-5 text-amber-500" />
          <p className="text-xs uppercase tracking-[0.4em] text-accent">Members Only</p>
        </div>
        <h1 className="font-display text-5xl md:text-6xl">Member collections</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">All collections, including exclusive member archives.</p>
      </Reveal>
      <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {collections.map((c: any, i: number) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.08 }} whileHover={{ y: -4 }}>
            <Link href="/" className="group block">
              <div className="aspect-[4/5] overflow-hidden bg-muted relative">
                {c.cover_image ? (
                  <motion.img src={c.cover_image} alt={c.name} whileHover={{ scale: 1.05 }} transition={{ duration: 0.6 }} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">No image</div>
                )}
                {!c.is_public && (
                  <div className="absolute top-3 left-3">
                    <Badge className="rounded-none bg-amber-700/90 text-amber-100 border-0 flex items-center gap-1 text-[10px] uppercase tracking-[0.15em] px-2.5 py-1">
                      <Crown className="h-3 w-3" /> Exclusive
                    </Badge>
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl">{c.name}</h2>
                  {c.description && <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>}
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
