import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getCollections } from "@/lib/content.functions";
import { Reveal } from "@/components/layout/Reveal";

const q = queryOptions({ queryKey: ["collections", "public"], queryFn: () => getCollections({ data: {} }) });

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
    <div className="container-x py-20 md:py-28">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.4em] text-accent">Catalogue</p>
        <h1 className="mt-5 font-display text-5xl md:text-6xl">Collections</h1>
      </Reveal>
      <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {data.map((c, i) => (
          <Reveal key={c.id} delay={i * 0.06}>
            <Link to="/collections/$slug" params={{ slug: c.slug }} className="group block">
              <div className="aspect-[4/5] overflow-hidden bg-muted">
                <img
                  src={c.cover_image ?? "https://images.unsplash.com/photo-1605883705077-8d3d3cebe78c?w=900&q=80"}
                  alt={c.name} loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <h2 className="mt-5 font-display text-2xl">{c.name}</h2>
              {c.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>}
            </Link>
          </Reveal>
        ))}
        {data.length === 0 && (
          <p className="text-muted-foreground">No collections yet.</p>
        )}
      </div>
    </div>
  );
}
