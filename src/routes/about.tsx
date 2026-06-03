import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getWebsiteContent } from "@/lib/content.functions";
import { Reveal } from "@/components/layout/Reveal";

const contentQ = queryOptions({ queryKey: ["website_content"], queryFn: () => getWebsiteContent() });

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Maison·Loom" },
      { name: "description", content: "Six decades of vertically integrated textile manufacturing. Meet our atelier, our weavers, and our standards." },
      { property: "og:title", content: "About — Maison·Loom" },
      { property: "og:description", content: "Heritage textile manufacturing since 1962." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(contentQ),
  errorComponent: ({ error }) => <div className="container-x py-20">{error.message}</div>,
  component: About,
});

function About() {
  const { data } = useSuspenseQuery(contentQ);
  const about = data.about ?? {};
  return (
    <div className="container-x py-24 md:py-32">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.4em] text-accent">Our story</p>
        <h1 className="mt-5 max-w-3xl font-display text-5xl leading-tight md:text-6xl">
          {about.title ?? "Crafted in one mill. Refined over generations."}
        </h1>
      </Reveal>

      <div className="mt-16 grid gap-16 md:grid-cols-2">
        <Reveal>
          <img
            src="https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=1200&q=80"
            alt="Atelier interior" loading="lazy"
            className="aspect-[4/5] w-full object-cover"
          />
        </Reveal>
        <Reveal delay={0.15}>
          <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
            <p>{about.body ?? "Founded in 1962 by master weaver Henri Laurent, our mill began with twelve looms and a single conviction: that textile is architecture made tender."}</p>
            <p>Today, three generations later, we operate one of Europe's last fully vertically integrated mills — from raw fibre selection to finished bolt — serving fashion houses, interior designers, and luxury brands across forty countries.</p>
            <p>Our weavers train for seven years. Our dye chemists guard recipes that predate the company. Our finishers can tell a Sea Island cotton from a Pima by touch, in the dark.</p>
          </div>
        </Reveal>
      </div>

      <div className="mt-24 grid gap-12 border-t border-border/60 pt-16 md:grid-cols-3">
        {[
          { k: "62", v: "Years of craft" },
          { k: "240", v: "Master artisans" },
          { k: "40+", v: "Countries served" },
        ].map((s, i) => (
          <Reveal key={s.k} delay={i * 0.1}>
            <div className="font-display text-6xl text-accent">{s.k}</div>
            <div className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">{s.v}</div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
