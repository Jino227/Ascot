import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin required");
}

const collectionSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(200),
  description: z.string().max(4000).optional().nullable(),
  cover_image: z.string().url().max(800).optional().nullable(),
  is_public: z.boolean(),
  display_order: z.number().int().min(0).default(0),
});

export const upsertCollection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => collectionSchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = data.id
      ? await supabaseAdmin.from("collections").update(data).eq("id", data.id)
      : await supabaseAdmin.from("collections").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteCollection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("collections").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const productSchema = z.object({
  id: z.string().uuid().optional(),
  collection_id: z.string().uuid(),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(200),
  description: z.string().max(4000).optional().nullable(),
  composition: z.string().max(400).optional().nullable(),
  weight_gsm: z.number().int().min(0).max(5000).optional().nullable(),
  width_cm: z.number().int().min(0).max(500).optional().nullable(),
  is_public: z.boolean(),
  is_featured: z.boolean().default(false),
  display_order: z.number().int().min(0).default(0),
  image_urls: z.array(z.string().url().max(800)).max(20).optional(),
});

export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => productSchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { image_urls, ...row } = data;
    let productId = data.id;
    if (productId) {
      const { error } = await supabaseAdmin.from("products").update(row).eq("id", productId);
      if (error) throw new Error(error.message);
    } else {
      const { data: ins, error } = await supabaseAdmin.from("products").insert(row).select("id").single();
      if (error) throw new Error(error.message);
      productId = ins.id;
    }
    if (image_urls && productId) {
      await supabaseAdmin.from("product_images").delete().eq("product_id", productId);
      if (image_urls.length) {
        await supabaseAdmin.from("product_images").insert(
          image_urls.map((url, i) => ({ product_id: productId!, url, display_order: i }))
        );
      }
    }
    return { ok: true, id: productId };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listAllProductsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("products").select("*, product_images(*), collections(name,slug)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({
      section_key: z.string().min(1).max(60).regex(/^[a-z0-9_]+$/),
      content: z.record(z.string(), z.any()),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("website_content")
      .upsert(data, { onConflict: "section_key" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profiles } = await supabaseAdmin
      .from("profiles").select("*").order("created_at", { ascending: false });
    const { data: roles } = await supabaseAdmin.from("user_roles").select("*");
    return (profiles ?? []).map((p) => ({
      ...p,
      roles: (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role),
    }));
  });

export const listInquiries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("inquiries").select("*").order("created_at", { ascending: false });
    return data ?? [];
  });

export const promoteToAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ user_id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles").upsert({ user_id: data.user_id, role: "admin" }, { onConflict: "user_id,role" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_roles").select("role").eq("user_id", context.userId).eq("role", "admin").maybeSingle();
    return { isAdmin: !!data };
  });
