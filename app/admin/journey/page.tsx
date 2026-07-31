"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { deleteJourneyStep, getJourneyStepsAdmin, upsertJourneyStep, uploadJourneyImage } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

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

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl">Journey Gallery</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage images for the Our Journey section.</p>
        </div>
        <div>
          <Button asChild disabled={uploading} className="rounded-none relative overflow-hidden">
            <label className="cursor-pointer">
              {uploading ? "Uploading..." : "Upload New Image"}
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
            </label>
          </Button>
        </div>
      </div>

      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {steps.map((step: any) => (
          <div key={step.id} className="break-inside-avoid relative group border border-border/60 bg-card overflow-hidden">
            {step.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={step.image} alt="" className="w-full object-cover" />
            ) : (
              <div className="h-40 bg-muted flex items-center justify-center text-xs">No image</div>
            )}
            
            <div className="absolute inset-0 bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Display Order</Label>
                  <Input 
                    type="number" 
                    defaultValue={step.step_order} 
                    onBlur={(e) => updateOrder(step, parseInt(e.target.value) || 0)}
                    className="mt-1 h-8 text-xs rounded-none" 
                  />
                </div>
              </div>
              
              <Button size="sm" variant="destructive" onClick={() => remove(step.id)} className="w-full rounded-none">
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      {steps.length === 0 && (
        <div className="text-center py-20 text-muted-foreground border border-border/60 border-dashed">
          No journey images uploaded yet.
        </div>
      )}
    </div>
  );
}
