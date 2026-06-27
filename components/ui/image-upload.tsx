import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;

      const { error } = await supabase.storage.from("collections").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;

      const { data: pub } = supabase.storage.from("collections").getPublicUrl(path);
      onChange(pub.publicUrl);
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>}
      <div className="flex items-center gap-3">
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()} className="rounded-none">
          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          {uploading ? "Uploading…" : "Upload"}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")} className="rounded-none">
            <X className="h-4 w-4" /> Clear
          </Button>
        )}
      </div>
      {value && (
        <div className="relative inline-block">
          <img src={value} alt="" className="h-32 w-32 rounded border border-border/60 object-cover" />
        </div>
      )}
    </div>
  );
}
