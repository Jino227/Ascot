"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getCelebritiesAdmin, upsertCelebrity, deleteCelebrity, uploadCelebrityImage } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";

type Celebrity = { id?: string; name: string; description: string; image: string; display_order: number; is_published: boolean };
const empty: Celebrity = { name: "", description: "", image: "", display_order: 0, is_published: true };

export default function AdminCelebrities() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: celebrities = [], isLoading } = useQuery({ 
    queryKey: ["admin", "celebrities"], 
    queryFn: () => getCelebritiesAdmin(user!.id), 
    enabled: !!user 
  });
  
  const [draft, setDraft] = useState<Celebrity | null>(null);

  async function save() {
    if (!draft) return;
    if (!draft.name || !draft.image) {
      toast.error("Name and Image are required.");
      return;
    }
    try {
      await upsertCelebrity(user!.id, { 
        ...draft, 
        image: draft.image, 
        description: draft.description || undefined, 
        display_order: Number(draft.display_order) 
      });
      toast.success("Celebrity saved"); 
      setDraft(null); 
      qc.invalidateQueries({ queryKey: ["admin", "celebrities"] }); 
      qc.invalidateQueries({ queryKey: ["public", "celebrities"] });
    } catch (error: any) { 
      toast.error(error.message); 
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this celebrity?")) return;
    try { 
      await deleteCelebrity(user!.id, id); 
      qc.invalidateQueries({ queryKey: ["admin", "celebrities"] }); 
      toast.success("Deleted"); 
    } catch (error: any) { 
      toast.error(error.message); 
    }
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="font-display text-2xl">Celebrity Showcase</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage celebrities and the garments they wore.</p>
        </div>
        <Button onClick={() => setDraft(empty)} className="rounded-none">
          <Plus className="mr-2 h-4 w-4" /> Add Celebrity
        </Button>
      </div>

      <div className="space-y-3">
        {celebrities.map((c: any) => (
          <div key={c.id} className="flex items-center justify-between border border-border/60 bg-card p-4">
            <div className="flex items-center gap-4">
              {c.image && <img src={c.image} alt={c.name} className="h-16 w-16 object-cover" />}
              <div>
                <div className="text-xs uppercase tracking-widest text-accent">
                  Order: {c.display_order} · {c.is_published ? "Published" : "Draft"}
                </div>
                <div className="font-display text-xl">{c.name}</div>
                <div className="text-sm text-muted-foreground line-clamp-1">{c.description}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setDraft({ ...c, description: c.description ?? "", image: c.image ?? "" })}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => remove(c.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {celebrities.length === 0 && (
          <div className="border border-border/60 p-10 text-center text-muted-foreground">
            No celebrities added yet.
          </div>
        )}
      </div>

      {draft && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-background/90 p-4 backdrop-blur-sm">
          <div className="mx-auto mt-10 max-w-xl border border-border/60 bg-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl">{draft.id ? "Edit" : "New"} Celebrity</h2>
              <Button variant="ghost" onClick={() => setDraft(null)}>Close</Button>
            </div>
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-[1fr_120px] gap-4">
                <div>
                  <Label>Celebrity Name</Label>
                  <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                </div>
                <div>
                  <Label>Display Order</Label>
                  <Input type="number" value={draft.display_order} onChange={(e) => setDraft({ ...draft, display_order: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <Label>Description / Garment Info</Label>
                <Textarea rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
              </div>
              <ImageUpload value={draft.image} onChange={(url) => setDraft({ ...draft, image: url })} label="Celebrity Photo" />
              
              <div className="flex items-center gap-3 pt-2">
                <Switch checked={draft.is_published} onCheckedChange={(value) => setDraft({ ...draft, is_published: value })} />
                <Label>Published to Website</Label>
              </div>
              <Button onClick={save} className="w-full rounded-none mt-4">Save Celebrity</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
