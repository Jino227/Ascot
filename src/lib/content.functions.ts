import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getWebsiteContent = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("website_content").select("*");
  if (error) throw new Error(error.message);
  const map: Record<string, any> = {};
  for (const row of data ?? []) map[row.section_key] = row.content;
  return map;
});

export const getCollections = createServerFn({ method: "GET" })
  .inputValidator((i: { includePrivate?: boolean } | undefined) => i ?? {})
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin.from("collections").select("*").order("display_order");
    if (!data.includePrivate) q = q.eq("is_public", true);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getCollectionBySlug = createServerFn({ method: "GET" })
  .inputValidator((i) => z.object({ slug: z.string().min(1) }).parse(i))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: collection } = await supabaseAdmin
      .from("collections").select("*").eq("slug", data.slug).maybeSingle();
    if (!collection) return null;
    const { data: products } = await supabaseAdmin
      .from("products").select("*, product_images(*)")
      .eq("collection_id", collection.id).eq("is_public", true)
      .order("display_order");
    return { collection, products: products ?? [] };
  });

export const getFeaturedProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("products").select("*, product_images(*)")
    .eq("is_public", true).eq("is_featured", true)
    .order("display_order").limit(6);
  return data ?? [];
});

export const submitInquiry = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z.object({
      name: z.string().min(1).max(120),
      email: z.string().email().max(200),
      phone: z.string().max(40).optional(),
      company: z.string().max(200).optional(),
      message: z.string().min(5).max(4000),
    }).parse(i),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("inquiries").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------- authenticated reads ---------- */

export const getAllCollectionsAuthed = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("collections").select("*").order("display_order");
    if (error) throw new Error(error.message);
    return data ?? [];
  });
