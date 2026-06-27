"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { motion } from "motion/react";
import { getWebsiteContent } from "@/lib/actions";
import { Reveal } from "@/components/layout/Reveal";

const DEMO_IMG = "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=80";
const DEMO = {
  title: "Four decades of tailoring excellence.",
  subtitle: "From our founding in 1985 to our atelier on Savile Row, every garment tells a story of precision and passion.",
  image: DEMO_IMG,
  body1: "Ascot Fashions was founded by master tailor William Ascot, who apprenticed on Savile Row before opening his own atelier. His vision was simple: create garments that honour the traditions of British tailoring while embracing modern silhouettes and sensibilities.",
  body2: "Today, our team of twelve master tailors continues this legacy. Each garment passes through dozens of hands — from pattern cutter to finisher — before it reaches our fitting rooms. We believe that clothing should not just fit, but feel like it belongs to you.",
  body3: "We serve clients from London to Tokyo, creating everything from business suits and evening wear to casual jackets and overcoats. Every commission is treated with the same attention to detail that has defined our house for four decades.",
  stats: [
    { key: "40", label: "Years of craft" },
    { key: "12", label: "Master tailors" },
    { key: "5,000+", label: "Garments crafted" },
  ],
};

export default function About() {
  useEffect(() => { document.title = "About — Ascot Fashions"; }, []);
  const { data: content } = useQuery({ queryKey: ["website_content"], queryFn: () => getWebsiteContent() });
  const page = { ...DEMO, ...(content?.about_page ?? {}) };

  const sectionVariant = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: i * 0.15, ease: "easeInOut" as const } }),
  };

  function Counter({ value }: { value: string }) {
    return (
      <motion.span
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        className="font-display text-6xl text-accent"
      >
        {value}
      </motion.span>
    );
  }

  return (
    <div>
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={sectionVariant} className="container-x pt-28 pb-8 md:pt-40 md:pb-12">
        <p className="text-xs uppercase tracking-[0.4em] text-accent/80">Our story</p>
        <h1 className="mt-6 max-w-3xl font-display text-5xl leading-tight md:text-7xl">{page.title}</h1>
      </motion.div>

      {page.image && (
        <motion.div initial={{ opacity: 0, scale: 1.05 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1.2 }} className="w-full h-[50vh] md:h-[70vh] overflow-hidden">
          <img src={page.image} alt="Ascot Fashions atelier" className="h-full w-full object-cover" />
        </motion.div>
      )}

      <div className="container-x py-20 md:py-32">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={sectionVariant} className="grid gap-16 md:grid-cols-2 md:gap-20">
          <div>
            {page.subtitle && <p className="text-lg text-accent leading-relaxed">{page.subtitle}</p>}
          </div>
          <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
            {page.body1 && <p>{page.body1}</p>}
            {page.body2 && <p>{page.body2}</p>}
            {page.body3 && <p>{page.body3}</p>}
          </div>
        </motion.div>
      </div>

      {page.stats && page.stats.length > 0 && (
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-secondary/40 py-24 md:py-32">
          <div className="container-x">
            <div className="grid gap-12 md:grid-cols-3">
              {page.stats.map((s: any, i: number) => (
                <motion.div key={i} custom={i} variants={sectionVariant} className="text-center">
                  <Counter value={s.key} />
                  <div className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
                  <motion.div initial={{ width: 0 }} whileInView={{ width: 40 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }} className="h-px bg-accent/40 mx-auto mt-6" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
