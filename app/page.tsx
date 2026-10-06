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
  useReducedMotion,
  MotionConfig,
  useMotionTemplate,
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
  ChevronLeft,
  ChevronRight,
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
import { LiquidAtmosphere } from "@/components/layout/LiquidAtmosphere";
import { PageLoader } from "@/components/layout/PageLoader";

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
    eyebrow: "Est. 2004",
    title: "Where craftsmanship meets contemporary style.",
    subtitle:
      "Bespoke tailoring and ready-to-wear collections crafted for those who value precision, quality, and timeless design.",
    cta: "Explore collections",
    cta_url: "/collections",
    image: "/images/atelier-hero.jpg",
    video_url: "",
    slides: [] as HeroSlide[],
  },
  infrastructure: {
    eyebrow: "State-of-the-Art Infrastructure",
    title: "Industrial precision meets bespoke craftsmanship.",
    body: "Powered by 45,000 sq. ft. of advanced manufacturing capabilities, high-speed multi-head computerized embroidery machines, automated laser cutting, and specialized garment finishing units engineered for global luxury standards.",
    stats: [
      { key: "45K+", label: "Sq. Ft. Facility" },
      { key: "150+", label: "Modern Machines" },
      { key: "500+", label: "Skilled Workforce" },
      { key: "50K+", label: "Garments / Month" },
    ],
  },
  about: {
    eyebrow: "State-of-the-Art Infrastructure",
    title: "Industrial precision meets bespoke craftsmanship.",
    body: "Powered by 45,000 sq. ft. of advanced manufacturing capabilities, high-speed multi-head computerized embroidery machines, automated laser cutting, and specialized garment finishing units engineered for global luxury standards.",
    stats: [
      { key: "45K+", label: "Sq. Ft. Facility" },
      { key: "150+", label: "Modern Machines" },
      { key: "500+", label: "Skilled Workforce" },
      { key: "50K+", label: "Garments / Month" },
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

function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
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

  if (slides.length === 0) return null;

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
              className={`h-1.5 rounded-full transition-all duration-500 ${idx === active
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

function HomeContent() {
  useEffect(() => {
    document.title = "Ascotex Fashions — Bespoke Craftsmanship & Haute Tailoring";
  }, []);

  const { user } = useAuth();
  const { data: content, isLoading: isL1 } = useQuery({
    queryKey: ["website_content"],
    queryFn: () => getWebsiteContent(),
  });
  const { data: featuredColl = [], isLoading: isL2 } = useQuery({
    queryKey: ["collections", "featured"],
    queryFn: () => getFeaturedCollections(),
  });
  const { data: journeySteps = [], isLoading: isL3 } = useQuery({
    queryKey: ["journey_steps"],
    queryFn: () => getJourneySteps(),
  });
  const { data: celebrities = [], isLoading: isL4 } = useQuery({
    queryKey: ["public", "celebrities"],
    queryFn: () => getPublicCelebrities(),
  });
  const { data: videos = [], isLoading: isL5 } = useQuery({
    queryKey: ["videos"],
    queryFn: () => getVideos(),
  });
  const { data: featuredVids = [], isLoading: isL6 } = useQuery({
    queryKey: ["videos", "featured"],
    queryFn: () => getFeaturedVideos(),
  });
  const { data: designImages = [], isLoading: isL7 } = useQuery({
    queryKey: ["designs", "public", "preview"],
    queryFn: () => getPublicDesigns(12),
  });

  const isLoading = isL1 || isL2 || isL3 || isL4 || isL5 || isL6 || isL7;

  const c = content ?? {};
  const hero = c.hero ?? {};

  const heroSlides: HeroSlide[] = (() => {
    const s = Array.isArray(hero.slides)
      ? (hero.slides as HeroSlide[])
      : [];
    if (s.length > 0) return s;
    if (hero.video_url) return [{ type: "video" as const, url: hero.video_url }];
    if (hero.image) return [{ type: "image" as const, url: hero.image }];
    return DEMO.hero.image
      ? [{ type: "image" as const, url: DEMO.hero.image, alt: "Hand embroidery detailing on couture fabric" }]
      : [];
  })();

  const infrastructure = c.infrastructure ?? (
    c.about && (!c.about.eyebrow || !c.about.eyebrow.toLowerCase().includes("heritage"))
      ? c.about
      : DEMO.infrastructure
  );
  const about = infrastructure;
  const storyImages = Array.isArray(c.our_story?.images)
    ? c.our_story.images
    : (() => {
      const legacyInfrastructure = c.infrastructure_page ?? c.about_page ?? {};
      const galleryImages = Array.isArray(legacyInfrastructure.facilities)
        ? legacyInfrastructure.facilities.filter((item: any) => item.image).map((item: any) => ({ url: item.image, alt: "" }))
        : [];
      return galleryImages.length > 0
        ? galleryImages
        : legacyInfrastructure.image ? [{ url: legacyInfrastructure.image, alt: "" }] : [];
    })();
  const process = c.process ?? {};
  const testimonials = c.testimonials?.items ?? [];
  const contact = c.contact ?? {};
  const jSteps = journeySteps;
  const showVids = featuredVids.length > 0 ? featuredVids : videos;

  const [activePreviewImage, setActivePreviewImage] = useState<string | null>(
    null
  );
  const [activePreviewIndex, setActivePreviewIndex] = useState<number>(0);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  // ── Global mouse spotlight ──
  const reducedMotion = useReducedMotion();
  const pointerX = useMotionValue(-1000);
  const pointerY = useMotionValue(-1000);
  const spotlight = useMotionTemplate`radial-gradient(650px circle at ${pointerX}px ${pointerY}px, rgba(212, 175, 55, 0.06), transparent 80%)`;

  // ── Global scroll progress bar ──
  const { scrollYProgress: pageScrollProgress } = useScroll();

  const prevPreviewImage = useCallback(() => {
    if (designImages.length === 0) return;
    const newIdx =
      (activePreviewIndex - 1 + Math.min(designImages.length, 12)) %
      Math.min(designImages.length, 12);
    setActivePreviewIndex(newIdx);
    setActivePreviewImage(designImages[newIdx]?.url ?? null);
  }, [activePreviewIndex, designImages]);

  const nextPreviewImage = useCallback(() => {
    if (designImages.length === 0) return;
    const newIdx =
      (activePreviewIndex + 1) % Math.min(designImages.length, 12);
    setActivePreviewIndex(newIdx);
    setActivePreviewImage(designImages[newIdx]?.url ?? null);
  }, [activePreviewIndex, designImages]);

  useEffect(() => {
    if (!activePreviewImage) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setActivePreviewImage(null);
      if (e.key === "ArrowLeft") prevPreviewImage();
      if (e.key === "ArrowRight") nextPreviewImage();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePreviewImage, prevPreviewImage, nextPreviewImage]);

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
    if (!rect || reducedMotion) return;
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleGlobalMouseMove(e: React.MouseEvent) {
    if (reducedMotion) return;
    pointerX.set(e.clientX);
    pointerY.set(e.clientY);
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
    <div
      onMouseMove={handleGlobalMouseMove}
      className="home-alive relative overflow-x-hidden bg-background text-foreground"
    >
      {/* Top Luxury Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-gold/50 via-gold to-champagne z-50 origin-left shadow-[0_0_12px_rgba(212,175,55,0.8)] pointer-events-none"
        style={{ scaleX: pageScrollProgress }}
      />

      {/* Ambient Luxury Mouse Spotlight */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-500 opacity-60"
        style={{
          background: spotlight,
        }}
      />
      {/* ══════ HERO (Cinematic 3D Experience) ══════ */}
      <section
        ref={heroRef}
        onMouseMove={onHeroMouse}
        onMouseLeave={() => { mx.set(0); my.set(0); }}
        className="alive-hero relative isolate min-h-screen flex items-center overflow-hidden py-12 md:py-20"
      >
        <motion.div
          style={{ scale: reducedMotion ? 1 : heroScale, x: reducedMotion ? 0 : bgX, y: reducedMotion ? 0 : bgY }}
          className="pointer-events-none absolute inset-0 z-0"
        >
          <HeroCarousel slides={heroSlides} />
          {/* Multi-layered luxury vignettes */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#100c09]/90 via-[#17100c]/48 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-[#b17c56]/10 mix-blend-screen" />
        </motion.div>

        <LiquidAtmosphere />

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
              20+
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
          style={{ x: reducedMotion ? 0 : textX, y: reducedMotion ? 0 : textY }}
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
            className="mb-3 font-script text-3xl md:text-5xl text-[#f3dfc5] italic tracking-wide drop-shadow-[0_2px_18px_rgba(0,0,0,0.65)]"
          >
            Crafted with Passion & Precision
          </motion.div>

          <h1 className="max-w-4xl font-display text-3xl sm:text-5xl leading-[1.08] md:text-8xl text-[#fffaf4] tracking-tight drop-shadow-[0_3px_22px_rgba(0,0,0,0.7)]">
            <TextReveal text={hero.title} delay={0.1} />
          </h1>

          {hero.subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.5 }}
              className="mt-6 max-w-xl text-base text-[#f7eee3]/90 md:text-lg leading-relaxed font-light drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]"
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
                className="liquid-button bg-accent text-accent-foreground hover:bg-accent/90 text-xs uppercase tracking-[0.2em] px-8 py-6 h-auto shadow-[0_0_25px_rgba(212,175,55,0.3)] transition-all duration-300"
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
      <div className="relative overflow-hidden border-y border-gold/30 bg-gradient-to-r from-espresso via-charcoal to-espresso py-6 shadow-xl [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div
          className="flex w-max animate-marquee gap-0 hover:[animation-play-state:paused]"
          style={{ ["--marquee-duration" as any]: "30s" }}
        >
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center gap-0">
              {[
                "Hand Embroidery",
                "Bespoke Tailoring",
                "Haute Couture Fabrics",
                "Made to Measure",
                "Est. 2004 Atelier",
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

      {/* SVG Morphing Flourish Divider */}
      <SvgMorphDivider className="home-divider" />

      {/* ══════ DESIGNS PREVIEW ══════ */}
      <section className="container-x py-10 md:py-16">
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

        {designImages.length > 0 && (
          <div className="mt-16 columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
            {designImages.slice(0, 12).map((img: any, i: number) => (
              <motion.div
                key={img.id ?? i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: (i % 6) * 0.08 }}
                onClick={() => {
                  setActivePreviewIndex(i);
                  setActivePreviewImage(img.url);
                }}
                className="alive-gallery-card break-inside-avoid group relative overflow-hidden rounded-xl border border-border/40 cursor-pointer shadow-md transition-all duration-500 hover:border-gold/60 hover:shadow-[0_0_30px_rgba(212,175,55,0.25)]"
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
        )}

        {/* View all button */}
        <div className="text-center mt-14">
          <Magnetic>
            <Button
              asChild
              variant="outline"
              className="liquid-button text-xs uppercase tracking-[0.2em] px-8 py-5 h-auto border-gold/40 text-gold hover:border-gold hover:bg-gold hover:text-black transition-all duration-300"
            >
              <Link href="/designs">
                View All Designs <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Magnetic>
        </div>
      </section>

      {/* ══════ OUR STORY SECTION ══════ */}
      {(c.our_story?.content || about.body || storyImages.length > 0) && (
        <section id="our-story" className="relative isolate overflow-hidden border-y border-gold/15 bg-secondary/20 py-10 sm:py-12 md:py-16">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-grain opacity-35" />
          <div className="pointer-events-none absolute -right-40 top-1/4 -z-10 h-[30rem] w-[30rem] rounded-full bg-gold/[0.06] blur-3xl" />
          <div className="container-x relative mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mx-auto mb-10 max-w-3xl text-center sm:mb-14"
            >
              <p className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.38em] text-gold sm:text-xs">
                <Sparkles className="h-3.5 w-3.5" /> Our Story
              </p>
              <h2 className="mt-4 font-display text-4xl leading-[1.05] sm:text-5xl md:text-7xl">The Story of Ascotex</h2>
              <div className="mx-auto mt-6 h-px w-20 bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
              <p className="mt-6 font-script text-xl italic text-champagne/75 sm:text-2xl">A legacy shaped by craft</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: 0.08 }}
              className="mx-auto mb-12 max-w-4xl rounded-2xl border border-white/10 bg-black/45 px-6 py-8 text-center shadow-xl backdrop-blur-sm sm:mb-16 sm:px-10 sm:py-10"
            >
              <span aria-hidden="true" className="font-display text-4xl leading-none text-gold/55">&ldquo;</span>
              <div className="mt-2 whitespace-pre-wrap text-base leading-[1.9] text-foreground/85 font-light sm:text-lg md:text-xl">
                {c.our_story?.content || about.body}
              </div>
            </motion.div>

            {storyImages.length > 0 && (
              <div className={"mx-auto mb-14 grid gap-4 sm:gap-5 md:mb-20 " + (storyImages.length === 1 ? "max-w-4xl grid-cols-1" : storyImages.length === 2 ? "max-w-6xl grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3")}>
                {storyImages.map((image: any, index: number) => (
                  <motion.div
                    key={image.url + "-" + index}
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.55, delay: Math.min((index % 6) * 0.07, 0.35), ease: "easeOut" }}
                    whileHover={{ y: -4 }}
                    className="group/story-image relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/[0.06] via-black/70 to-secondary/50 p-2 shadow-[0_16px_48px_rgba(0,0,0,0.3)] transition-[border-color,box-shadow] duration-500 hover:border-gold/50 hover:shadow-[0_22px_55px_rgba(0,0,0,0.45)] sm:p-3"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-black/65">
                      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08),transparent_72%)] opacity-60 transition-opacity duration-500 group-hover/story-image:opacity-100" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image.url} alt={image.alt || ""} className="h-full w-full object-contain p-2 transition-transform duration-700 group-hover/story-image:scale-[1.025] sm:p-3" loading="lazy" />
                      <span className="absolute bottom-3 right-3 z-20 rounded-full border border-white/15 bg-black/70 px-2.5 py-1 font-mono text-[9px] tracking-[0.2em] text-gold/90 backdrop-blur-sm">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-3 border-y border-gold/15 py-6 text-center sm:grid-cols-3 sm:gap-5">
              <div className="px-4 py-3">
                <div className="font-display text-2xl text-gold sm:text-3xl">2004</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Founded on Savile Row</div>
              </div>
              <div className="border-y border-gold/10 px-4 py-3 sm:border-x sm:border-y-0">
                <div className="font-display text-2xl text-gold sm:text-3xl">20+Yrs</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Master Tailoring</div>
              </div>
              <div className="px-4 py-3">
                <div className="font-display text-2xl text-gold sm:text-3xl">Global</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Couture Clients</div>
              </div>
            </div>

            <div className="mt-10 text-center">
              <Magnetic>
                <Button asChild size="lg" className="group rounded-full border border-gold/40 bg-transparent px-8 py-5 text-xs uppercase tracking-[0.2em] text-gold transition-all hover:border-gold hover:bg-gold hover:text-black">
                  <Link href="/journey">Explore Our Journey <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
                </Button>
              </Magnetic>
            </div>
          </div>
        </section>
      )}      {/* ══════ JOURNEY PREVIEW (The Craft Timeline) ══════ */}
      {jSteps.length > 0 && (
        <section className="relative bg-secondary/40 py-10 md:py-16 overflow-hidden">
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
                  className="liquid-button text-xs uppercase tracking-[0.2em] px-8 py-5 h-auto border-gold/40 text-gold hover:border-gold hover:bg-gold hover:text-black transition-all duration-300"
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
      {celebrities.some((c: any) => c.image) && (
        <section className="py-10 md:py-16">
          <div className="container-x">
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {celebrities.filter((c: any) => c.image).map((c: any, i: number) => (
                <Tilt3DCard key={c.id || i} maxTilt={6}>
                  <div className="overflow-hidden rounded-xl border border-border/40 bg-secondary/20 shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.image} alt="" className="aspect-[3/4] w-full object-cover" loading="lazy" />
                  </div>
                </Tilt3DCard>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SVG Morphing Divider */}
      <SvgMorphDivider className="home-divider" />

      {/* ══════ MANUFACTURING STRENGTH ══════ */}
      <section className="container-x py-10 md:py-16">
        {process.eyebrow && (
          <p className="text-xs uppercase tracking-[0.4em] text-accent/90 text-center font-medium">
            {process.eyebrow}
          </p>
        )}
        <h2 className="mt-4 font-display text-4xl md:text-6xl text-center">
          {process.title}
        </h2>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {(process.pillars || []).map((p: any, i: number) => {
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
        <section className="relative bg-secondary/40 py-10 md:py-16 overflow-hidden border-t border-border/30">
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
      <section className="relative py-12 md:py-20 overflow-hidden bg-grain">
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
                className="liquid-button bg-accent text-accent-foreground hover:bg-accent/90 text-xs uppercase tracking-[0.2em] px-12 py-6 h-auto shadow-[0_0_35px_rgba(212,175,55,0.4)] transition-all duration-300"
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
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl p-4 sm:p-8 cursor-zoom-out"
          >
            {/* Top Bar Controls */}
            <div
              className="absolute top-6 left-6 right-6 flex items-center justify-between z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-xs uppercase tracking-[0.3em] text-gold/80 font-mono bg-black/50 px-4 py-2 rounded-full border border-gold/30 backdrop-blur-md">
                Design {String(activePreviewIndex + 1).padStart(2, "0")} /{" "}
                {String(Math.min(designImages.length, 12)).padStart(2, "0")}
              </div>
              <button
                onClick={() => setActivePreviewImage(null)}
                className="p-3 rounded-full bg-black/60 border border-gold/30 text-gold hover:bg-gold hover:text-black transition-all shadow-lg"
                aria-label="Close preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Image Frame */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-5xl max-h-[80vh] overflow-hidden rounded-2xl border border-gold/40 bg-black/80 shadow-[0_0_80px_rgba(212,175,55,0.2)] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePreviewImage}
                alt="Ascotex Atelier Design Preview"
                className="w-full h-auto max-h-[75vh] object-contain select-none"
              />

              {/* Navigation Arrows */}
              {Math.min(designImages.length, 12) > 1 && (
                <>
                  <button
                    onClick={prevPreviewImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 border border-gold/40 text-gold hover:bg-gold hover:text-black transition-all shadow-xl"
                    aria-label="Previous design"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextPreviewImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 border border-gold/40 text-gold hover:bg-gold hover:text-black transition-all shadow-xl"
                    aria-label="Next design"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </motion.div>

            {/* Keyboard shortcut hint */}
            <div className="mt-4 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70 hidden sm:block">
              Use ← → arrows to navigate • ESC to close
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  const { data: content, isLoading: isL1 } = useQuery({ queryKey: ["website_content"], queryFn: () => getWebsiteContent() });
  const { isLoading: isL2 } = useQuery({ queryKey: ["collections", "featured"], queryFn: () => getFeaturedCollections() });
  const { isLoading: isL3 } = useQuery({ queryKey: ["journey_steps"], queryFn: () => getJourneySteps() });
  const { isLoading: isL4 } = useQuery({ queryKey: ["public", "celebrities"], queryFn: () => getPublicCelebrities() });
  const { isLoading: isL5 } = useQuery({ queryKey: ["videos"], queryFn: () => getVideos() });
  const { isLoading: isL6 } = useQuery({ queryKey: ["videos", "featured"], queryFn: () => getFeaturedVideos() });
  const { isLoading: isL7 } = useQuery({ queryKey: ["designs", "public", "preview"], queryFn: () => getPublicDesigns(12) });

  const isLoading = (isL1 || isL2 || isL3 || isL4 || isL5 || isL6 || isL7) && !content;

  if (isLoading) return <PageLoader />;

  return <MotionConfig reducedMotion="user"><HomeContent /></MotionConfig>;
}
