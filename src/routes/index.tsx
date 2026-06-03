import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { ArrowRight, Award, Leaf, Scissors, Sparkles } from "lucide-react";
import { getCollections, getFeaturedProducts, getWebsiteContent } from "@/lib/content.functions";
import { Reveal } from "@/components/layout/Reveal";
import { Button } from "@/components/ui/button";

const contentQ = queryOptions({ queryKey: ["website_content"], queryFn: () => getWebsiteContent() });
const collectionsQ = queryOptions({ queryKey: ["collections", "public"], queryFn: () => getCollections({ data: {} }) });
const featuredQ = queryOptions({ queryKey: ["products", "featured"], queryFn: () => getFeaturedProducts() });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maison·Loom — Heritage Textile Manufacturing" },
      { name: "description", content: "Premium woven textiles for fashion houses, interior designers, and luxury brands. Crafted in our vertically integrated mills since 1962." },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(contentQ),
      context.queryClient.ensureQueryData(collectionsQ),
      context.queryClient.ensureQueryData(featuredQ),
    ]);
  },
  errorComponent: ({ error }) => <div className="container-x py-20">Couldn't load the page: {error.message}</div>,
  component: Home,
});

function Home() {
  const { data: content } = useSuspenseQuery(contentQ);
  const { data: collections } = useSuspenseQuery(collectionsQ);
  const { data: featured } = useSuspenseQuery(featuredQ);

  const hero = content.hero ?? {};
  const about = content.about ?? {};
  const manufacturing = content.manufacturing ?? {};
  const testimonials = content.testimonials?.items ?? [];
  const contact = content.contact ?? {};

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.45)), url(${hero.image ?? "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=2000&q=80"})`,
          }}
        />
        <div className="container-x flex min-h-[88vh] flex-col justify-end pb-20 pt-32 text-background md:pb-32">
          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="text-xs uppercase tracking-[0.4em] text-background/80"
          >
            {hero.eyebrow ?? "Since 1962"}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.15 }}
            className="mt-4 max-w-3xl font-display text-5xl leading-[1.05] text-balance md:text-7xl"
          >
            {hero.title ?? "The art of weaving, refined for the modern atelier."}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3 }}
            className="mt-6 max-w-xl text-base text-background/85 md:text-lg"
          >
            {hero.subtitle ?? "Vertically integrated textile manufacturing for fashion houses, interior designers, and luxury brands."}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.45 }}
            className="mt-10 flex flex-wrap gap-3"
          >
            <Button asChild size="lg" className="rounded-none bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/collections">{hero.cta ?? "Explore collections"}<ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-none border-background/60 bg-transparent text-background hover:bg-background hover:text-foreground">
              <Link to="/contact">Request a sample</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="container-x py-24 md:py-32">
        <div className="grid gap-14 md:grid-cols-2 md:gap-20">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.4em] text-accent">{about.eyebrow ?? "The Atelier"}</p>
            <h2 className="mt-5 font-display text-4xl leading-tight md:text-5xl">
              {about.title ?? "Six decades of weaving, in service of singular vision."}
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {about.body ?? "Founded in 1962, our atelier brings together master weavers, dyers, and finishers under a single roof. Every meter that leaves our mill is the work of hands that have refined their craft over generations."}
            </p>
            <Button asChild variant="link" className="mt-6 h-auto p-0 text-accent">
              <Link to="/about">Read our story <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* FEATURED COLLECTIONS */}
      <section className="bg-secondary/40 py-24 md:py-32">
        <div className="container-x">
          <Reveal>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-accent">Collections</p>
                <h2 className="mt-4 font-display text-4xl md:text-5xl">Featured weaves</h2>
              </div>
              <Link to="/collections" className="hidden text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground md:inline">View all →</Link>
            </div>
          </Reveal>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {collections.slice(0, 6).map((c, i) => (
              <Reveal key={c.id} delay={i * 0.08}>
                <Link to="/collections/$slug" params={{ slug: c.slug }} className="group block">
                  <div className="aspect-[4/5] overflow-hidden bg-muted">
                    <img
                      src={c.cover_image ?? "https://images.unsplash.com/photo-1605883705077-8d3d3cebe78c?w=900&q=80"}
                      alt={c.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-5 font-display text-2xl">{c.name}</h3>
                  {c.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>}
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* MANUFACTURING */}
      <section className="container-x py-24 md:py-32">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.4em] text-accent">{manufacturing.eyebrow ?? "Process"}</p>
          <h2 className="mt-5 max-w-2xl font-display text-4xl md:text-5xl">
            {manufacturing.title ?? "Manufacturing excellence, end to end."}
          </h2>
        </Reveal>
        <div className="mt-16 grid gap-10 md:grid-cols-4">
          {(manufacturing.pillars ?? [
            { icon: "Leaf", title: "Responsibly sourced", body: "Long-staple cottons, mulberry silks, and Mongolian cashmere." },
            { icon: "Scissors", title: "Mastered in-house", body: "Spinning, weaving, dyeing, and finishing under one roof." },
            { icon: "Award", title: "Certified quality", body: "GOTS, OEKO-TEX, and ISO 9001 across our operations." },
            { icon: "Sparkles", title: "Bespoke service", body: "Custom palettes, weights, and finishes for your house." },
          ]).map((p: any, i: number) => {
            const Icon = ({ Leaf, Scissors, Award, Sparkles } as any)[p.icon] ?? Sparkles;
            return (
              <Reveal key={i} delay={i * 0.08}>
                <Icon className="h-6 w-6 text-accent" />
                <h3 className="mt-5 font-display text-xl">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      {featured.length > 0 && (
        <section className="bg-foreground py-24 text-background md:py-32">
          <div className="container-x">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.4em] text-accent">Selections</p>
              <h2 className="mt-4 font-display text-4xl md:text-5xl">From the loom</h2>
            </Reveal>
            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p: any, i: number) => (
                <Reveal key={p.id} delay={i * 0.06}>
                  <div className="aspect-square overflow-hidden bg-background/5">
                    <img
                      src={p.product_images?.[0]?.url ?? "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=900&q=80"}
                      alt={p.name} loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-4 font-display text-xl">{p.name}</h3>
                  {p.composition && <p className="text-xs uppercase tracking-widest text-background/60">{p.composition}</p>}
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="container-x py-24 md:py-32">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.4em] text-accent">In their words</p>
          </Reveal>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {testimonials.map((t: any, i: number) => (
              <Reveal key={i} delay={i * 0.1}>
                <blockquote className="font-display text-2xl leading-snug">"{t.quote}"</blockquote>
                <div className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">
                  {t.name} — {t.role}
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* CONTACT CTA */}
      <section className="bg-secondary/40 py-24 md:py-32">
        <div className="container-x grid gap-10 md:grid-cols-2 md:items-center">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.4em] text-accent">{contact.eyebrow ?? "Get in touch"}</p>
            <h2 className="mt-5 font-display text-4xl md:text-5xl">
              {contact.title ?? "Begin a collaboration."}
            </h2>
            <p className="mt-5 max-w-md text-muted-foreground">
              {contact.body ?? "Tell us about your collection. Our atelier team replies within two business days."}
            </p>
          </Reveal>
          <Reveal delay={0.15} className="md:justify-self-end">
            <Button asChild size="lg" className="rounded-none bg-foreground text-background hover:bg-foreground/90">
              <Link to="/contact">Request a consultation <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
