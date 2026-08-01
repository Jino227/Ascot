"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { deleteJourneyStep, getJourneyStepsAdmin, upsertJourneyStep, uploadJourneyImage } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2, Upload, Route, Sparkles } from "lucide-react";
import { Tilt3DCard } from "@/components/layout/Tilt3DCard";

export default function AdminJourney() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: steps = [], isLoading } = useQuery({ 
    queryKey: ["admin", "journey"], 
    queryFn: () => getJourneyStepsAdmin(user!.id), 
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
      const { url } = await uploadJourneyImage(user!.id, form);
      
      await upsertJourneyStep(user!.id, {
        title: "Journey Image",
        subtitle: "",
        description: "Journey gallery image",
        image: url,
        step_order: 0,
        is_published: true,
      });
      
      qc.invalidateQueries({ queryKey: ["admin", "journey"] });
      toast.success("Image uploaded successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function updateOrder(step: any, newOrder: number) {
    try {
      await upsertJourneyStep(user!.id, { ...step, step_order: newOrder });
      qc.invalidateQueries({ queryKey: ["admin", "journey"] });
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this image?")) return;
    try { 
      await deleteJourneyStep(user!.id, id); 
      qc.invalidateQueries({ queryKey: ["admin", "journey"] }); 
      toast.success("Deleted"); 
    } catch (error: any) { 
      toast.error(error.message); 
    }
  }

  if (isLoading) return <div className="py-12 text-muted-foreground font-light text-sm">Loading journey gallery…</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h2 className="font-display text-3xl flex items-center gap-2 text-foreground">
            <Route className="h-5 w-5 text-gold" /> Journey Gallery
          </h2>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1 font-light">
            Manage imagery and sequence ordering for the Our Journey process section.
          </p>
        </div>
        <div>
          <Button asChild disabled={uploading} className="rounded-none bg-accent text-accent-foreground hover:bg-accent/90 text-xs uppercase tracking-[0.15em] px-6 py-5 h-auto shadow-[0_0_20px_rgba(212,175,55,0.25)] relative overflow-hidden">
            <label className="cursor-pointer inline-flex items-center gap-2">
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading…" : "Upload New Image"}
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
            </label>
          </Button>
        </div>
      </div>

      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {steps.map((step: any) => (
          <div key={step.id} className="break-inside-avoid">
            <Tilt3DCard maxTilt={6} scaleOnHover={1.02}>
              <div className="relative group rounded-xl border border-border/60 bg-black/40 overflow-hidden shadow-lg">
                {step.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={step.image} alt="" className="w-full object-cover" />
                ) : (
                  <div className="h-40 bg-muted flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                )}
                
                <div className="absolute inset-0 bg-black/85 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Step Order</Label>
                      <Input 
                        type="number" 
                        defaultValue={step.step_order} 
                        onBlur={(e) => updateOrder(step, parseInt(e.target.value) || 0)}
                        className="mt-1.5 h-9 text-xs rounded-none border-border/60 bg-background/50 focus-visible:ring-gold" 
                      />
                    </div>
                  </div>
                  
                  <Button size="sm" variant="destructive" onClick={() => remove(step.id)} className="w-full rounded-none text-xs uppercase tracking-wider">
                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                  </Button>
                </div>
              </div>
            </Tilt3DCard>
          </div>
        ))}
      </div>
      
      {steps.length === 0 && (
        <div className="rounded-xl border border-gold/20 bg-black/20 p-16 text-center text-muted-foreground font-light text-sm border-dashed">
          No journey images uploaded yet. Use the button above to upload.
        </div>
      )}
    </div>
  );
}
