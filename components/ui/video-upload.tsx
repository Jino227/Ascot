"use client";

import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, Video } from "lucide-react";
import { toast } from "sonner";

export function VideoUpload({ value, onChange, label }: { value: string; onChange: (url: string) => void; label?: string }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `videos/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("media").upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
      onChange(pub.publicUrl);
      toast.success("Video uploaded");
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium leading-none">{label}</label>}
      <div className="flex items-center gap-3">
        <input ref={inputRef} type="file" accept="video/*" onChange={handleFile} className="hidden" />
        <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()} className="rounded-none">
          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Video className="mr-2 h-4 w-4" />}
          {uploading ? "Uploading…" : "Upload video"}
        </Button>
        {value && <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")} className="rounded-none"><X className="h-4 w-4" /> Clear</Button>}
      </div>
      {value && (
        <video src={value} controls className="h-32 w-56 rounded border border-border/60 object-cover" />
      )}
    </div>
  );
}
