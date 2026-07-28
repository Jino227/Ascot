"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Crown } from "lucide-react";
import { motion } from "motion/react";
import { getCollections } from "@/lib/actions";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

export default function CollectionsPage() {
  const { user } = useAuth();
  const { data: collections = [], isLoading } = useQuery({
    queryKey: ["collections", "catalogue", user?.id],
    queryFn: () => getCollections({ userId: user?.id }),
  });

  useEffect(() => { document.title = "Collections — Ascot Fashions"; }, []);

  return (
    <main className="container-x py-20 md:py-28">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.4em] text-accent">The catalogue</p>
        <h1 className="mt-5 font-display text-5xl md:text-7xl">Collections</h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          Explore our public collections. Sign in to reveal private pieces assigned to your account.
        </p>
      </div>

      {isLoading ? (
        <div className="py-24 text-muted-foreground">Loading collections…</div>
      ) : collections.length === 0 ? (
        <div className="mt-16 border border-border/60 p-12 text-center text-muted-foreground">No published collections yet.</div>
      ) : (
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection: any, index: number) => {
            const hasPrivate = collection.collection_images?.some((image: any) => image.is_private);
            return (
              <motion.div key={collection.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }} whileHover={{ y: -5 }}>
                <Link href={`/collections/${collection.slug}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                    {collection.cover_image ? <img src={collection.cover_image} alt={collection.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No cover image</div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                    {hasPrivate && <Badge className="absolute left-4 top-4 rounded-none border-0 bg-amber-700/90 text-amber-50"><Crown className="mr-1 h-3 w-3" /> Member access</Badge>}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h2 className="font-display text-2xl">{collection.name}</h2>
                      {collection.description && <p className="mt-2 text-sm text-white/70">{collection.description}</p>}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground group-hover:text-accent">
                    View collection <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </main>
  );
}
