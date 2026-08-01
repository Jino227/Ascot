"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "motion/react";
import {
  ArrowRight,
  Play,
  X,
  Award,
  Leaf,
  Scissors,
  Sparkles,
  ChevronDown,
  Quote,
  Gem,
  Crown,
  Eye,
  Star,
  CheckCircle2,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  getWebsiteContent,
  getFeaturedCollections,
  getVideos,
  getFeaturedVideos,
  getJourneySteps,
  getPublicDesigns,
  getPublicCelebrities,
} from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { TextReveal } from "@/components/layout/TextReveal";
import { Magnetic } from "@/components/layout/Magnetic";
import { Reveal } from "@/components/layout/Reveal";
import { Particles } from "@/components/layout/Particles";
import { FloatingGlass } from "@/components/layout/FloatingGlass";
import { GsapCounter } from "@/components/layout/GsapCounter";
import { Tilt3DCard } from "@/components/layout/Tilt3DCard";
import { SvgMorphDivider } from "@/components/layout/SvgMorphDivider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ── Hero slide type ──
interface HeroSlide {
  type: "image" | "video";
  url: string;
  alt?: string;
}

// ── Demo data ──
const DEMO = {
  hero: {
    eyebrow: "Est. 1985",
    title: "Where craftsmanship meets contemporary style.",
    subtitle:
      "Bespoke tailoring and ready-to-wear collections crafted for those who value precision, quality, and timeless design.",
    cta: "Explore collections",
    cta_url: "/collections",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=2000&q=80",
    video_url: "",
    slides: [] as HeroSlide[],
  },
  about: {
    eyebrow: "Our Heritage",
    title: "Four decades of tailoring excellence.",
    body: "Founded in 1985, Ascotex Fashions began as a small tailoring atelier with a commitment to exceptional craftsmanship. Today we create bespoke and ready-to-wear garments for discerning clients worldwide.",
    stats: [
      { key: "40+", label: "Years of Craft" },
      { key: "200+", label: "Master Artisans" },
      { key: "50+", label: "Export Countries" },
      { key: "10K+", label: "Garments / Year" },
    ],
  },
  process: {
    eyebrow: "Our Manufacturing Strength",
    title: "From design to dispatch.",
    pillars: [
      {
        icon: "Sparkles",
        title: "Design Studio",
        body: "Creative designers transform concepts into embroidery-ready artwork.",
      },
      {
        icon: "Scissors",
        title: "Sampling",
        body: "Rapid prototyping with meticulous attention to detail.",
      },
      {
        icon: "Award",
        title: "Embroidery",
        body: "Master craftsmen with decades of stitching expertise.",
      },
      {
        icon: "Leaf",
        title: "Production",
        body: "Scalable manufacturing with consistent quality.",
      },
      {
        icon: "Sparkles",
        title: "Quality Control",
        body: "Detailed inspection for stitches, beads and finishing.",
      },
      {
        icon: "Leaf",
        title: "Packaging",
        body: "Carefully packed and shipped worldwide.",
      },
    ],
  },
  testimonials: [
    {
      quote:
        "The attention to detail is extraordinary. Every aspect was executed perfectly.",
      name: "James H.",
      role: "Private Client",
    },
    {
      quote:
        "Working with Ascotex was an absolute pleasure. The results speak for themselves.",
      name: "Victoria L.",
      role: "Haute Couture Partner",
    },
    {
      quote: "From consultation to delivery, an exceptional experience.",
      name: "Alexander P.",
      role: "Corporate Client",
    },
  ],
  contact: {
    eyebrow: "Get in touch",
    title: "Start your next project.",
    body: "Request a catalogue or contact our sales team to discover bespoke creations.",
    cta: "Request Catalogue",
  },
  videos: [
    {
      id: "dv1",
      title: "Behind the Scenes",
      description: "A look behind the scenes at our latest estate project.",
      url: "https://www.w3schools.com/html/mov_bbb.mp4",
      thumbnail:
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80",
      category: "Behind the Scenes",
    },
    {
      id: "dv2",
      title: "Process — Sketch to Stitch",
      description: "Watch our process from sketch to final garment.",
      url: "https://www.w3schools.com/html/mov_bbb.mp4",
      thumbnail:
        "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&q=80",
      category: "Process",
    },
    {
      id: "dv3",
      title: "Client Testimonial",
      description: "Our client shares their experience.",
      url: "https://www.w3schools.com/html/mov_bbb.mp4",
      thumbnail:
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80",
      category: "Testimonial",
    },
  ],
  journey: [
    {
      id: "j1",
      title: "Material Sourcing",
      step_order: 1,
      image:
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80",
    },
    {
      id: "j2",
      title: "Hand Dyeing",
      step_order: 2,
      image:
        "https://images.unsplash.com/photo-1567789884554-0b844b597180?w=600&q=80",
    },
    {
      id: "j3",
      title: "Design Studio",
      step_order: 3,
      image:
        "https://images.unsplash.com/photo-1604328698692-f76ea9498e72?w=600&q=80",
    },
    {
      id: "j9",
      title: "Packaging & Dispatch",
      step_order: 9,
      image:
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80",
    },
  ],
  designs: [
    {
      id: "dd1",
      url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80",
    },
    {
      id: "dd2",
      url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80",
    },
    {
      id: "dd3",
      url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80",
    },
    {
      id: "dd4",
      url: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80",
    },
  ],
};

// ── HeroCarousel ─────────────────────────────────────────────────────────────
const CAROUSEL_INTERVAL = 5500;

function HeroCarousel({
  slides,
  fallbackImage,
}: {
  slides: HeroSlide[];
  fallbackImage: string;
}) {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = useCallback(() => {
    setActive((a) => (a + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    timerRef.current = setInterval(advance, CAROUSEL_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [advance, slides.length]);

  function goTo(idx: number) {
    if (timerRef.current) clearInterval(timerRef.current);
    setActive(idx);
    timerRef.current = setInterval(advance, CAROUSEL_INTERVAL);
  }

  if (slides.length === 0) {
    return (
      <motion.img
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, ease: "linear" }}
        src={fallbackImage}
        alt="Ascotex Showcase"
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence initial={false}>
        {slides.map((slide, idx) =>
          idx === active ? (
            <motion.div
              key={`${slide.url}-${idx}`}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: [0.25, 1, 0.5, 1] }}
              className="absolute inset-0"
            >
              {slide.type === "video" ? (
                <video
                  src={slide.url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={slide.url}
                  alt={slide.alt ?? "Ascotex Heritage"}
                  className="h-full w-full object-cover"
                />
              )}
            </motion.div>
          ) : null
        )}
      </AnimatePresence>

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === active
                  ? "w-10 bg-gold shadow-[0_0_12px_rgba(212,175,55,0.8)]"
                  : "w-2 bg-foreground/30 hover:bg-foreground/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  useEffect(() => {
    document.title = "Ascotex Fashions — Bespoke Craftsmanship & Haute Tailoring";
  }, []);

  const { user } = useAuth();
  const { data: content } = useQuery({
    queryKey: ["website_content"],
    queryFn: () => getWebsiteContent(),
  });
  const { data: featuredColl = [] } = useQuery({
    queryKey: ["collections", "featured"],
    queryFn: () => getFeaturedCollections(),
  });
  const { data: journeySteps = [] } = useQuery({
    queryKey: ["journey_steps"],
    queryFn: () => getJourneySteps(),
  });
  const { data: celebrities = [] } = useQuery({
    queryKey: ["public", "celebrities"],
    queryFn: () => getPublicCelebrities(),
  });
  const { data: videos = [] } = useQuery({
    queryKey: ["videos"],
    queryFn: () => getVideos(),
  });
  const { data: featuredVids = [] } = useQuery({
    queryKey: ["videos", "featured"],
    queryFn: () => getFeaturedVideos(),
  });
  const { data: designImages = [] } = useQuery({
    queryKey: ["designs", "public", "preview"],
    queryFn: () => getPublicDesigns(12),
  });

  const c = content ?? {};
  const rawHero = c.hero ?? {};
  const hero = { ...DEMO.hero, ...rawHero };

  const heroSlides: HeroSlide[] = (() => {
    const s = Array.isArray(rawHero.slides)
      ? (rawHero.slides as HeroSlide[])
      : [];
    if (s.length > 0) return s;
    if (hero.video_url) return [{ type: "video" as const, url: hero.video_url }];
    if (rawHero.image) return [{ type: "image" as const, url: rawHero.image }];
    return [];
  })();

  const about = { ...DEMO.about, ...(c.about ?? {}) };
  const process = { ...DEMO.process, ...(c.process ?? {}) };
  const testimonials = c.testimonials?.items?.length
    ? c.testimonials.items
    : DEMO.testimonials;
  const contact = { ...DEMO.contact, ...(c.contact ?? {}) };
  const jSteps = journeySteps.length > 0 ? journeySteps : DEMO.journey;
  const displayVideos = featuredVids.length > 0 ? featuredVids : videos;
  const showVids = displayVideos.length > 0 ? displayVideos : DEMO.videos;

  const [activePreviewImage, setActivePreviewImage] = useState<string | null>(
    null
  );
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  // ── Mouse parallax for hero ──
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 70, damping: 20 });
  const sy = useSpring(my, { stiffness: 70, damping: 20 });

  const bgX = useTransform(sx, [-0.5, 0.5], ["-16px", "16px"]);
  const bgY = useTransform(sy, [-0.5, 0.5], ["-16px", "16px"]);
  const textX = useTransform(sx, [-0.5, 0.5], ["8px", "-8px"]);
  const textY = useTransform(sy, [-0.5, 0.5], ["8px", "-8px"]);

  function onHeroMouse(e: React.MouseEvent) {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, delay: i * 0.12, ease: "easeOut" as const },
    }),
  };

  return (
    <div className="relative overflow-x-hidden bg-background text-foreground">
      {/* ══════ HERO (Cinematic 3D Experience) ══════ */}
      <section
        ref={heroRef}
        onMouseMove={onHeroMouse}
        className="relative min-h-screen flex items-center overflow-hidden py-12 md:py-20"
      >
        <motion.div
          style={{ scale: heroScale, x: bgX, y: bgY }}
          className="absolute inset-0 -z-10"
        >
          <HeroCarousel slides={heroSlides} fallbackImage={DEMO.hero.image} />
          {/* Multi-layered luxury vignettes */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
        </motion.div>

        {/* Floating Gold Dust Particles */}
        <Particles count={110} className="z-[5] opacity-75" />

        {/* Floating Glass Badges with interactive 3D feel */}
        <FloatingGlass
          float="animate-float"
          className="absolute right-[8%] top-[24%] z-20 hidden lg:block"
          delay={0.3}
        >
          <div className="px-7 py-5 text-center backdrop-blur-md bg-black/30 border border-gold/30 rounded-xl shadow-2xl">
            <Gem className="mx-auto h-5 w-5 text-gold animate-pulse" />
            <div className="mt-2 font-display text-3xl text-gradient-gold">
              40+
            </div>
            <div className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground mt-1">
              Years of Atelier Craft
            </div>
          </div>
        </FloatingGlass>

        <FloatingGlass
          float="animate-float-reverse"
          className="absolute right-[18%] bottom-[20%] z-20 hidden lg:block"
          delay={0.6}
        >
          <div className="px-7 py-5 text-center backdrop-blur-md bg-black/30 border border-gold/30 rounded-xl shadow-2xl">
            <Crown className="mx-auto h-5 w-5 text-gold" />
            <div className="mt-2 font-display text-3xl text-gradient-gold">
              10,000+
            </div>
            <div className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground mt-1">
              Bespoke Garments
            </div>
          </div>
        </FloatingGlass>

        <motion.div
          style={{ x: textX, y: textY }}
          className="container-x relative z-10 pt-28 sm:pt-36 md:pt-44 lg:pt-48 pb-16 md:pb-24"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {hero.eyebrow && (
              <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.5em] text-gold/90 mb-6 border-b border-gold/30 pb-2 font-medium">
                <Sparkles className="h-3 w-3 text-gold" />
                {hero.eyebrow}
              </span>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="mb-3 font-script text-3xl md:text-5xl text-champagne/95 italic tracking-wide"
          >
            Crafted with Passion & Precision
          </motion.div>

          <h1 className="max-w-4xl font-display text-5xl leading-[1.04] md:text-8xl text-foreground tracking-tight">
            <TextReveal text={hero.title} delay={0.1} />
          </h1>

          {hero.subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.5 }}
              className="mt-6 max-w-xl text-base text-foreground/80 md:text-lg leading-relaxed font-light"
            >
              {hero.subtitle}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-10 flex flex-wrap gap-4 items-center"
          >
            <Magnetic>
              <Button
                asChild
                size="lg"
                className="rounded-none bg-accent text-accent-foreground hover:bg-accent/90 text-xs uppercase tracking-[0.2em] px-8 py-6 h-auto shadow-[0_0_25px_rgba(212,175,55,0.3)] transition-all duration-300"
              >
                <Link
                  href={
                    hero.cta_url ||
                    (hero.cta === "Explore collections"
                      ? "/collections"
                      : "/contact")
                  }
                >
                  {hero.cta || "Explore Collections"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Magnetic>
          </motion.div>

          {/* Scroll Down Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 cursor-pointer"
            onClick={() =>
              window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
            }
          >
            <span className="text-[9px] uppercase tracking-[0.3em] text-foreground/50 font-light">
              Scroll
            </span>
            <ChevronDown className="h-5 w-5 text-gold animate-bounce" />
          </motion.div>
        </motion.div>
      </section>

      {/* ══════ LUXURY MARQUEE BAND ══════ */}
      <div className="relative overflow-hidden border-y border-gold/30 bg-gradient-to-r from-espresso via-charcoal to-espresso py-6 shadow-xl">
        <div
          className="flex w-max animate-marquee gap-0"
          style={{ ["--marquee-duration" as any]: "30s" }}
        >
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center gap-0">
              {[
                "Hand Embroidery",
                "Bespoke Tailoring",
                "Haute Couture Fabrics",
                "Made to Measure",
                "Est. 1985 Atelier",
                "Worldwide Luxury Delivery",
              ].map((word) => (
                <span
                  key={word + dup}
                  className="flex items-center gap-8 px-10 text-xs md:text-sm uppercase tracking-[0.35em] text-champagne/90 font-light"
                >
                  {word}
                  <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_#D4AF37]" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ══════ COMPANY INTRODUCTION + STATS ══════ */}
      <section className="container-x py-28 md:py-40 relative">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
          >
            {about.eyebrow && (
              <p className="text-xs uppercase tracking-[0.4em] text-accent/90 font-medium">
                {about.eyebrow}
              </p>
            )}
            <h2 className="mt-6 font-display text-4xl md:text-6xl leading-[1.1] text-balance">
              {about.title}
            </h2>
            <div className="h-px w-20 bg-gradient-to-r from-gold to-transparent my-8" />
            {about.body && (
              <p className="text-base md:text-lg leading-relaxed text-muted-foreground font-light max-w-xl">
                {about.body}
              </p>
            )}

            <div className="mt-10 flex items-center gap-6">
              <Magnetic>
                <Button
                  asChild
                  variant="link"
                  className="h-auto p-0 text-accent text-xs uppercase tracking-[0.2em] group"
                >
                  <Link href="/about">
                    Read Our Heritage Story
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
                  </Link>
                </Button>
              </Magnetic>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
          >
            <div className="grid grid-cols-2 gap-6 md:gap-8">
              {(about.stats || []).map((s: any, i: number) => (
                <Tilt3DCard key={i} maxTilt={10} scaleOnHover={1.04}>
                  <div className="group rounded-xl border border-border/60 bg-secondary/30 backdrop-blur-md p-7 text-center shadow-lg transition-all duration-500 hover:border-gold/50">
                    <div className="font-display text-3xl md:text-5xl text-gradient-gold font-normal">
                      <GsapCounter value={s.key} />
                    </div>
                    <div className="mt-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                      {s.label}
                    </div>
                    <div className="mx-auto mt-4 h-0.5 w-0 bg-gold transition-all duration-500 group-hover:w-16" />
                  </div>
                </Tilt3DCard>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* SVG Morphing Flourish Divider */}
      <SvgMorphDivider />

      {/* ══════ DESIGNS PREVIEW ══════ */}
      <section className="container-x py-20 md:py-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={sectionVariants}
          custom={0}
        >
          <p className="text-xs uppercase tracking-[0.4em] text-accent/90 text-center font-medium">
            Designs &amp; Collections
          </p>
          <h2 className="mt-4 font-display text-4xl md:text-6xl text-center">
            Our Atelier Work
          </h2>
          <p className="mt-4 text-center text-sm text-muted-foreground font-light max-w-lg mx-auto">
            Discover bespoke embroidery patterns, couture silhouettes, and client creations.
          </p>
        </motion.div>

        {designImages.length > 0 ? (
          <div className="mt-16 columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
            {designImages.slice(0, 12).map((img: any, i: number) => (
              <motion.div
                key={img.id ?? i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: (i % 6) * 0.08 }}
                onClick={() => setActivePreviewImage(img.url)}
                className="break-inside-avoid group relative overflow-hidden rounded-xl border border-border/40 cursor-pointer shadow-md"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.alt ?? "Ascotex Design"}
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-108"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div className="flex items-center justify-between w-full text-white">
                    <span className="text-xs font-light tracking-wider">
                      View Design
                    </span>
                    <Eye className="h-4 w-4 text-gold" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Fallback when no images uploaded yet — show demo designs */
          <div className="mt-16 columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
            {DEMO.designs.map((img, i) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                onClick={() => setActivePreviewImage(img.url)}
                className="break-inside-avoid group relative overflow-hidden rounded-xl border border-border/40 cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt="Design"
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-108"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-gold" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* View all button */}
        <div className="text-center mt-14">
          <Magnetic>
            <Button
              asChild
              variant="outline"
              className="rounded-none text-xs uppercase tracking-[0.2em] px-8 py-5 h-auto border-gold/40 hover:border-gold hover:bg-gold/10"
            >
              <Link href="/designs">
                View All Designs <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Magnetic>
        </div>
      </section>

      {/* ══════ OUR STORY ══════ */}
      {(c.our_story?.content || about.body) && (
        <section id="our-story" className="relative py-28 md:py-40 bg-secondary/30 border-y border-border/30 overflow-hidden">
          <div className="absolute inset-0 bg-grain pointer-events-none opacity-40" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] bg-gold/[0.07] rounded-full blur-3xl animate-glow pointer-events-none" />
          <Particles count={55} className="opacity-60 pointer-events-none" />

          <div className="container-x max-w-5xl mx-auto relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={sectionVariants}
              custom={0}
            >
              <Tilt3DCard maxTilt={4} scaleOnHover={1.01}>
                <div className="relative rounded-2xl border border-gold/40 bg-black/60 backdrop-blur-2xl p-8 sm:p-14 md:p-20 text-center shadow-2xl overflow-hidden">
                  <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gold/15 blur-3xl" />
                  
                  <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center mx-auto mb-6">
                    <Crown className="h-6 w-6 text-gold" />
                  </div>

                  <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-gold font-medium mb-3">
                    <Sparkles className="h-3.5 w-3.5 text-gold" /> Four Decades of Heritage
                  </span>

                  <div className="font-script text-3xl md:text-5xl text-champagne/90 italic mb-2">The Story of Ascotex</div>
                  
                  <h2 className="font-display text-4xl md:text-6xl text-foreground leading-tight">
                    Legacy of Excellence
                  </h2>

                  <div className="mt-8 text-base md:text-xl text-foreground/80 leading-relaxed font-light whitespace-pre-wrap max-w-3xl mx-auto">
                    {c.our_story?.content || about.body}
                  </div>

                  <div className="mt-12">
                    <Magnetic className="inline-block">
                      <Button
                        asChild
                        size="lg"
                        className="rounded-none bg-accent text-accent-foreground hover:bg-accent/90 text-xs uppercase tracking-[0.2em] px-10 py-6 h-auto shadow-[0_0_30px_rgba(212,175,55,0.35)]"
                      >
                        <Link href="/about">
                          Read Full Heritage Story <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </Magnetic>
                  </div>
                </div>
              </Tilt3DCard>
            </motion.div>
          </div>
        </section>
      )}

      {/* ══════ JOURNEY PREVIEW (The Craft Timeline) ══════ */}
      {jSteps.length > 0 && (
        <section className="relative bg-secondary/40 py-28 md:py-40 overflow-hidden">
          <div className="absolute inset-0 bg-grain pointer-events-none opacity-50" />
          <div className="container-x relative">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={sectionVariants}
              custom={0}
            >
              <p className="text-xs uppercase tracking-[0.4em] text-accent/90 text-center font-medium">
                Our Atelier Process
              </p>
              <h2 className="mt-4 font-display text-4xl md:text-6xl text-center">
                The Journey
              </h2>
            </motion.div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
              {jSteps.slice(0, 8).map((step: any, i: number) => (
                <Tilt3DCard key={step.id || i} maxTilt={8} scaleOnHover={1.03}>
                  <div className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-border/50 bg-black/40 shadow-lg">
                    {step.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={step.image}
                        alt={step.title || "Step"}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground/40 text-xs">
                        No Image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-500" />
                    <div className="absolute bottom-5 left-5 right-5">
                      <span className="font-display text-3xl text-gold font-light block mb-1">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="font-display text-lg text-foreground font-normal">
                        {step.title}
                      </h3>
                    </div>
                  </div>
                </Tilt3DCard>
              ))}
            </div>

            <div className="text-center mt-14">
              <Magnetic>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-none text-xs uppercase tracking-[0.2em] px-8 py-5 h-auto border-gold/40 hover:border-gold hover:bg-gold/10"
                >
                  <Link href="/journey">
                    See Full Journey <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </Magnetic>
            </div>
          </div>
        </section>
      )}

      {/* ══════ CELEBRITY SHOWCASE ══════ */}
      {celebrities.length > 0 && (
        <section className="py-28 md:py-40">
          <div className="container-x">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={sectionVariants}
              custom={0}
            >
              <p className="text-xs uppercase tracking-[0.4em] text-accent/90 text-center font-medium">
                Red Carpet &amp; Icons
              </p>
              <h2 className="mt-4 font-display text-4xl md:text-6xl text-center">
                Celebrity Showcase
              </h2>
            </motion.div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {celebrities.map((c: any, i: number) => (
                <Tilt3DCard key={c.id || i} maxTilt={6}>
                  <div className="group flex flex-col rounded-xl overflow-hidden border border-border/40 bg-secondary/20 p-3 shadow-md">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted mb-4">
                      {c.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.image}
                          alt={c.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground/40 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="px-2 pb-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-xl">{c.name}</h3>
                        <Star className="h-4 w-4 text-gold fill-gold/20" />
                      </div>
                      {c.description && (
                        <p className="mt-1 text-xs text-muted-foreground font-light line-clamp-2">
                          {c.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Tilt3DCard>
              ))}
            </div>

            <div className="text-center mt-14">
              <Magnetic>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-none text-xs uppercase tracking-[0.2em] px-8 py-5 h-auto border-gold/40 hover:border-gold hover:bg-gold/10"
                >
                  <Link href="/celebrities">
                    View All Celebrities <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </Magnetic>
            </div>
          </div>
        </section>
      )}

      {/* SVG Morphing Divider */}
      <SvgMorphDivider />

      {/* ══════ MANUFACTURING STRENGTH ══════ */}
      <section className="container-x py-24 md:py-36">
        {process.eyebrow && (
          <p className="text-xs uppercase tracking-[0.4em] text-accent/90 text-center font-medium">
            {process.eyebrow}
          </p>
        )}
        <h2 className="mt-4 font-display text-4xl md:text-6xl text-center">
          {process.title}
        </h2>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {process.pillars.map((p: any, i: number) => {
            const Icon =
              {
                Leaf: Leaf,
                Scissors: Scissors,
                Award: Award,
                Sparkles: Sparkles,
              }[p.icon as string] ?? Sparkles;

            return (
              <Tilt3DCard key={i} maxTilt={8} scaleOnHover={1.03}>
                <div className="group h-full rounded-xl border border-border/50 bg-secondary/20 p-8 text-center shadow-lg transition-all duration-500 hover:border-gold/40 hover:bg-secondary/40">
                  <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6 overflow-hidden border border-gold/30 shadow-inner">
                    <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/20 transition-colors duration-500 rounded-full" />
                    <Icon className="h-7 w-7 text-gold" />
                  </div>
                  <h3 className="font-display text-xl">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground font-light">
                    {p.body}
                  </p>
                </div>
              </Tilt3DCard>
            );
          })}
        </div>
      </section>

      {/* ══════ TESTIMONIALS ══════ */}
      {testimonials.length > 0 && (
        <section className="relative bg-secondary/40 py-28 md:py-40 overflow-hidden border-t border-border/30">
          <div className="absolute inset-0 bg-grain pointer-events-none opacity-40" />
          <div className="container-x relative">
            <p className="text-xs uppercase tracking-[0.4em] text-accent/90 text-center font-medium">
              Global Endorsements
            </p>
            <h2 className="mt-4 font-display text-4xl md:text-5xl text-center">
              Voices of Distinction
            </h2>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {testimonials.map((t: any, i: number) => (
                <Tilt3DCard key={i} maxTilt={6}>
                  <div className="h-full rounded-xl border border-border/50 bg-black/40 backdrop-blur-md p-8 shadow-xl flex flex-col justify-between">
                    <div>
                      <Quote className="h-8 w-8 text-gold/50 mb-4" />
                      <blockquote className="font-display text-lg leading-relaxed text-foreground/90 font-light">
                        &ldquo;{t.quote}&rdquo;
                      </blockquote>
                    </div>
                    <div className="mt-8 pt-5 border-t border-border/40 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-xs font-semibold text-gold">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-foreground">
                          {t.name}
                        </div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          {t.role}
                        </div>
                      </div>
                    </div>
                  </div>
                </Tilt3DCard>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════ CONTACT CTA ══════ */}
      <section className="relative py-36 md:py-52 overflow-hidden bg-grain">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-ink via-espresso to-ink" />
        <div className="absolute top-1/4 left-1/3 w-[30rem] h-[30rem] bg-gold/[0.08] rounded-full blur-3xl animate-glow pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold-deep/[0.07] rounded-full blur-3xl animate-glow-slow pointer-events-none" />

        <Particles count={70} className="opacity-70" />

        <div className="container-x relative">
          <div className="max-w-2xl mx-auto text-center">
            {contact.eyebrow && (
              <p className="text-xs uppercase tracking-[0.4em] text-accent/80 font-medium">
                {contact.eyebrow}
              </p>
            )}
            <h2 className="mt-6 font-display text-4xl md:text-7xl text-foreground leading-tight text-balance">
              {contact.title}
            </h2>
            {contact.body && (
              <p className="mt-6 text-lg text-foreground/70 font-light leading-relaxed">
                {contact.body}
              </p>
            )}
            <Magnetic className="mt-12 inline-block">
              <Button
                asChild
                size="lg"
                className="rounded-none bg-accent text-accent-foreground hover:bg-accent/90 text-xs uppercase tracking-[0.2em] px-12 py-6 h-auto shadow-[0_0_35px_rgba(212,175,55,0.4)] transition-all duration-300"
              >
                <Link href="/contact">
                  {contact.cta || "Get in Touch"}{" "}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Magnetic>
          </div>
        </div>
      </section>

      {/* Lightbox / Modal for Image Preview */}
      <AnimatePresence>
        {activePreviewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePreviewImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-xl border border-gold/40 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePreviewImage}
                alt="Full Preview"
                className="w-full h-auto max-h-[85vh] object-contain"
              />
              <button
                onClick={() => setActivePreviewImage(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-gold hover:text-black transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
