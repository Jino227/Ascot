import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { getCollections } from "@/lib/content.functions";
import { Reveal } from "@/components/layout/Reveal";
import { ImageReveal } from "@/components/layout/ImageReveal";

const q = queryOptions({ queryKey: ["collections", "public"], queryFn: () => getCollections({ data: {} }) });

const FALLBACK = "https://images.unsplash.com/photo-1605883705077-8d3d3cebe78c?w=1400&q=80";

export const Route = createFileRoute("/collections/")({
  head: () => ({
    meta: [
      { title: "Collections — Maison·Loom" },
      { name: "description", content: "Browse our seasonal and signature collections of luxury woven textiles." },
      { property: "og:title", content: "Collections — Maison·Loom" },
      { property: "og:description", content: "Seasonal and signature collections of luxury woven textiles." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  errorComponent: ({ error }) => <div className="container-x py-20">{error.message}</div>,
  component: CollectionsPage,
});

function CollectionsPage() {
  const { data } = useSuspenseQuery(q);
  return (
    <div className="container-x py-24 md:py-32">
      <Reveal>
        <p className="text-[10px] uppercase tracking-[0.5em] text-accent">Catalogue</p>
        <h1 className="mt-6 font-display text-6xl leading-[0.95] md:text-8xl">Collections</h1>
        <p className="mt-8 max-w-xl text-lg text-muted-foreground">
          Seasonal and signature weaves — each developed in our atelier over months of sampling.
        </p>
      </Reveal>

      <div className="mt-20 space-y-24 md:mt-28 md:space-y-32">
        {data.map((c, i) => {
          const reverse = i % 2 === 1;
          return (
            <Reveal key={c.id} delay={0.05}>
              <Link
                to="/collections/$slug"
                params={{ slug: c.slug }}
                className="group grid items-end gap-8 md:grid-cols-12 md:gap-12"
              >
                <div className={`md:col-span-8 ${reverse ? "md:order-2" : ""}`}>
                  <motion.div layoutId={`collection-cover-${c.slug}`}>
                    <ImageReveal
                      src={c.cover_image ?? FALLBACK}
                      alt={c.name}
                      ratio={reverse ? "5/4" : "4/5"}
                    />
                  </motion.div>
                </div>
                <div className={`md:col-span-4 ${reverse ? "md:order-1 md:pr-8" : "md:pl-2"}`}>
                  <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
                    {String(i + 1).padStart(2, "0")} / {String(data.length).padStart(2, "0")}
                  </p>
                  <motion.h2
                    layoutId={`collection-title-${c.slug}`}
                    className="mt-4 font-display text-4xl leading-tight md:text-5xl"
                  >
                    {c.name}
                  </motion.h2>
                  {c.description && (
                    <p className="mt-5 line-clamp-4 text-base text-muted-foreground">{c.description}</p>
                  )}
                  <span className="mt-6 inline-block border-b border-accent pb-1 text-xs uppercase tracking-[0.3em] text-accent transition-all group-hover:tracking-[0.45em]">
                    View collection
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
        {data.length === 0 && <p className="text-muted-foreground">No collections yet.</p>}
      </div>
    </div>
  );
}
