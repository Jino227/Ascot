import { supabase } from "@/integrations/supabase/client";

/** Uploads the file directly from the browser to Supabase Storage. Large files
 * should not be sent through a Next.js Server Action, whose default request
 * body limit is small and whose server would otherwise buffer the whole file.
 */
export async function uploadClientMedia(file: File, folder: string) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "3600",
    contentType: file.type || undefined,
    upsert: false,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}
