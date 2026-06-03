import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getCollectionBySlug } from "@/lib/content.functions";
import { Reveal } from "@/components/layout/Reveal";
import { ArrowLeft } from "lucide-react";

const qFor = (slug: string) =>
  queryOptions({
    queryKey: ["collection", slug],
    queryFn: () => getCollectionBySlug({ data: { slug } }),
  });

export const Route = createFileRoute("/collections/$slug")({
  head: ({ loaderData }) => {
    const name = loaderData?.collection?.name ?? "Collection";
    return {
      meta: [
        { title: `${name} — Maison·Loom` },
        { name: "description", content: loaderData?.collection?.description ?? `Explore the ${name} collection by Maison·Loom.` },
        { property: "og:title", content: `${name} — Maison·Loom` },
        { property: "og:description", content: loaderData?.collection?.description ?? `Explore the ${name} collection.` },
        ...(loaderData?.collection?.cover_image ? [{ property: "og:image", content: loaderData.collection.cover_image }] : []),
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
  if (!data) return null;
  const { collection, products } = data;
  return (
    <div>
      <section className="relative">
        <div className="aspect-[16/8] w-full overflow-hidden bg-muted md:aspect-[16/6]">
          <img
            src={collection.cover_image ?? "https://images.unsplash.com/photo-1605883705077-8d3d3cebe78c?w=2000&q=80"}
            alt={collection.name}
            className="h-full w-full object-cover"
          />
        </div>
      </section>
      <div className="container-x py-16 md:py-24">
        <Link to="/collections" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> All collections
        </Link>
        <Reveal>
          <h1 className="mt-6 font-display text-5xl md:text-6xl">{collection.name}</h1>
          {collection.description && (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{collection.description}</p>
          )}
        </Reveal>

        <div className="mt-20 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p: any, i: number) => (
            <Reveal key={p.id} delay={i * 0.05}>
              <div className="aspect-[4/5] overflow-hidden bg-muted">
                <img
                  src={p.product_images?.[0]?.url ?? "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=900&q=80"}
                  alt={p.name} loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
              <h3 className="mt-4 font-display text-xl">{p.name}</h3>
              <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                {[p.composition, p.weight_gsm && `${p.weight_gsm} gsm`, p.width_cm && `${p.width_cm} cm`].filter(Boolean).join(" · ")}
              </div>
              {p.description && <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{p.description}</p>}
            </Reveal>
          ))}
          {products.length === 0 && <p className="text-muted-foreground">No products in this collection yet.</p>}
        </div>
      </div>
    </div>
  );
}
