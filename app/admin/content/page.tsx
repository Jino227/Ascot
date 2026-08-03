"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getWebsiteContent, upsertContent, uploadHeroMedia } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2, Upload, ImageIcon, Film, GripVertical, Plus } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
interface HeroSlide {
  type: "image" | "video";
  url: string;
  alt?: string;
}

interface HeroContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  cta_url: string;
  slides: HeroSlide[];
}

const EMPTY_HERO: HeroContent = {
  eyebrow: "",
  title: "",
  subtitle: "",
  cta: "",
  cta_url: "",
  slides: [],
};

interface AboutStat {
  key: string;
  label: string;
}

interface AboutContent {
  eyebrow: string;
  title: string;
  body: string;
  stats: AboutStat[];
}

interface OurStoryContent {
  content: string;
}

interface TestimonialItem {
  name: string;
  role: string;
  quote: string;
}

interface TestimonialsContent {
  items: TestimonialItem[];
}

interface ContactContent {
  eyebrow?: string;
  title?: string;
  body?: string;
  address?: string;
  email?: string;
  phone?: string;
}

interface FooterContent {
  description?: string;
  address?: string;
  email?: string;
  phone?: string;
  copyright?: string;
}

interface AboutPageContent {
  title?: string;
  subtitle?: string;
  image?: string;
  body1?: string;
  body2?: string;
  body3?: string;
  stats?: AboutStat[];
}

// Sections that still use raw JSON textarea editor
const JSON_SECTIONS = ["process", "company_gallery"];

// ── Hero Editor ──────────────────────────────────────────────────────────────
function HeroEditor({ initial, onSave }: { initial: HeroContent; onSave: (data: HeroContent) => Promise<void> }) {
  const { user } = useAuth();
  const [hero, setHero] = useState<HeroContent>(initial);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync when initial changes (query loads)
  useEffect(() => { setHero(initial); }, [JSON.stringify(initial)]); // eslint-disable-line

  function setField(key: keyof HeroContent, value: string) {
    setHero((h) => ({ ...h, [key]: value }));
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || !user) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const { url } = await uploadHeroMedia(user.id, fd);
        const type: HeroSlide["type"] = file.type.startsWith("video/") ? "video" : "image";
        setHero((h) => ({ ...h, slides: [...h.slides, { type, url, alt: "" }] }));
      }
      toast.success("Media uploaded");
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeSlide(idx: number) {
    setHero((h) => ({ ...h, slides: h.slides.filter((_, i) => i !== idx) }));
  }

  function updateSlideAlt(idx: number, alt: string) {
    setHero((h) => ({
      ...h,
      slides: h.slides.map((s, i) => (i === idx ? { ...s, alt } : s)),
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(hero);
      toast.success("Hero saved");
    } catch (err: any) {
      toast.error(err.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-border/60 bg-black/30 backdrop-blur-md p-6 space-y-6 shadow-xl">
      <div className="flex items-center justify-between">
        <Label className="text-base font-display">Hero</Label>
        <span className="text-xs text-muted-foreground">Homepage banner section</span>
      </div>

      {/* ── Text fields ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Eyebrow</Label>
          <Input className="mt-1.5 rounded-none text-sm" value={hero.eyebrow} placeholder="Est. 1985"
            onChange={(e) => setField("eyebrow", e.target.value)} />
        </div>
        {/* <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">CTA Button Label</Label>
          <Input className="mt-1.5 rounded-none text-sm" value={hero.cta} placeholder="Explore collections"
            onChange={(e) => setField("cta", e.target.value)} />
        </div> */}
        <div className="sm:col-span-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Title</Label>
          <Input className="mt-1.5 rounded-none text-sm" value={hero.title}
            placeholder="Where craftsmanship meets contemporary style."
            onChange={(e) => setField("title", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Subtitle</Label>
          <Textarea className="mt-1.5 rounded-none text-sm" rows={3} value={hero.subtitle}
            placeholder="Bespoke tailoring and ready-to-wear collections…"
            onChange={(e) => setField("subtitle", e.target.value)} />
        </div>
        {/* <div className="sm:col-span-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">CTA URL</Label>
          <Input className="mt-1.5 rounded-none text-sm" value={hero.cta_url} placeholder="/collections"
            onChange={(e) => setField("cta_url", e.target.value)} />
          <p className="mt-1 text-[11px] text-muted-foreground/60">e.g. /collections, /contact, /about</p>
        </div> */}
      </div>

      {/* ── Slides manager ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Background Slides ({hero.slides.length})
          </Label>
          <p className="text-[11px] text-muted-foreground/60">
            {hero.slides.length === 0
              ? "No slides — fallback demo image will show"
              : hero.slides.length === 1
                ? "1 slide — no carousel"
                : `${hero.slides.length} slides — carousel enabled`}
          </p>
        </div>

        {/* Slide list */}
        {hero.slides.length > 0 && (
          <div className="space-y-2">
            {hero.slides.map((slide, idx) => (
              <div key={`${slide.url}-${idx}`}
                className="flex items-start gap-3 border border-border/40 bg-background/50 p-3">
                <GripVertical className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/40" />
                {/* Preview */}
                <div className="w-16 h-10 shrink-0 overflow-hidden bg-muted flex items-center justify-center border border-border/30">
                  {slide.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={slide.url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Film className="h-5 w-5 text-muted-foreground/50" />
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2">
                    {slide.type === "image" ? (
                      <ImageIcon className="h-3.5 w-3.5 text-accent/70" />
                    ) : (
                      <Film className="h-3.5 w-3.5 text-accent/70" />
                    )}
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {slide.type}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground/60 truncate">{slide.url}</p>
                  {slide.type === "image" && (
                    <Input
                      className="h-7 rounded-none text-xs"
                      placeholder="Alt text (optional)"
                      value={slide.alt ?? ""}
                      onChange={(e) => updateSlideAlt(idx, e.target.value)}
                    />
                  )}
                </div>
                {/* Delete */}
                <button
                  onClick={() => removeSlide(idx)}
                  className="mt-0.5 shrink-0 rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Remove slide"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-none border-dashed border-gold/40 text-gold hover:border-gold hover:bg-gold hover:text-black text-xs uppercase tracking-widest gap-2 transition-colors"
          >
            {uploading ? (
              <>
                <Upload className="h-3.5 w-3.5 animate-pulse" /> Uploading…
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" /> Add image or video
              </>
            )}
          </Button>
          <p className="mt-1.5 text-[11px] text-muted-foreground/60">
            Supports JPG, PNG, WebP, MP4, MOV, WebM. Select multiple files at once.
          </p>
        </div>
      </div>

      {/* ── Save ── */}
      <Button onClick={handleSave} disabled={saving} className="rounded-none w-full sm:w-auto">
        {saving ? "Saving…" : "Save hero"}
      </Button>
    </div>
  );
}

// ── About Editor ─────────────────────────────────────────────────────────────
function AboutEditor({ initial, onSave }: { initial: AboutContent; onSave: (data: AboutContent) => Promise<void> }) {
  const [about, setAbout] = useState<AboutContent>(initial);
  const [saving, setSaving] = useState(false);

  // Sync when data loads
  useEffect(() => { setAbout(initial); }, [JSON.stringify(initial)]); // eslint-disable-line

  function setField(key: keyof AboutContent, value: string) {
    setAbout((a) => ({ ...a, [key]: value }));
  }

  function addStat() {
    setAbout((a) => ({ ...a, stats: [...a.stats, { key: "", label: "" }] }));
  }

  function removeStat(idx: number) {
    setAbout((a) => ({ ...a, stats: a.stats.filter((_, i) => i !== idx) }));
  }

  function updateStat(idx: number, field: "key" | "label", value: string) {
    setAbout((a) => ({
      ...a,
      stats: a.stats.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(about);
      toast.success("About saved");
    } catch (err: any) {
      toast.error(err.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-border/60 bg-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-base font-display">About</Label>
        <span className="text-xs text-muted-foreground">Company introduction &amp; stats</span>
      </div>

      {/* Text fields */}
      <div className="grid gap-4">
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Eyebrow</Label>
          <Input className="mt-1.5 rounded-none text-sm" value={about.eyebrow} placeholder="Our Heritage"
            onChange={(e) => setField("eyebrow", e.target.value)} />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Title</Label>
          <Input className="mt-1.5 rounded-none text-sm" value={about.title} placeholder="Four decades of tailoring excellence."
            onChange={(e) => setField("title", e.target.value)} />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Body text</Label>
          <Textarea className="mt-1.5 rounded-none text-sm" rows={4} value={about.body}
            placeholder="Founded in 1985, Ascotex Fashions…"
            onChange={(e) => setField("body", e.target.value)} />
        </div>
      </div>

      {/* Stats manager */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Stats ({about.stats.length})
          </Label>
          <p className="text-[11px] text-muted-foreground/60">Key figure + label pairs shown in the grid</p>
        </div>

        {about.stats.length > 0 && (
          <div className="space-y-2">
            {about.stats.map((stat, idx) => (
              <div key={idx} className="flex items-center gap-2 border border-border/40 bg-background/50 p-3">
                <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/30" />
                <div className="flex flex-1 gap-2">
                  <div className="w-24 shrink-0">
                    <Input
                      className="h-8 rounded-none text-sm text-center font-semibold"
                      placeholder="40+"
                      value={stat.key}
                      onChange={(e) => updateStat(idx, "key", e.target.value)}
                    />
                  </div>
                  <Input
                    className="h-8 rounded-none text-sm"
                    placeholder="Years"
                    value={stat.label}
                    onChange={(e) => updateStat(idx, "label", e.target.value)}
                  />
                </div>
                <button
                  onClick={() => removeStat(idx)}
                  className="shrink-0 rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Remove stat"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addStat}
          className="rounded-none border-dashed border-gold/40 text-gold hover:border-gold hover:bg-gold hover:text-black text-xs uppercase tracking-widest gap-2 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> Add stat
        </Button>
        <p className="text-[11px] text-muted-foreground/60">
          Tip: use values like <span className="font-mono">40+</span>, <span className="font-mono">200+</span> — the number animates on scroll.
        </p>
      </div>

      {/* Save */}
      <Button onClick={handleSave} disabled={saving} className="rounded-none w-full sm:w-auto">
        {saving ? "Saving…" : "Save about"}
      </Button>
    </div>
  );
}

// ── Our Story Editor ─────────────────────────────────────────────────────────
function OurStoryEditor({ initial, onSave }: { initial: OurStoryContent; onSave: (data: OurStoryContent) => Promise<void> }) {
  const [story, setStory] = useState<OurStoryContent>(initial);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setStory(initial); }, [JSON.stringify(initial)]); // eslint-disable-line

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(story);
      toast.success("Our Story saved");
    } catch (err: any) {
      toast.error(err.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-border/60 bg-card p-6 space-y-6">
      <Label className="text-base font-display capitalize">Our Story</Label>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Story Content</Label>
        <Textarea
          className="rounded-none text-sm leading-relaxed"
          rows={12}
          value={story.content}
          onChange={(e) => setStory({ content: e.target.value })}
          placeholder="Enter the full story here..."
        />
      </div>
      <Button onClick={handleSave} disabled={saving} className="rounded-none w-full sm:w-auto">
        {saving ? "Saving…" : "Save Our Story"}
      </Button>
    </div>
  );
}

// ── Testimonials Editor ────────────────────────────────────────────────────────
function TestimonialsEditor({ initial, onSave }: { initial: TestimonialsContent; onSave: (data: TestimonialsContent) => Promise<void> }) {
  const [data, setData] = useState<TestimonialsContent>(initial);
  const [saving, setSaving] = useState(false);

  // Sync when initial data loads
  useEffect(() => { setData(initial); }, [JSON.stringify(initial)]); // eslint-disable-line

  function addItem() {
    setData((d) => ({ ...d, items: [...d.items, { name: "", role: "", quote: "" }] }));
  }

  function removeItem(idx: number) {
    setData((d) => ({ ...d, items: d.items.filter((_, i) => i !== idx) }));
  }

  function updateItem(idx: number, field: keyof TestimonialItem, value: string) {
    setData((d) => ({
      ...d,
      items: d.items.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(data);
      toast.success("Testimonials saved");
    } catch (err: any) {
      toast.error(err.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-border/60 bg-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-base font-display">Testimonials</Label>
        <span className="text-xs text-muted-foreground">Homepage client quotes</span>
      </div>

      <div className="space-y-4">
        {data.items.map((item, idx) => (
          <div key={idx} className="relative border border-border/40 p-4 pt-8 bg-background/50">
            <button
              onClick={() => removeItem(idx)}
              className="absolute top-2 right-2 rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Remove testimonial"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Client Name</Label>
                <Input className="mt-1.5 rounded-none text-sm" value={item.name} placeholder="John Doe"
                  onChange={(e) => updateItem(idx, "name", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Role / Company</Label>
                <Input className="mt-1.5 rounded-none text-sm" value={item.role} placeholder="CEO, Luxury Brands"
                  onChange={(e) => updateItem(idx, "role", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Quote</Label>
                <Textarea className="mt-1.5 rounded-none text-sm" rows={3} value={item.quote} placeholder="Ascotex is simply the best..."
                  onChange={(e) => updateItem(idx, "quote", e.target.value)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={addItem} className="rounded-none border-dashed border-gold/40 text-gold hover:border-gold hover:bg-gold hover:text-black w-full text-xs uppercase tracking-widest gap-2 transition-colors">
        <Plus className="h-3.5 w-3.5" /> Add Testimonial
      </Button>

      <div className="pt-2">
        <Button onClick={handleSave} disabled={saving} className="rounded-none w-full sm:w-auto">
          {saving ? "Saving…" : "Save testimonials"}
        </Button>
      </div>
    </div>
  );
}

// ── Contact Editor ─────────────────────────────────────────────────────────────
function ContactEditor({ initial, onSave }: { initial: ContactContent; onSave: (data: ContactContent) => Promise<void> }) {
  const [data, setData] = useState<ContactContent>(initial);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setData(initial); }, [JSON.stringify(initial)]); // eslint-disable-line

  function setField(key: keyof ContactContent, value: string) {
    setData((d) => ({ ...d, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(data);
      toast.success("Contact saved");
    } catch (err: any) {
      toast.error(err.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-border/60 bg-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-base font-display">Contact Page</Label>
        <span className="text-xs text-muted-foreground">Header & contact details</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Eyebrow</Label>
          <Input className="mt-1.5 rounded-none text-sm" value={data.eyebrow ?? ""} placeholder="Get in touch"
            onChange={(e) => setField("eyebrow", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Title</Label>
          <Input className="mt-1.5 rounded-none text-sm" value={data.title ?? ""} placeholder="Begin your fitting."
            onChange={(e) => setField("title", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Body Text</Label>
          <Textarea className="mt-1.5 rounded-none text-sm" rows={3} value={data.body ?? ""} placeholder="Book a consultation..."
            onChange={(e) => setField("body", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Address</Label>
          <Textarea className="mt-1.5 rounded-none text-sm" rows={2} value={data.address ?? ""} placeholder="152 Savile Row..."
            onChange={(e) => setField("address", e.target.value)} />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
          <Input className="mt-1.5 rounded-none text-sm" value={data.email ?? ""} placeholder="hello@ascotexfashions.com"
            onChange={(e) => setField("email", e.target.value)} />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Phone</Label>
          <Input className="mt-1.5 rounded-none text-sm" value={data.phone ?? ""} placeholder="+44 (0) 20..."
            onChange={(e) => setField("phone", e.target.value)} />
        </div>
      </div>
      <Button onClick={handleSave} disabled={saving} className="rounded-none w-full sm:w-auto">
        {saving ? "Saving…" : "Save Contact"}
      </Button>
    </div>
  );
}

// ── Footer Editor ──────────────────────────────────────────────────────────────
function FooterEditor({ initial, onSave }: { initial: FooterContent; onSave: (data: FooterContent) => Promise<void> }) {
  const [data, setData] = useState<FooterContent>(initial);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setData(initial); }, [JSON.stringify(initial)]); // eslint-disable-line

  function setField(key: keyof FooterContent, value: string) {
    setData((d) => ({ ...d, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(data);
      toast.success("Footer saved");
    } catch (err: any) {
      toast.error(err.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-border/60 bg-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-base font-display">Footer</Label>
        <span className="text-xs text-muted-foreground">Site-wide footer content</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Company Description</Label>
          <Textarea className="mt-1.5 rounded-none text-sm" rows={3} value={data.description ?? ""} placeholder="Bespoke tailoring..."
            onChange={(e) => setField("description", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Address (Optional override)</Label>
          <Textarea className="mt-1.5 rounded-none text-sm" rows={2} value={data.address ?? ""} placeholder="Leaves blank to use Contact address..."
            onChange={(e) => setField("address", e.target.value)} />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Email (Optional override)</Label>
          <Input className="mt-1.5 rounded-none text-sm" value={data.email ?? ""} placeholder="Leave blank to use Contact email..."
            onChange={(e) => setField("email", e.target.value)} />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Phone (Optional override)</Label>
          <Input className="mt-1.5 rounded-none text-sm" value={data.phone ?? ""} placeholder="Leave blank to use Contact phone..."
            onChange={(e) => setField("phone", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Copyright Text</Label>
          <Input className="mt-1.5 rounded-none text-sm" value={data.copyright ?? ""} placeholder="Made to last."
            onChange={(e) => setField("copyright", e.target.value)} />
        </div>
      </div>
      <Button onClick={handleSave} disabled={saving} className="rounded-none w-full sm:w-auto">
        {saving ? "Saving…" : "Save Footer"}
      </Button>
    </div>
  );
}

// ── About Page Editor ────────────────────────────────────────────────────────
function AboutPageEditor({ initial, onSave }: { initial: AboutPageContent; onSave: (data: AboutPageContent) => Promise<void> }) {
  const { user } = useAuth();
  const [data, setData] = useState<AboutPageContent>(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setData(initial); }, [JSON.stringify(initial)]); // eslint-disable-line

  function setField(key: keyof AboutPageContent, value: string) {
    setData((d) => ({ ...d, [key]: value }));
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { url } = await uploadHeroMedia(user.id, fd); // re-use hero media logic for general images
      setData((d) => ({ ...d, image: url }));
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function addStat() {
    setData((d) => ({ ...d, stats: [...(d.stats ?? []), { key: "", label: "" }] }));
  }

  function removeStat(idx: number) {
    setData((d) => ({ ...d, stats: (d.stats ?? []).filter((_, i) => i !== idx) }));
  }

  function updateStat(idx: number, field: "key" | "label", value: string) {
    setData((d) => ({
      ...d,
      stats: (d.stats ?? []).map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(data);
      toast.success("About Page saved");
    } catch (err: any) {
      toast.error(err.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-border/60 bg-black/30 backdrop-blur-md p-6 space-y-6 shadow-xl">
      <div className="flex items-center justify-between">
        <Label className="text-base font-display">About Page</Label>
        <span className="text-xs text-muted-foreground">Main /about page content</span>
      </div>

      {/* Basic Text Fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Title</Label>
          <Input className="mt-1.5 rounded-none text-sm" value={data.title ?? ""} placeholder="Four decades of..."
            onChange={(e) => setField("title", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Subtitle</Label>
          <Textarea className="mt-1.5 rounded-none text-sm" rows={2} value={data.subtitle ?? ""} placeholder="From our founding in..."
            onChange={(e) => setField("subtitle", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Parallax Image</Label>
          <div className="mt-1.5 flex items-center gap-3">
            {data.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.image} alt="preview" className="h-12 w-20 object-cover border border-border/40" />
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileInputRef.current?.click()} className="rounded-none border-gold/40 text-gold hover:border-gold hover:bg-gold hover:text-black text-xs transition-colors">
              {uploading ? "Uploading..." : "Upload Image"}
            </Button>
            {data.image && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setField("image", "")} className="rounded-none text-xs text-destructive">
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Paragraphs */}
      <div className="space-y-4 pt-4 border-t border-border/40">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Body Paragraphs</Label>
        <Textarea className="rounded-none text-sm" rows={3} value={data.body1 ?? ""} placeholder="Paragraph 1..." onChange={(e) => setField("body1", e.target.value)} />
        <Textarea className="rounded-none text-sm" rows={3} value={data.body2 ?? ""} placeholder="Paragraph 2..." onChange={(e) => setField("body2", e.target.value)} />
        <Textarea className="rounded-none text-sm" rows={3} value={data.body3 ?? ""} placeholder="Paragraph 3..." onChange={(e) => setField("body3", e.target.value)} />
      </div>

      {/* Stats */}
      <div className="space-y-3 pt-4 border-t border-border/40">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Page Stats (Counters)</Label>
        {data.stats?.map((stat, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <Input className="h-8 rounded-none text-xs w-24" placeholder="e.g. 40" value={stat.key} onChange={(e) => updateStat(idx, "key", e.target.value)} />
            <Input className="h-8 rounded-none text-xs flex-1" placeholder="Years of craft" value={stat.label} onChange={(e) => updateStat(idx, "label", e.target.value)} />
            <button onClick={() => removeStat(idx)} className="shrink-0 p-1 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addStat} className="rounded-none border-dashed border-gold/40 text-gold hover:border-gold hover:bg-gold hover:text-black text-xs uppercase tracking-widest gap-2 transition-colors">
          <Plus className="h-3.5 w-3.5" /> Add stat
        </Button>
      </div>

      {/* Save Button */}
      <div className="pt-2">
        <Button onClick={handleSave} disabled={saving} className="rounded-none w-full sm:w-auto">
          {saving ? "Saving…" : "Save About Page"}
        </Button>
      </div>
    </div>
  );
}

// ── Main Page Component ────────────────────────────────────────────────────────────────
export default function AdminContent() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["website_content", "admin"], queryFn: () => getWebsiteContent() });
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) {
      const d: Record<string, string> = {};
      for (const s of JSON_SECTIONS) d[s] = JSON.stringify(data[s] ?? {}, null, 2);
      setDrafts(d);
    }
  }, [data]);

  async function persistJson(key: string) {
    try {
      const content = JSON.parse(drafts[key] || "{}");
      await upsertContent(user!.id, { section_key: key, content });
      toast.success(`${key} saved`);
      qc.invalidateQueries({ queryKey: ["website_content"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  // Build initial hero from loaded data, merging with defaults
  const rawHero = (data?.hero ?? {}) as Record<string, any>;
  const initialHero: HeroContent = {
    eyebrow: rawHero.eyebrow ?? "",
    title: rawHero.title ?? "",
    subtitle: rawHero.subtitle ?? "",
    cta: rawHero.cta ?? "",
    cta_url: rawHero.cta_url ?? "",
    slides: Array.isArray(rawHero.slides) ? rawHero.slides : [],
  };

  async function saveHero(heroData: HeroContent) {
    await upsertContent(user!.id, { section_key: "hero", content: heroData });
    qc.invalidateQueries({ queryKey: ["website_content"] });
  }

  // Build initial about from loaded data
  const rawAbout = (data?.about ?? {}) as Record<string, any>;
  const initialAbout: AboutContent = {
    eyebrow: rawAbout.eyebrow ?? "",
    title: rawAbout.title ?? "",
    body: rawAbout.body ?? "",
    stats: Array.isArray(rawAbout.stats) ? rawAbout.stats : [],
  };

  async function saveAbout(aboutData: AboutContent) {
    await upsertContent(user!.id, { section_key: "about", content: aboutData });
    qc.invalidateQueries({ queryKey: ["website_content"] });
  }

  // Build initial our story from loaded data
  const rawOurStory = (data?.our_story ?? {}) as Record<string, any>;
  const initialOurStory: OurStoryContent = {
    content: rawOurStory.content ?? "",
  };

  async function saveOurStory(storyData: OurStoryContent) {
    await upsertContent(user!.id, { section_key: "our_story", content: storyData });
    qc.invalidateQueries({ queryKey: ["website_content"] });
  }

  // Build initial testimonials from loaded data
  const rawTestimonials = (data?.testimonials ?? {}) as Record<string, any>;
  const initialTestimonials: TestimonialsContent = {
    items: Array.isArray(rawTestimonials.items) ? rawTestimonials.items : [],
  };

  async function saveTestimonials(tData: TestimonialsContent) {
    await upsertContent(user!.id, { section_key: "testimonials", content: tData });
    qc.invalidateQueries({ queryKey: ["website_content"] });
  }

  // Build initial contact from loaded data
  const rawContact = (data?.contact ?? {}) as Record<string, any>;
  const initialContact: ContactContent = {
    eyebrow: rawContact.eyebrow, title: rawContact.title, body: rawContact.body,
    address: rawContact.address, email: rawContact.email, phone: rawContact.phone,
  };

  async function saveContact(cData: ContactContent) {
    await upsertContent(user!.id, { section_key: "contact", content: cData });
    qc.invalidateQueries({ queryKey: ["website_content"] });
  }

  // Build initial footer from loaded data
  const rawFooter = (data?.footer ?? {}) as Record<string, any>;
  const initialFooter: FooterContent = {
    description: rawFooter.description, address: rawFooter.address,
    email: rawFooter.email, phone: rawFooter.phone, copyright: rawFooter.copyright,
  };

  async function saveFooter(fData: FooterContent) {
    await upsertContent(user!.id, { section_key: "footer", content: fData });
    qc.invalidateQueries({ queryKey: ["website_content"] });
  }

  // Build initial about page from loaded data
  const rawAboutPage = (data?.about_page ?? {}) as Record<string, any>;
  const initialAboutPage: AboutPageContent = {
    title: rawAboutPage.title,
    subtitle: rawAboutPage.subtitle,
    image: rawAboutPage.image,
    body1: rawAboutPage.body1,
    body2: rawAboutPage.body2,
    body3: rawAboutPage.body3,
    stats: Array.isArray(rawAboutPage.stats) ? rawAboutPage.stats : [],
  };

  async function saveAboutPage(apData: AboutPageContent) {
    await upsertContent(user!.id, { section_key: "about_page", content: apData });
    qc.invalidateQueries({ queryKey: ["website_content"] });
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">
        Edit website sections. The most common sections have dedicated editors; others use raw JSON.
      </p>

      {/* Hero dedicated editor */}
      <HeroEditor initial={initialHero} onSave={saveHero} />

      {/* About Section (Homepage) dedicated editor */}
      <AboutEditor initial={initialAbout} onSave={saveAbout} />

      {/* About Page dedicated editor */}
      <AboutPageEditor initial={initialAboutPage} onSave={saveAboutPage} />

      {/* Our Story dedicated editor */}
      <OurStoryEditor initial={initialOurStory} onSave={saveOurStory} />

      {/* Testimonials dedicated editor */}
      <TestimonialsEditor initial={initialTestimonials} onSave={saveTestimonials} />

      {/* Contact dedicated editor */}
      <ContactEditor initial={initialContact} onSave={saveContact} />

      {/* Footer dedicated editor */}
      <FooterEditor initial={initialFooter} onSave={saveFooter} />

      {/* JSON editors for remaining sections */}
      {JSON_SECTIONS.map((s) => (
        <div key={s} className="rounded-xl border border-border/60 bg-black/30 backdrop-blur-md p-6 shadow-xl space-y-3">
          <Label className="text-base font-display capitalize">{s}</Label>
          <Textarea
            className="mt-3 font-mono text-xs"
            rows={12}
            value={drafts[s] ?? ""}
            onChange={(e) => setDrafts({ ...drafts, [s]: e.target.value })}
          />
          <Button onClick={() => persistJson(s)} className="mt-3 rounded-none">
            Save {s}
          </Button>
        </div>
      ))}
    </div>
  );
}
