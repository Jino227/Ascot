import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getCollections } from "@/lib/content.functions";
import { upsertCollection, deleteCollection } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/collections")({
  component: AdminCollections,
});

type Row = { id?: string; slug: string; name: string; description: string; cover_image: string; is_public: boolean; display_order: number; };
const empty: Row = { slug: "", name: "", description: "", cover_image: "", is_public: true, display_order: 0 };

function AdminCollections() {
  const list = useServerFn(getCollections);
  const upsert = useServerFn(upsertCollection);
  const del = useServerFn(deleteCollection);
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin", "collections"], queryFn: () => list({ data: { includePrivate: true } }) });
  const [open, setOpen] = useState(false);
  const [row, setRow] = useState<Row>(empty);

  function edit(c: any) { setRow({ ...c, description: c.description ?? "", cover_image: c.cover_image ?? "" }); setOpen(true); }
  function newOne() { setRow(empty); setOpen(true); }

  async function save() {
    try {
      await upsert({ data: {
        ...(row.id ? { id: row.id } : {}),
        slug: row.slug, name: row.name,
        description: row.description || null, cover_image: row.cover_image || null,
        is_public: row.is_public, display_order: Number(row.display_order) || 0,
      } as any });
      toast.success("Saved");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin", "collections"] });
      qc.invalidateQueries({ queryKey: ["collections"] });
    } catch (e: any) { toast.error(e.message); }
  }
  async function remove(id: string) {
    if (!confirm("Delete this collection?")) return;
    await del({ data: { id } });
    qc.invalidateQueries({ queryKey: ["admin", "collections"] });
    toast.success("Deleted");
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Button onClick={newOne} className="rounded-none"><Plus className="mr-2 h-4 w-4" />New collection</Button>
      </div>
      <div className="border border-border/60">
        {data.map((c: any) => (
          <div key={c.id} className="flex items-center justify-between border-b border-border/60 p-4 last:border-0">
            <div className="flex items-center gap-4">
              {c.cover_image && <img src={c.cover_image} className="h-14 w-14 object-cover" alt="" />}
              <div>
                <div className="font-display text-lg">{c.name}</div>
                <div className="text-xs text-muted-foreground">/{c.slug} · {c.is_public ? "Public" : "Private"} · order {c.display_order}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => edit(c)}><Pencil className="h-4 w-4" /></Button>
              <Button size="sm" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        {data.length === 0 && <div className="p-8 text-center text-muted-foreground">No collections yet.</div>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{row.id ? "Edit" : "New"} collection</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Name</Label><Input value={row.name} onChange={(e) => setRow({ ...row, name: e.target.value })} /></div>
              <div><Label>Slug</Label><Input value={row.slug} onChange={(e) => setRow({ ...row, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} /></div>
            </div>
            <div><Label>Description</Label><Textarea rows={3} value={row.description} onChange={(e) => setRow({ ...row, description: e.target.value })} /></div>
            <div><Label>Cover image URL</Label><Input value={row.cover_image} onChange={(e) => setRow({ ...row, cover_image: e.target.value })} placeholder="https://..." /></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3"><Switch checked={row.is_public} onCheckedChange={(v) => setRow({ ...row, is_public: v })} /><Label>Public</Label></div>
              <div className="flex items-center gap-2"><Label>Order</Label><Input type="number" className="w-20" value={row.display_order} onChange={(e) => setRow({ ...row, display_order: Number(e.target.value) })} /></div>
            </div>
            <Button onClick={save} className="w-full rounded-none">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
