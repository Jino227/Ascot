"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getWebsiteContent } from "@/lib/actions";

type InfrastructureItem = {
  description?: string;
  image?: string;
};

export default function InfrastructurePage() {
  useEffect(() => {
    document.title = "Infrastructure — Ascotex Fashions";
  }, []);

  const { data: content } = useQuery({
    queryKey: ["website_content"],
    queryFn: () => getWebsiteContent(),
  });

  const page = content?.infrastructure_page ?? content?.about_page ?? {};
  const items: InfrastructureItem[] = Array.isArray(page.facilities) ? page.facilities : [];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="container-x py-32 md:py-44">
        <h1 className="mb-12 text-center font-display text-4xl leading-tight sm:text-5xl md:mb-16 md:text-7xl">
          {page.title || "Our Infrastructure"}
        </h1>

        <div className="mx-auto grid max-w-6xl gap-12 md:gap-16">
          {items.filter((item) => item.image).map((item, index) => (
            <article key={`${item.image}-${index}`} className="overflow-hidden rounded-2xl border border-gold/20 bg-black/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt=""
                className="max-h-[70vh] w-full object-cover"
                loading={index > 1 ? "lazy" : "eager"}
              />
              {item.description && (
                <div className="space-y-3 p-6 md:p-8">
                  {item.description && <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">{item.description}</p>}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
