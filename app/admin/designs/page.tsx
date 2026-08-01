"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getDesignsAdmin, upsertDesign, deleteDesign, uploadDesignImage } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2, Upload, Crown, Eye, Sparkles } from "lucide-react";
import { Tilt3DCard } from "@/components/layout/Tilt3DCard";

export default function AdminDesigns() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: designs = [], isLoading } = useQuery({ 
    queryKey: ["admin", "designs"], 
    queryFn: () => getDesignsAdmin(user!.id),
    enabled: !!user
  });
  
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const { url } = await uploadDesignImage(user!.id, form);
      
      await upsertDesign(user!.id, {
        url,
        is_private: false,
        display_order: 0,
      });
      
      qc.invalidateQueries({ queryKey: ["admin", "designs"] });
      toast.success("Image uploaded successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function togglePrivate(id: string, currentPrivate: boolean, url: string, display_order: number) {
    try {
      await upsertDesign(user!.id, { id, url, is_private: !currentPrivate, display_order });
      qc.invalidateQueries({ queryKey: ["admin", "designs"] });
      toast.success(`Marked as ${!currentPrivate ? "Private" : "Public"}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function updateOrder(id: string, url: string, is_private: boolean, newOrder: number) {
    try {
      await upsertDesign(user!.id, { id, url, is_private, display_order: newOrder });
      qc.invalidateQueries({ queryKey: ["admin", "designs"] });
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this design?")) return;
    try {
      await deleteDesign(user!.id, id);
      qc.invalidateQueries({ queryKey: ["admin", "designs"] });
      toast.success("Design deleted");
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  if (isLoading) return <div className="py-12 text-muted-foreground font-light text-sm">Loading design gallery…</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h2 className="font-display text-3xl flex items-center gap-2 text-foreground">
            <Sparkles className="h-5 w-5 text-gold" /> Designs Gallery
          </h2>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1 font-light">
            Upload, order, and toggle privacy for portfolio design pieces.
          </p>
        </div>
        <div>
          <Button asChild disabled={uploading} className="rounded-none bg-accent text-accent-foreground hover:bg-accent/90 text-xs uppercase tracking-[0.15em] px-6 py-5 h-auto shadow-[0_0_20px_rgba(212,175,55,0.25)] relative overflow-hidden">
            <label className="cursor-pointer inline-flex items-center gap-2">
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading…" : "Upload New Design"}
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
            </label>
          </Button>
        </div>
      </div>

      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {designs.map((d: any) => (
          <div key={d.id} className="break-inside-avoid">
            <Tilt3DCard maxTilt={6} scaleOnHover={1.02}>
              <div className="relative group rounded-xl border border-border/60 bg-black/40 overflow-hidden shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.url} alt="" className="w-full object-cover" />

                {d.is_private && (
                  <div className="absolute top-3 right-3 z-10 pointer-events-none">
                    <span className="flex items-center gap-1 rounded-full bg-gold/90 border border-gold px-2.5 py-1 text-[9px] uppercase tracking-widest text-black font-semibold shadow-md">
                      <Crown className="h-3 w-3" /> Private
                    </span>
                  </div>
                )}
                
                <div className="absolute inset-0 z-20 bg-black/85 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border/40 pb-3 cursor-pointer" onClick={() => togglePrivate(d.id, d.is_private, d.url, d.display_order)}>
                      <Label className="text-xs uppercase tracking-wider text-gold font-medium cursor-pointer">Private Collection</Label>
                      <Switch 
                        checked={d.is_private} 
                        onCheckedChange={() => togglePrivate(d.id, d.is_private, d.url, d.display_order)} 
                      />
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Display Order</Label>
                      <Input 
                        type="number" 
                        defaultValue={d.display_order} 
                        onBlur={(e) => updateOrder(d.id, d.url, d.is_private, parseInt(e.target.value) || 0)}
                        className="mt-1 h-9 text-xs rounded-none border-border/60 bg-background/50 focus-visible:ring-gold" 
                      />
                    </div>
                  </div>
                  
                  <Button size="sm" variant="destructive" onClick={() => remove(d.id)} className="w-full rounded-none text-xs uppercase tracking-wider">
                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                  </Button>
                </div>
              </div>
            </Tilt3DCard>
          </div>
        ))}
      </div>
      
      {designs.length === 0 && (
        <div className="rounded-xl border border-gold/20 bg-black/20 p-16 text-center text-muted-foreground font-light text-sm border-dashed">
          No designs uploaded yet. Use the button above to upload.
        </div>
      )}
    </div>
  );
}
