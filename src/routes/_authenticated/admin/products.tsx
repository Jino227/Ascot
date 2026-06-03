import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getCollections } from "@/lib/content.functions";
import { listAllProductsAdmin, upsertProduct, deleteProduct } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/products")({ component: AdminProducts });

type Row = {
  id?: string; collection_id: string; slug: string; name: string; description: string;
  composition: string; weight_gsm: number | ""; width_cm: number | "";
  is_public: boolean; is_featured: boolean; display_order: number; image_urls: string[];
};
const empty: Row = { collection_id: "", slug: "", name: "", description: "", composition: "", weight_gsm: "", width_cm: "", is_public: true, is_featured: false, display_order: 0, image_urls: [] };

function AdminProducts() {
  const listFn = useServerFn(listAllProductsAdmin);
  const collFn = useServerFn(getCollections);
  const upsert = useServerFn(upsertProduct);
  const del = useServerFn(deleteProduct);
  const qc = useQueryClient();
  const { data: products = [] } = useQuery({ queryKey: ["admin", "products"], queryFn: () => listFn() });
  const { data: collections = [] } = useQuery({ queryKey: ["admin", "collections"], queryFn: () => collFn({ data: { includePrivate: true } }) });
  const [open, setOpen] = useState(false);
  const [row, setRow] = useState<Row>(empty);
  const [newImg, setNewImg] = useState("");

  function edit(p: any) {
    setRow({
      id: p.id, collection_id: p.collection_id, slug: p.slug, name: p.name,
      description: p.description ?? "", composition: p.composition ?? "",
      weight_gsm: p.weight_gsm ?? "", width_cm: p.width_cm ?? "",
      is_public: p.is_public, is_featured: p.is_featured ?? false,
      display_order: p.display_order, image_urls: (p.product_images ?? []).sort((a: any, b: any) => a.display_order - b.display_order).map((i: any) => i.url),
    });
    setOpen(true);
  }
  function newOne() { setRow({ ...empty, collection_id: collections[0]?.id ?? "" }); setOpen(true); }

  async function save() {
    try {
      await upsert({ data: {
        ...(row.id ? { id: row.id } : {}),
        collection_id: row.collection_id, slug: row.slug, name: row.name,
        description: row.description || null, composition: row.composition || null,
        weight_gsm: row.weight_gsm === "" ? null : Number(row.weight_gsm),
        width_cm: row.width_cm === "" ? null : Number(row.width_cm),
        is_public: row.is_public, is_featured: row.is_featured,
        display_order: Number(row.display_order) || 0,
        image_urls: row.image_urls,
      } as any });
      toast.success("Saved");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    } catch (e: any) { toast.error(e.message); }
  }
  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    await del({ data: { id } });
    qc.invalidateQueries({ queryKey: ["admin", "products"] });
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Button onClick={newOne} disabled={collections.length === 0} className="rounded-none">
          <Plus className="mr-2 h-4 w-4" />New product
        </Button>
      </div>
      {collections.length === 0 && <p className="text-sm text-muted-foreground">Create a collection first.</p>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((p: any) => (
          <div key={p.id} className="border border-border/60 bg-card p-4">
            <div className="aspect-square overflow-hidden bg-muted">
              <img src={p.product_images?.[0]?.url ?? "https://placehold.co/400"} alt={p.name} className="h-full w-full object-cover" />
            </div>
            <div className="mt-3 flex items-start justify-between gap-2">
              <div>
                <div className="font-display text-lg">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.collections?.name} · {p.is_public ? "Public" : "Private"}{p.is_featured ? " · Featured" : ""}</div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => edit(p)}><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{row.id ? "Edit" : "New"} product</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Collection</Label>
              <Select value={row.collection_id} onValueChange={(v) => setRow({ ...row, collection_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{collections.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Name</Label><Input value={row.name} onChange={(e) => setRow({ ...row, name: e.target.value })} /></div>
              <div><Label>Slug</Label><Input value={row.slug} onChange={(e) => setRow({ ...row, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} /></div>
            </div>
            <div><Label>Description</Label><Textarea rows={3} value={row.description} onChange={(e) => setRow({ ...row, description: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Composition</Label><Input value={row.composition} onChange={(e) => setRow({ ...row, composition: e.target.value })} /></div>
              <div><Label>Weight (gsm)</Label><Input type="number" value={row.weight_gsm} onChange={(e) => setRow({ ...row, weight_gsm: e.target.value === "" ? "" : Number(e.target.value) })} /></div>
              <div><Label>Width (cm)</Label><Input type="number" value={row.width_cm} onChange={(e) => setRow({ ...row, width_cm: e.target.value === "" ? "" : Number(e.target.value) })} /></div>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2"><Switch checked={row.is_public} onCheckedChange={(v) => setRow({ ...row, is_public: v })} /><Label>Public</Label></div>
              <div className="flex items-center gap-2"><Switch checked={row.is_featured} onCheckedChange={(v) => setRow({ ...row, is_featured: v })} /><Label>Featured</Label></div>
              <div className="flex items-center gap-2"><Label>Order</Label><Input type="number" className="w-20" value={row.display_order} onChange={(e) => setRow({ ...row, display_order: Number(e.target.value) })} /></div>
            </div>
            <div>
              <Label>Image URLs</Label>
              <div className="mt-2 space-y-2">
                {row.image_urls.map((u, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <img src={u} className="h-10 w-10 object-cover" alt="" />
                    <Input value={u} onChange={(e) => setRow({ ...row, image_urls: row.image_urls.map((x, j) => j === i ? e.target.value : x) })} />
                    <Button size="sm" variant="ghost" onClick={() => setRow({ ...row, image_urls: row.image_urls.filter((_, j) => j !== i) })}><X className="h-4 w-4" /></Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input placeholder="https://..." value={newImg} onChange={(e) => setNewImg(e.target.value)} />
                  <Button onClick={() => { if (newImg) { setRow({ ...row, image_urls: [...row.image_urls, newImg] }); setNewImg(""); } }}>Add</Button>
                </div>
              </div>
            </div>
            <Button onClick={save} className="w-full rounded-none">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
