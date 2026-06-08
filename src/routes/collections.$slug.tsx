import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { getCollectionBySlug } from "@/lib/content.functions";
import { Reveal } from "@/components/layout/Reveal";
import { Masonry, MasonryItem } from "@/components/layout/Masonry";
import { ImageReveal } from "@/components/layout/ImageReveal";
import { LuxLightbox, useLightbox } from "@/components/layout/Lightbox";

const qFor = (slug: string) =>
  queryOptions({
    queryKey: ["collection", slug],
    queryFn: () => getCollectionBySlug({ data: { slug } }),
  });

const FALLBACKS = [
  "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1400&q=80",
  "https://images.unsplash.com/photo-1605883705077-8d3d3cebe78c?w=1400&q=80",
  "https://images.unsplash.com/photo-1567016526105-22da7c13161a?w=1400&q=80",
  "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=1400&q=80",
];

export const Route = createFileRoute("/collections/$slug")({
  head: ({ loaderData }: { loaderData?: { collection: { name: string; description: string | null; cover_image: string | null } } }) => {
    const c = loaderData?.collection;
    const name = c?.name ?? "Collection";
    return {
      meta: [
        { title: `${name} — Maison·Loom` },
        { name: "description", content: c?.description ?? `Explore the ${name} collection by Maison·Loom.` },
        { property: "og:title", content: `${name} — Maison·Loom` },
        { property: "og:description", content: c?.description ?? `Explore the ${name} collection.` },
        ...(c?.cover_image ? [{ property: "og:image", content: c.cover_image }] : []),
      ],
    };
  },
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(qFor(params.slug));
    if (!data) throw notFound();
    return data;
  },
  notFoundComponent: () => (
    <div className="container-x py-32 text-center">
      <h1 className="font-display text-4xl">Collection not found</h1>
      <Link to="/collections" className="mt-6 inline-block text-accent">← Back to collections</Link>
    </div>
  ),
  errorComponent: ({ error }) => <div className="container-x py-20">{error.message}</div>,
  component: CollectionDetail,
});

function CollectionDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(qFor(slug));
  const lb = useLightbox();
  if (!data) return null;
  const { collection, products } = data;

  const images = products.map((p: any, i: number) => ({
    src: p.product_images?.[0]?.url ?? FALLBACKS[i % FALLBACKS.length],
    alt: p.name as string,
  }));

  return (
    <div>
      {/* Cinematic hero */}
      <section className="relative">
        <motion.div
          layoutId={`collection-cover-${collection.slug}`}
          className="aspect-[16/9] w-full overflow-hidden bg-muted md:aspect-[16/7]"
        >
          <img
            src={collection.cover_image ?? FALLBACKS[0]}
            alt={collection.name}
            className="h-full w-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
      </section>

      <div className="container-x -mt-24 md:-mt-40">
        <Link to="/collections" className="inline-flex items-center text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-3 w-3" /> All collections
        </Link>
        <Reveal>
          <motion.h1
            layoutId={`collection-title-${collection.slug}`}
            className="mt-8 font-display text-6xl leading-[0.95] md:text-8xl"
          >
            {collection.name}
          </motion.h1>
          {collection.description && (
            <p className="mt-10 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              {collection.description}
            </p>
          )}
        </Reveal>
      </div>

      <section className="container-x py-24 md:py-32">
        <Masonry>
          {products.map((p: any, i: number) => (
            <MasonryItem key={p.id}>
              <Reveal delay={(i % 6) * 0.04}>
                <ImageReveal
                  src={images[i].src}
                  alt={p.name}
                  ratio={i % 3 === 0 ? "3/4" : i % 3 === 1 ? "4/5" : "1/1"}
                  onClick={() => lb.open(i)}
                />
                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-2xl leading-tight">{p.name}</h3>
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  {[p.composition, p.weight_gsm && `${p.weight_gsm} gsm`, p.width_cm && `${p.width_cm} cm`]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </Reveal>
            </MasonryItem>
          ))}
        </Masonry>
        {products.length === 0 && (
          <p className="text-center text-muted-foreground">No products in this collection yet.</p>
        )}
      </section>

      <LuxLightbox slides={images} index={lb.index} onClose={lb.close} />
    </div>
  );
}
