import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAllCollectionsAuthed } from "@/lib/content.functions";
import { Reveal } from "@/components/layout/Reveal";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/private-collections")({
  head: () => ({ meta: [{ title: "Member Collections — Maison·Loom" }] }),
  component: PrivateCollections,
});

function PrivateCollections() {
  const fn = useServerFn(getAllCollectionsAuthed);
  const { data } = useSuspenseQuery(
    queryOptions({ queryKey: ["collections", "authed"], queryFn: () => fn() }),
  );
  return (
    <div className="container-x py-20 md:py-28">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.4em] text-accent">Members only</p>
        <h1 className="mt-5 font-display text-5xl md:text-6xl">Member collections</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">All collections, including private archives.</p>
      </Reveal>
      <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {data.map((c, i) => (
          <Reveal key={c.id} delay={i * 0.05}>
            <Link to="/collections/$slug" params={{ slug: c.slug }} className="group block">
              <div className="aspect-[4/5] overflow-hidden bg-muted">
                <img src={c.cover_image ?? "https://images.unsplash.com/photo-1605883705077-8d3d3cebe78c?w=900&q=80"} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <h2 className="font-display text-2xl">{c.name}</h2>
                {!c.is_public && <Badge variant="secondary" className="rounded-none">Private</Badge>}
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
