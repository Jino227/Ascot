"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getWorks } from "@/lib/actions";
import { upsertWork, deleteWork } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { VideoUpload } from "@/components/ui/video-upload";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, X } from "lucide-react";

type Row = {
  id?: string; title: string; description: string; category: string;
  cover_image: string; images: string[]; video_url: string;
  client_name: string; completion_date: string;
  is_featured: boolean; display_order: number;
};
const empty: Row = { title: "", description: "", category: "", cover_image: "", images: [], video_url: "", client_name: "", completion_date: "", is_featured: false, display_order: 0 };

export default function AdminWorks() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin", "works"], queryFn: () => getWorks() });
  const [open, setOpen] = useState(false);
  const [row, setRow] = useState<Row>(empty);

  function edit(w: any) { setRow({ ...w, description: w.description ?? "", category: w.category ?? "", cover_image: w.cover_image ?? "", images: w.images ?? [], video_url: w.video_url ?? "", client_name: w.client_name ?? "", completion_date: w.completion_date ?? "" }); setOpen(true); }
  function newOne() { setRow(empty); setOpen(true); }

  async function save() {
    try {
      await upsertWork(user!.id, {
        ...(row.id ? { id: row.id } : {}),
        title: row.title, description: row.description || null,
        category: row.category || null, cover_image: row.cover_image || null,
        images: row.images, video_url: row.video_url || null,
        client_name: row.client_name || null, completion_date: row.completion_date || null,
        is_featured: row.is_featured, display_order: Number(row.display_order) || 0,
      });
      toast.success("Saved");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin", "works"] });
    } catch (e: any) { toast.error(e.message); }
  }
  async function remove(id: string) {
    if (!confirm("Delete this work?")) return;
    await deleteWork(user!.id, id);
    qc.invalidateQueries({ queryKey: ["admin", "works"] });
    toast.success("Deleted");
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Button onClick={newOne} className="rounded-none"><Plus className="mr-2 h-4 w-4" />New work</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.map((w: any) => (
          <div key={w.id} className="border border-border/60 bg-card p-4">
            <div className="aspect-[4/3] overflow-hidden bg-muted flex items-center justify-center">
              {w.cover_image ? <img src={w.cover_image} alt={w.title} className="h-full w-full object-cover" /> : <span className="text-xs text-muted-foreground">No image</span>}
            </div>
            <div className="mt-3 flex items-start justify-between gap-2">
              <div>
                <div className="font-display text-lg">{w.title}</div>
                <div className="text-xs text-muted-foreground">{w.category ?? "—"} {w.is_featured ? "· Featured" : ""} {w.video_url ? "· Has video" : ""}</div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => edit(w)}><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => remove(w.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {data.length === 0 && <div className="p-8 text-center text-muted-foreground">No works yet.</div>}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{row.id ? "Edit" : "New"} work</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Title</Label><Input value={row.title} onChange={(e) => setRow({ ...row, title: e.target.value })} /></div>
              <div><Label>Category</Label><Input value={row.category} onChange={(e) => setRow({ ...row, category: e.target.value })} placeholder="Commercial / Residential / Event" /></div>
            </div>
            <div><Label>Description</Label><Textarea rows={3} value={row.description} onChange={(e) => setRow({ ...row, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Client name</Label><Input value={row.client_name} onChange={(e) => setRow({ ...row, client_name: e.target.value })} /></div>
              <div><Label>Completion date</Label><Input type="date" value={row.completion_date} onChange={(e) => setRow({ ...row, completion_date: e.target.value })} /></div>
            </div>
            <ImageUpload value={row.cover_image} onChange={(url) => setRow({ ...row, cover_image: url })} label="Cover image" />
            <div>
              <Label>Gallery images</Label>
              <div className="mt-2 space-y-2">
                <ImageUpload value="" onChange={(url) => setRow({ ...row, images: [...row.images, url] })} />
                {row.images.map((u, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <img src={u} className="h-12 w-12 rounded border border-border/60 object-cover" alt="" />
                    <Input value={u} onChange={(e) => setRow({ ...row, images: row.images.map((x, j) => j === i ? e.target.value : x) })} className="flex-1" />
                    <Button size="sm" variant="ghost" onClick={() => setRow({ ...row, images: row.images.filter((_, j) => j !== i) })}><X className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </div>
            <VideoUpload value={row.video_url} onChange={(url) => setRow({ ...row, video_url: url })} label="Project video" />
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2"><Switch checked={row.is_featured} onCheckedChange={(v) => setRow({ ...row, is_featured: v })} /><Label>Featured</Label></div>
              <div className="flex items-center gap-2"><Label>Order</Label><Input type="number" className="w-20" value={row.display_order} onChange={(e) => setRow({ ...row, display_order: Number(e.target.value) })} /></div>
            </div>
            <Button onClick={save} className="w-full rounded-none">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
