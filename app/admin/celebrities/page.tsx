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
import { Pencil, Plus, Trash2, Star, Sparkles, X } from "lucide-react";

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

  if (isLoading) return <div className="py-12 text-muted-foreground font-light text-sm">Loading celebrity showcase…</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h2 className="font-display text-3xl flex items-center gap-2 text-foreground">
            <Star className="h-5 w-5 text-gold" /> Celebrity Showcase
          </h2>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1 font-light">
            Manage red carpet features, celebrity clients, and worn garments.
          </p>
        </div>
        <Button onClick={() => setDraft(empty)} className="rounded-none bg-accent text-accent-foreground hover:bg-accent/90 text-xs uppercase tracking-[0.15em] px-6 py-5 h-auto shadow-[0_0_20px_rgba(212,175,55,0.25)]">
          <Plus className="mr-2 h-4 w-4" /> Add Celebrity
        </Button>
      </div>

      <div className="space-y-4">
        {celebrities.map((c: any) => (
          <div key={c.id} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/60 bg-black/30 backdrop-blur-md p-5 transition-all duration-300 hover:border-gold/50 shadow-md">
            <div className="flex items-center gap-4">
              {c.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.image} alt={c.name} className="h-16 w-16 rounded-lg object-cover border border-gold/30" />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">No Image</div>
              )}
              <div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gold font-medium mb-1">
                  <span>Order: {c.display_order}</span>
                  <span>•</span>
                  <span className={c.is_published ? "text-emerald-400" : "text-amber-400"}>
                    {c.is_published ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="font-display text-xl text-foreground">{c.name}</div>
                {c.description && <div className="text-xs text-muted-foreground font-light line-clamp-1 mt-0.5">{c.description}</div>}
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center">
              <Button variant="outline" size="sm" onClick={() => setDraft({ ...c, description: c.description ?? "", image: c.image ?? "" })} className="rounded-none text-xs border-gold/30 hover:border-gold hover:bg-gold/10">
                <Pencil className="h-3.5 w-3.5 mr-1 text-gold" /> Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => remove(c.id)} className="rounded-none text-xs border-destructive/40 text-destructive hover:bg-destructive/10">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}

        {celebrities.length === 0 && (
          <div className="rounded-xl border border-gold/20 bg-black/20 p-12 text-center text-muted-foreground font-light text-sm">
            No celebrities added to showcase yet.
          </div>
        )}
      </div>

      {/* Edit / Create Glass Modal */}
      {draft && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-4 flex items-center justify-center">
          <div className="w-full max-w-xl rounded-2xl border border-gold/40 bg-black/90 backdrop-blur-2xl p-8 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <h2 className="font-display text-2xl text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gold" /> {draft.id ? "Edit" : "New"} Celebrity
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setDraft(null)} className="rounded-full text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="mt-6 space-y-5">
              <div className="grid grid-cols-[1fr_120px] gap-4">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Celebrity Name *</Label>
                  <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="mt-1.5 rounded-none border-border/60 bg-background/50 focus-visible:ring-gold" />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Display Order</Label>
                  <Input type="number" value={draft.display_order} onChange={(e) => setDraft({ ...draft, display_order: Number(e.target.value) })} className="mt-1.5 rounded-none border-border/60 bg-background/50 focus-visible:ring-gold" />
                </div>
              </div>

              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Description / Garment Info</Label>
                <Textarea rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="mt-1.5 rounded-none border-border/60 bg-background/50 focus-visible:ring-gold" />
              </div>

              <ImageUpload value={draft.image} onChange={(url) => setDraft({ ...draft, image: url })} label="Celebrity Photo *" />
              
              <div className="flex items-center gap-3 pt-2">
                <Switch checked={draft.is_published} onCheckedChange={(value) => setDraft({ ...draft, is_published: value })} />
                <Label className="text-xs uppercase tracking-wider text-muted-foreground cursor-pointer">Published to Website</Label>
              </div>

              <div className="pt-4">
                <Button onClick={save} className="w-full rounded-none bg-accent text-accent-foreground hover:bg-accent/90 py-5 h-auto text-xs uppercase tracking-[0.2em] shadow-[0_0_25px_rgba(212,175,55,0.3)]">
                  Save Celebrity
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
