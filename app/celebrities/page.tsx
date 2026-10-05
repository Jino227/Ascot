"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { getPublicCelebrities } from "@/lib/actions";
import { PageLoader } from "@/components/layout/PageLoader";

export default function CelebritiesPage() {
  useEffect(() => { document.title = "Showcase — Ascotex Fashions"; }, []);

  const { data: celebrities = [], isLoading } = useQuery({
    queryKey: ["public", "celebrities"],
    queryFn: () => getPublicCelebrities(),
  });

  if (isLoading && celebrities.length === 0) return <PageLoader />;

  const images = celebrities.filter((celebrity: any) => celebrity.image);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="container-x pb-28 pt-32 md:pb-40 md:pt-44">
        {images.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {images.map((celebrity: any, index: number) => (
              <motion.div
                key={celebrity.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: (index % 4) * 0.06 }}
                className="overflow-hidden rounded-xl border border-gold/20 bg-black/30"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={celebrity.image}
                  alt=""
                  className="aspect-[3/4] w-full object-cover"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
