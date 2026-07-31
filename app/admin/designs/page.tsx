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
import { Trash2 } from "lucide-react";

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
      e.target.value = ""; // Reset input
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

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl">Designs Gallery</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage individual designs for the masonry gallery.</p>
        </div>
        <div>
          <Button asChild disabled={uploading} className="rounded-none relative overflow-hidden">
            <label className="cursor-pointer">
              {uploading ? "Uploading..." : "Upload New Design"}
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
            </label>
          </Button>
        </div>
      </div>

      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {designs.map((d: any) => (
          <div key={d.id} className="break-inside-avoid relative group border border-border/60 bg-card overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={d.url} alt="" className="w-full object-cover" />
            
            <div className="absolute inset-0 bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Private</Label>
                  <Switch 
                    checked={d.is_private} 
                    onCheckedChange={() => togglePrivate(d.id, d.is_private, d.url, d.display_order)} 
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Display Order</Label>
                  <Input 
                    type="number" 
                    defaultValue={d.display_order} 
                    onBlur={(e) => updateOrder(d.id, d.url, d.is_private, parseInt(e.target.value) || 0)}
                    className="mt-1 h-8 text-xs rounded-none" 
                  />
                </div>
              </div>
              
              <Button size="sm" variant="destructive" onClick={() => remove(d.id)} className="w-full rounded-none">
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      {designs.length === 0 && (
        <div className="text-center py-20 text-muted-foreground border border-border/60 border-dashed">
          No designs uploaded yet.
        </div>
      )}
    </div>
  );
}
