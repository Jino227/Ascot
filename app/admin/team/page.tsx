"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getWebsiteContent, upsertContent } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, GripVertical } from "lucide-react";

type GalleryImage = { url: string; caption: string; category: string };

const CATEGORIES = ["employees", "machines", "group"];

export default function AdminCompanyGallery() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["website_content", "admin"], queryFn: () => getWebsiteContent() });
  const gallery: { title?: string; images?: GalleryImage[] } = data?.company_gallery ?? {};
  const images: GalleryImage[] = gallery.images ?? [];

  const [open, setOpen] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("employees");

  function resetForm() { setUrl(""); setCaption(""); setCategory("employees"); setEditIdx(null); }

  function openAdd() { resetForm(); setOpen(true); }
  function openEdit(idx: number) {
    const img = images[idx];
    setUrl(img.url); setCaption(img.caption); setCategory(img.category); setEditIdx(idx); setOpen(true);
  }

  async function save() {
    if (!url) { toast.error("Please upload an image"); return; }
    const entry: GalleryImage = { url, caption, category };
    let updated: GalleryImage[];
    if (editIdx !== null) {
      updated = images.map((img, i) => i === editIdx ? entry : img);
    } else {
      updated = [...images, entry];
    }
    try {
      await upsertContent(user!.id, { section_key: "company_gallery", content: { ...gallery, images: updated } });
      toast.success("Saved");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["website_content"] });
    } catch (e: any) { toast.error(e.message); }
  }

  async function remove(idx: number) {
    if (!confirm("Delete this image?")) return;
    const updated = images.filter((_, i) => i !== idx);
    await upsertContent(user!.id, { section_key: "company_gallery", content: { ...gallery, images: updated } });
    qc.invalidateQueries({ queryKey: ["website_content"] });
    toast.success("Deleted");
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Manage images of your workspace — employees, machines, and team photos.</p>
        <Button onClick={openAdd} className="rounded-none"><Plus className="mr-2 h-4 w-4" />Add image</Button>
      </div>
      {images.length === 0 && <div className="p-12 text-center text-muted-foreground border border-dashed border-border/60">No images yet. Click "Add image" to upload.</div>}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {images.map((img, i) => (
          <div key={i} className="group relative border border-border/60 bg-card overflow-hidden">
            <div className="aspect-[4/3] overflow-hidden bg-muted">
              <img src={img.url} alt={img.caption} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-4">
              <p className="text-sm font-medium truncate">{img.caption || "Untitled"}</p>
              <span className="inline-block mt-1 text-[10px] uppercase tracking-wider px-2 py-0.5 bg-accent/10 text-accent rounded-sm">{img.category}</span>
            </div>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="secondary" className="h-8 w-8 p-0 rounded" onClick={() => openEdit(i)}><Pencil className="h-3.5 w-3.5" /></Button>
              <Button size="sm" variant="destructive" className="h-8 w-8 p-0 rounded" onClick={() => remove(i)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editIdx !== null ? "Edit" : "Add"} image</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <ImageUpload value={url} onChange={setUrl} label="Image" />
            <div><Label>Caption</Label><Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Master tailor at work" /></div>
            <div><Label>Category</Label>
              <div className="flex gap-3 mt-1">
                {CATEGORIES.map((c) => (
                  <button key={c} type="button" onClick={() => setCategory(c)}
                    className={`px-4 py-2 text-xs uppercase tracking-wider border transition-colors ${category === c ? 'bg-accent text-accent-foreground border-accent' : 'border-border/60 text-muted-foreground hover:border-accent/50'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={save} className="w-full rounded-none">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
