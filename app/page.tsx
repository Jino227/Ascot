"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, ChevronDown, Play, X, Award, Leaf, Scissors, Sparkles } from "lucide-react";
import { getWebsiteContent, getWorks, getFeaturedWorks, getVideos, getFeaturedVideos } from "@/lib/actions";
import { Reveal } from "@/components/layout/Reveal";
import { Button } from "@/components/ui/button";

const DEMO_HERO = { eyebrow: "Our Work", title: "Crafted with precision, delivered with passion.", subtitle: "Every project reflects our commitment to quality, detail, and timeless design.", cta: "View our work", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=2000&q=80" };
const DEMO_ABOUT = { eyebrow: "About Us", title: "Built on craft since 1985.", body: "We are a team of dedicated artisans creating exceptional work for discerning clients worldwide." };
const DEMO_PROCESS = { eyebrow: "Our Process", title: "From concept to completion.", pillars: [
  { icon: "Scissors", title: "Consultation", body: "We begin by understanding your vision, needs, and expectations." },
  { icon: "Sparkles", title: "Design & planning", body: "Detailed planning and material selection for every project." },
  { icon: "Award", title: "Craft & execution", body: "Expert craftsmanship with rigorous quality control at every stage." },
  { icon: "Leaf", title: "Delivery & support", body: "On-time delivery with ongoing support and aftercare." },
]};
const DEMO_TESTIMONIALS = [
  { quote: "The attention to detail is extraordinary. Every aspect of the project was executed perfectly.", name: "James H.", role: "Client" },
  { quote: "Working with this team was an absolute pleasure. The results speak for themselves.", name: "Victoria L.", role: "Private client" },
  { quote: "From the initial consultation to the final delivery, an exceptional experience.", name: "Alexander P.", role: "Corporate client" },
];
const DEMO_CONTACT = { eyebrow: "Get in touch", title: "Let's work together.", body: "Have a project in mind? We'd love to hear from you." };
const DEMO_WORKS = [
  { id: "dw1", title: "Savile Row Studio Refurbishment", description: "Complete interior redesign and fitting room installation for a heritage tailoring house. Every detail, from the brass fittings to the oak flooring, was selected to reflect the timeless craftsmanship that defines the brand.", category: "Commercial", cover_image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=80", images: ["https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=80", "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=900&q=80", "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&q=80", "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900&q=80"], video_url: "", client_name: "Savile Row Tailors", is_featured: true, display_order: 0 },
  { id: "dw2", title: "Bespoke Wedding Collection", description: "Custom bridal and groom attire for a private estate wedding in the Cotswolds. A full collection crafted from Italian silks and English wools, tailored to perfection.", category: "Events", cover_image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&q=80", images: ["https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&q=80", "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=900&q=80", "https://images.unsplash.com/photo-1445205170230-053b83016050?w=900&q=80"], video_url: "", client_name: "Private client", is_featured: true, display_order: 1 },
  { id: "dw3", title: "Corporate Identity Refresh", description: "New uniforms and branding for a luxury hotel chain across seven locations. Over 2,000 garments produced with consistent quality and fit.", category: "Corporate", cover_image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&q=80", images: ["https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&q=80", "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=80"], video_url: "https://www.w3schools.com/html/mov_bbb.mp4", client_name: "Luxury Hotel Group", is_featured: true, display_order: 2 },
  { id: "dw4", title: "Heritage Archive Project", description: "Restoration and preservation of historical garment patterns spanning three centuries. A meticulous effort to document and digitise over 500 original patterns.", category: "Heritage", cover_image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900&q=80", images: [], video_url: "", client_name: "Fashion Museum Trust", is_featured: false, display_order: 3 },
];
const DEMO_VIDEOS = [
  { id: "dv1", title: "Behind the Scenes — Estate Project", description: "A look behind the scenes at our latest estate project.", url: "https://www.w3schools.com/html/mov_bbb.mp4", thumbnail: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80", category: "Behind the Scenes", is_featured: true, display_order: 0 },
  { id: "dv2", title: "Process — From Sketch to Stitch", description: "Watch our process from initial sketch to final garment.", url: "https://www.w3schools.com/html/mov_bbb.mp4", thumbnail: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&q=80", category: "Process", is_featured: true, display_order: 1 },
  { id: "dv3", title: "Client Testimonial — The Ritz Hotel", description: "Our client shares their experience working with us.", url: "https://www.w3schools.com/html/mov_bbb.mp4", thumbnail: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80", category: "Testimonial", is_featured: true, display_order: 2 },
];
const DEMO_COMPANY_GALLERY = {
  title: "Behind the scenes",
  images: [
    { url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80", caption: "Master tailor at work on a bespoke jacket", category: "employees" },
    { url: "https://images.unsplash.com/photo-1567789884554-0b844b597180?w=800&q=80", caption: "Modern cutting room with precision machinery", category: "machines" },
    { url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80", caption: "The full Ascot Fashions team", category: "group" },
    { url: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=800&q=80", caption: "Pattern makers collaborating on a new design", category: "employees" },
    { url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80", caption: "Industrial sewing machines in production", category: "machines" },
    { url: "https://images.unsplash.com/photo-1604328698692-f76ea9498e72?w=800&q=80", caption: "Quality inspection of finished garments", category: "employees" },
    { url: "https://images.unsplash.com/photo-1556755134-38b4e8b04b58?w=800&q=80", caption: "Fabric archive and material selection room", category: "machines" },
    { url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80", caption: "Team meeting and project review", category: "group" },
  ],
};

export default function Home() {
  useEffect(() => { document.title = "Ascot Fashions — Bespoke Craftsmanship"; }, []);
  const { data: content } = useQuery({ queryKey: ["website_content"], queryFn: () => getWebsiteContent() });
  const { data: allWorks = [] } = useQuery({ queryKey: ["works"], queryFn: () => getWorks() });
  const { data: featuredWorks = [] } = useQuery({ queryKey: ["works", "featured"], queryFn: () => getFeaturedWorks() });
  const { data: allVideos = [] } = useQuery({ queryKey: ["videos"], queryFn: () => getVideos() });
  const { data: featuredVids = [] } = useQuery({ queryKey: ["videos", "featured"], queryFn: () => getFeaturedVideos() });

  const c = content ?? {};
  const hero = { ...DEMO_HERO, ...(c.hero ?? {}) };
  const about = { ...DEMO_ABOUT, ...(c.about ?? {}) };
  const process = { ...DEMO_PROCESS, ...(c.process ?? {}) };
  const testimonials = (c.testimonials?.items?.length ? c.testimonials.items : DEMO_TESTIMONIALS);
  const contact = { ...DEMO_CONTACT, ...(c.contact ?? {}) };
  const companyGallery = { ...DEMO_COMPANY_GALLERY, ...(c.company_gallery ?? {}) };

  const works = allWorks.length > 0 ? allWorks : DEMO_WORKS;
  const displayWorks = featuredWorks.length > 0 ? featuredWorks : works.slice(0, 6);
  const videos = allVideos.length > 0 ? allVideos : DEMO_VIDEOS;
  const displayVideos = featuredVids.length > 0 ? featuredVids : videos.slice(0, 6);

  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [galleryFilter, setGalleryFilter] = useState("all");
  const [galleryLightbox, setGalleryLightbox] = useState<string | null>(null);

  const sv = { hidden: { opacity: 0, y: 60 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: i * 0.15, ease: "easeInOut" as const } }) };

  return (
    <div>
      {/* ═══════ HERO ═══════ */}
      <section className="relative h-screen flex items-end overflow-hidden">
        <motion.div initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 2, ease: "easeOut" }} className="absolute inset-0 -z-10">
          <img src={hero.image || DEMO_HERO.image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/20 to-transparent" />
        </motion.div>
        <div className="container-x pb-20 md:pb-32 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            {hero.eyebrow && <span className="inline-block text-[10px] uppercase tracking-[0.5em] text-background/70 mb-6 border-b border-accent/50 pb-2">{hero.eyebrow}</span>}
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }} className="max-w-4xl font-display text-5xl leading-[1.05] md:text-8xl text-background">{hero.title}</motion.h1>
          {hero.subtitle && <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.4 }} className="mt-6 max-w-xl text-base text-background/75 md:text-lg leading-relaxed">{hero.subtitle}</motion.p>}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }} className="mt-10 flex flex-wrap gap-4">
            <Button asChild size="lg" className="rounded-none bg-accent text-accent-foreground hover:bg-accent/90 text-sm uppercase tracking-[0.15em] px-8">
              <Link href="/contact">{hero.cta}<ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <ChevronDown className="h-6 w-6 text-background/50 animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* ═══════ ABOUT ═══════ */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} custom={0} variants={sv} className="container-x py-28 md:py-40">
        <div className="max-w-4xl mx-auto text-center">
          {about.eyebrow && <p className="text-xs uppercase tracking-[0.4em] text-accent/80">{about.eyebrow}</p>}
          <h2 className="mt-6 font-display text-4xl md:text-5xl leading-tight">{about.title}</h2>
          <motion.div initial={{ width: 0 }} whileInView={{ width: 60 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }} className="h-px bg-accent/50 mx-auto mt-8" />
          {about.body && <p className="mt-8 text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">{about.body}</p>}
          <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
            <Button asChild variant="link" className="mt-8 h-auto p-0 text-accent text-sm uppercase tracking-widest group">
              <Link href="/about">Read our story <motion.span className="inline-block ml-2 group-hover:translate-x-1 transition-transform"><ArrowRight className="h-4 w-4" /></motion.span></Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════ DIVIDER ═══════ */}
      <div className="container-x"><div className="h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" /></div>

      {/* ═══════ WORKS / PORTFOLIO ═══════ */}
      <section className="container-x py-28 md:py-40">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sv} custom={0}>
          <p className="text-xs uppercase tracking-[0.4em] text-accent/80 text-center">Portfolio</p>
          <h2 className="mt-4 font-display text-4xl md:text-5xl text-center">Our work</h2>
        </motion.div>
        <div className="mt-20 space-y-32 md:space-y-48">
          {displayWorks.map((w: any, i: number) => (
            <motion.div key={w.id} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={sv} custom={i}>
              {/* Project Header */}
              <div className="max-w-3xl mx-auto md:mx-0">
                {w.category && <span className="inline-block text-[10px] uppercase tracking-[0.4em] text-accent/80 border-b border-accent/30 pb-1">{w.category}</span>}
                <h3 className="mt-4 font-display text-3xl md:text-5xl leading-tight">{w.title}</h3>
                {w.description && <p className="mt-5 text-base leading-relaxed text-muted-foreground max-w-2xl">{w.description}</p>}
                {(w.client_name || w.client) && (
                  <p className="mt-4 text-xs uppercase tracking-[0.3em] text-muted-foreground/60">Client: {w.client_name || w.client}</p>
                )}
              </div>

              {/* Cover Image */}
              <div className="mt-10 aspect-[16/8] overflow-hidden bg-muted">
                {w.cover_image ? (
                  <motion.img src={w.cover_image} alt={w.title} whileHover={{ scale: 1.05 }} transition={{ duration: 0.8 }} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground/40">No cover image</div>
                )}
              </div>

              {/* Gallery Images Grid */}
              {w.images && w.images.length > 0 && (
                <div className={`mt-5 grid gap-3 ${w.images.length === 1 ? 'grid-cols-1' : w.images.length === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}`}>
                  {w.images.map((img: string, idx: number) => (
                    <div key={idx} className="aspect-[4/3] overflow-hidden bg-muted">
                      <img src={img} alt={`${w.title} ${idx + 1}`} className="h-full w-full object-cover hover:scale-105 transition-transform duration-700" />
                    </div>
                  ))}
                </div>
              )}

              {/* Video */}
              {w.video_url && (
                <div className="mt-8 relative group cursor-pointer" onClick={() => setPlayingVideo(playingVideo === `work-${w.id}` ? null : `work-${w.id}`)}>
                  {playingVideo === `work-${w.id}` ? (
                    <video src={w.video_url} controls autoPlay className="w-full aspect-video rounded" />
                  ) : (
                    <div className="aspect-video bg-muted relative overflow-hidden rounded">
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-accent/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="h-7 w-7 text-accent-foreground ml-0.5" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════ TEAM / COMPANY GALLERY ═══════ */}
      {companyGallery.images?.length > 0 && (
        <section className="bg-secondary/40 py-28 md:py-40">
          <div className="container-x">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sv} custom={0}>
              <p className="text-xs uppercase tracking-[0.4em] text-accent/80 text-center">Our workspace</p>
              <h2 className="mt-4 font-display text-4xl md:text-5xl text-center">{companyGallery.title}</h2>
            </motion.div>
            <div className="flex justify-center gap-8 mt-12">
              {["all", "employees", "machines", "group"].map((cat) => (
                <button key={cat} onClick={() => setGalleryFilter(cat)}
                  className={`text-xs uppercase tracking-[0.3em] pb-1 border-b transition-colors ${galleryFilter === cat ? 'border-accent text-accent' : 'border-transparent text-muted-foreground/60 hover:text-foreground'}`}
                >
                  {cat === "all" ? "All" : cat === "employees" ? "Employees" : cat === "machines" ? "Studio & Machines" : "Team"}
                </button>
              ))}
            </div>
            <motion.div layout className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {companyGallery.images
                .filter((img: any) => galleryFilter === "all" || img.category === galleryFilter)
                .map((img: any, i: number) => (
                  <motion.div key={i} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="group relative aspect-[4/3] overflow-hidden bg-muted cursor-pointer"
                    onClick={() => setGalleryLightbox(img.url)}
                  >
                    <img src={img.url} alt={img.caption} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <p className="text-xs text-white/90 font-medium">{img.caption}</p>
                    </div>
                  </motion.div>
                ))}
            </motion.div>
          </div>
          {/* Lightbox */}
          {galleryLightbox && (
            <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 md:p-12" onClick={() => setGalleryLightbox(null)}>
              <motion.img initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} src={galleryLightbox} alt="" className="max-h-full max-w-full object-contain" />
              <button className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors" onClick={() => setGalleryLightbox(null)}>
                <X className="h-8 w-8" />
              </button>
            </div>
          )}
        </section>
      )}

      {/* ═══════ VIDEOS ═══════ */}
      {displayVideos.length > 0 && (
        <section className="container-x py-28 md:py-40">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sv} custom={0}>
            <p className="text-xs uppercase tracking-[0.4em] text-accent/80 text-center">Videos</p>
            <h2 className="mt-4 font-display text-4xl md:text-5xl text-center">Watch our work</h2>
          </motion.div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {displayVideos.map((v: any, i: number) => (
              <motion.div key={v.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}>
                <div className="aspect-video overflow-hidden bg-muted relative group cursor-pointer" onClick={() => setPlayingVideo(playingVideo === `video-${v.id}` ? null : `video-${v.id}`)}>
                  {playingVideo === `video-${v.id}` ? (
                    <video src={v.url} controls autoPlay className="h-full w-full" />
                  ) : (
                    <>
                      {v.thumbnail ? (
                        <img src={v.thumbnail} alt={v.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs text-muted-foreground/40">No thumbnail</div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                        <div className="w-16 h-16 rounded-full bg-accent/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="h-7 w-7 text-accent-foreground ml-0.5" />
                        </div>
                      </div>
                      {v.category && <span className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm text-[10px] uppercase tracking-widest px-3 py-1">{v.category}</span>}
                    </>
                  )}
                </div>
                <div className="mt-4">
                  <h3 className="font-display text-lg">{v.title}</h3>
                  {v.description && <p className="mt-1 text-sm text-muted-foreground">{v.description}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════ PROCESS ═══════ */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={sv} custom={0} className="py-28 md:py-40">
        <div className="container-x">
          {process.eyebrow && <p className="text-xs uppercase tracking-[0.4em] text-accent/80 text-center">{process.eyebrow}</p>}
          <h2 className="mt-4 font-display text-4xl md:text-5xl text-center">{process.title}</h2>
          <div className="mt-16 grid gap-10 md:grid-cols-4">
            {process.pillars.map((p: any, i: number) => {
              const Icon = ({ Leaf, Scissors, Award, Sparkles } as any)[p.icon] ?? Sparkles;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.12 }} whileHover={{ y: -5 }} className="text-center group">
                  <motion.div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6 group-hover:bg-accent/20 transition-colors" whileHover={{ rotate: 5, scale: 1.05 }}>
                    <Icon className="h-7 w-7 text-accent" />
                  </motion.div>
                  <h3 className="font-display text-xl">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground max-w-xs mx-auto">{p.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="bg-secondary/40 py-28 md:py-40">
        <div className="container-x">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sv} custom={0}>
            <p className="text-xs uppercase tracking-[0.4em] text-accent/80 text-center">In their words</p>
          </motion.div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {testimonials.map((t: any, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.12 }} whileHover={{ y: -3 }} className="border border-border/60 p-8 bg-card/50 backdrop-blur-sm">
                <motion.svg className="h-8 w-8 text-accent/30 mb-4" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></motion.svg>
                <blockquote className="font-display text-lg leading-relaxed text-foreground/90">{t.quote}</blockquote>
                <div className="mt-8 pt-5 border-t border-border/40 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-medium text-accent">{t.name.charAt(0)}</div>
                  <div>
                    <div className="text-xs font-medium">{t.name}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CONTACT CTA ═══════ */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative py-32 md:py-48 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-foreground via-foreground to-foreground/95" />
        <motion.div className="absolute top-1/4 left-1/3 w-96 h-96 bg-accent/[0.04] rounded-full blur-3xl" animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/[0.03] rounded-full blur-3xl" animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }} />
        <div className="container-x relative">
          <div className="max-w-2xl mx-auto text-center">
            {contact.eyebrow && <p className="text-xs uppercase tracking-[0.4em] text-accent/70">{contact.eyebrow}</p>}
            <h2 className="mt-6 font-display text-4xl md:text-6xl text-background leading-tight">{contact.title}</h2>
            {contact.body && <p className="mt-6 text-lg text-background/60 leading-relaxed">{contact.body}</p>}
            <motion.div className="mt-12 flex flex-wrap justify-center gap-4" whileHover={{ scale: 1.02 }}>
              <Button asChild size="lg" className="rounded-none bg-accent text-accent-foreground hover:bg-accent/90 text-sm uppercase tracking-[0.15em] px-10 py-6 h-auto">
                <Link href="/contact">Get in touch <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
