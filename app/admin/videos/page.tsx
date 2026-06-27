"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getVideos } from "@/lib/actions";
import { upsertVideo, deleteVideo } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VideoUpload } from "@/components/ui/video-upload";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";

type Row = { id?: string; title: string; description: string; url: string; thumbnail: string; category: string; is_featured: boolean; display_order: number; };
const empty: Row = { title: "", description: "", url: "", thumbnail: "", category: "", is_featured: false, display_order: 0 };

export default function AdminVideos() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin", "videos"], queryFn: () => getVideos() });
  const [open, setOpen] = useState(false);
  const [row, setRow] = useState<Row>(empty);

  function edit(v: any) { setRow({ ...v, description: v.description ?? "", thumbnail: v.thumbnail ?? "", category: v.category ?? "" }); setOpen(true); }
  function newOne() { setRow(empty); setOpen(true); }

  async function save() {
    try {
      await upsertVideo(user!.id, {
        ...(row.id ? { id: row.id } : {}),
        title: row.title, description: row.description || null,
        url: row.url, thumbnail: row.thumbnail || null,
        category: row.category || null,
        is_featured: row.is_featured, display_order: Number(row.display_order) || 0,
      });
      toast.success("Saved");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin", "videos"] });
    } catch (e: any) { toast.error(e.message); }
  }
  async function remove(id: string) {
    if (!confirm("Delete this video?")) return;
    await deleteVideo(user!.id, id);
    qc.invalidateQueries({ queryKey: ["admin", "videos"] });
    toast.success("Deleted");
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Button onClick={newOne} className="rounded-none"><Plus className="mr-2 h-4 w-4" />New video</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.map((v: any) => (
          <div key={v.id} className="border border-border/60 bg-card p-4">
            <div className="aspect-video overflow-hidden bg-muted flex items-center justify-center">
              {v.thumbnail ? <img src={v.thumbnail} alt={v.title} className="h-full w-full object-cover" /> : <span className="text-xs text-muted-foreground">No thumbnail</span>}
            </div>
            <div className="mt-3 flex items-start justify-between gap-2">
              <div>
                <div className="font-display text-lg truncate">{v.title}</div>
                <div className="text-xs text-muted-foreground">{v.category ?? "—"} {v.is_featured ? "· Featured" : ""}</div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => edit(v)}><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => remove(v.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {data.length === 0 && <div className="p-8 text-center text-muted-foreground">No videos yet.</div>}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{row.id ? "Edit" : "New"} video</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Title</Label><Input value={row.title} onChange={(e) => setRow({ ...row, title: e.target.value })} /></div>
              <div><Label>Category</Label><Input value={row.category} onChange={(e) => setRow({ ...row, category: e.target.value })} placeholder="Promo / Behind the Scenes" /></div>
            </div>
            <div><Label>Description</Label><Textarea rows={2} value={row.description} onChange={(e) => setRow({ ...row, description: e.target.value })} /></div>
            <VideoUpload value={row.url} onChange={(url) => setRow({ ...row, url })} label="Video file" />
            <ImageUpload value={row.thumbnail} onChange={(url) => setRow({ ...row, thumbnail: url })} label="Thumbnail" />
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
