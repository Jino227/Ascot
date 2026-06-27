"use server";

import { supabaseAdmin } from "@/integrations/supabase/server";
import { z } from "zod";

/* ────────────── PUBLIC READS ────────────── */

export async function getWebsiteContent() {
  const { data, error } = await supabaseAdmin.from("website_content").select("*");
  if (error) throw new Error(error.message);
  const map: Record<string, any> = {};
  for (const row of (data ?? []) as any[]) map[row.section_key] = row.content;
  return map;
}

export async function getCollections(opts?: { includePrivate?: boolean }) {
  let q = supabaseAdmin.from("collections").select("*").order("display_order");
  if (!opts?.includePrivate) q = q.eq("is_public", true);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getCollectionBySlug(slug: string) {
  const { data: collection } = await supabaseAdmin
    .from("collections").select("*").eq("slug", slug).maybeSingle();
  if (!collection) return null;
  const { data: products } = await supabaseAdmin
    .from("products").select("*, product_images(*)")
    .eq("collection_id", collection.id).eq("is_public", true)
    .order("display_order");
  return { collection, products: products ?? [] };
}

export async function getFeaturedProducts() {
  const { data } = await supabaseAdmin
    .from("products").select("*, product_images(*)")
    .eq("is_public", true).eq("is_featured", true)
    .order("display_order").limit(6);
  return data ?? [];
}

export async function getAllCollectionsWithProducts() {
  const { data: collections, error } = await supabaseAdmin
    .from("collections").select("*").order("display_order");
  if (error) throw new Error(error.message);
  const { data: allProducts } = await supabaseAdmin
    .from("products").select("*, product_images(*)").order("display_order");
  const productsByCollection: Record<string, any[]> = {};
  for (const p of allProducts ?? []) {
    const cid = p.collection_id;
    if (cid == null) continue;
    if (!productsByCollection[cid]) productsByCollection[cid] = [];
    productsByCollection[cid].push(p);
  }
  return (collections ?? []).map((c) => ({
    ...c,
    products: productsByCollection[c.id] ?? [],
  }));
}

export async function getAllProductsWithImages() {
  const { data } = await supabaseAdmin
    .from("products").select("*, product_images(*)").order("display_order");
  return data ?? [];
}

/* ────────────── INQUIRIES ────────────── */

export async function submitInquiry(data: {
  name: string; email: string; phone?: string; company?: string; message: string;
}) {
  const parsed = z.object({
    name: z.string().min(1).max(120),
    email: z.string().email().max(200),
    phone: z.string().max(40).optional(),
    company: z.string().max(200).optional(),
    message: z.string().min(5).max(4000),
  }).parse(data);
  const { error } = await supabaseAdmin.from("inquiries").insert(parsed);
  if (error) throw new Error(error.message);
  return { ok: true };
}

/* ────────────── AUTH-READS ────────────── */

export async function checkIsAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  return { isAdmin: !!data };
}

export async function getAllCollectionsAuthed(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("collections").select("*").order("display_order");
  if (error) throw new Error(error.message);
  return data ?? [];
}

/* ────────────── ADMIN ────────────── */

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
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

export async function upsertCollection(userId: string, data: any) {
  await assertAdmin(userId);
  const parsed = collectionSchema.parse(data);
  const { error } = parsed.id
    ? await supabaseAdmin.from("collections").update(parsed).eq("id", parsed.id)
    : await supabaseAdmin.from("collections").insert(parsed);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function deleteCollection(userId: string, id: string) {
  await assertAdmin(userId);
  const { error } = await supabaseAdmin.from("collections").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

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

export async function upsertProduct(userId: string, data: any) {
  await assertAdmin(userId);
  const parsed = productSchema.parse(data);
  const { image_urls, ...row } = parsed;
  let productId = parsed.id;
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
}

export async function deleteProduct(userId: string, id: string) {
  await assertAdmin(userId);
  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function listAllProductsAdmin(userId: string) {
  await assertAdmin(userId);
  const { data, error } = await supabaseAdmin
    .from("products").select("*, product_images(*), collections(name,slug)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function upsertContent(userId: string, data: { section_key: string; content: Record<string, any> }) {
  await assertAdmin(userId);
  const { error } = await supabaseAdmin
    .from("website_content").upsert(data, { onConflict: "section_key" });
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function listUsers(userId: string) {
  await assertAdmin(userId);
  const { data: profiles } = await supabaseAdmin
    .from("profiles").select("*").order("created_at", { ascending: false });
  const { data: roles } = await supabaseAdmin.from("user_roles").select("*");
  return (profiles ?? []).map((p) => ({
    ...p,
    roles: (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role),
  }));
}

export async function listInquiries(userId: string) {
  await assertAdmin(userId);
  const { data } = await supabaseAdmin
    .from("inquiries").select("*").order("created_at", { ascending: false });
  return data ?? [];
}

export async function promoteToAdmin(userId: string, targetUserId: string) {
  await assertAdmin(userId);
  const { error } = await supabaseAdmin
    .from("user_roles").upsert(
      { user_id: targetUserId, role: "admin" },
      { onConflict: "user_id,role" }
    );
  if (error) throw new Error(error.message);
  return { ok: true };
}

/* ────────────── WORKS (portfolio) ────────────── */

export async function getWorks() {
  const { data } = await supabaseAdmin.from("works").select("*").order("display_order");
  return data ?? [];
}

export async function getFeaturedWorks() {
  const { data } = await supabaseAdmin
    .from("works").select("*").eq("is_featured", true).order("display_order").limit(6);
  return data ?? [];
}

export async function upsertWork(userId: string, data: any) {
  await assertAdmin(userId);
  const parsed = z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(1).max(200),
    description: z.string().max(4000).optional().nullable(),
    category: z.string().max(120).optional().nullable(),
    cover_image: z.string().url().max(800).optional().nullable(),
    images: z.array(z.string()).optional().default([]),
    video_url: z.string().max(800).optional().nullable(),
    client_name: z.string().max(200).optional().nullable(),
    completion_date: z.string().optional().nullable(),
    is_featured: z.boolean().default(false),
    display_order: z.number().int().min(0).default(0),
  }).parse(data);
  const { error } = parsed.id
    ? await supabaseAdmin.from("works").update(parsed).eq("id", parsed.id)
    : await supabaseAdmin.from("works").insert(parsed);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function deleteWork(userId: string, id: string) {
  await assertAdmin(userId);
  const { error } = await supabaseAdmin.from("works").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

/* ────────────── TEAM (employees) ────────────── */

export async function getTeam() {
  const { data } = await supabaseAdmin.from("team").select("*").order("display_order");
  return data ?? [];
}

export async function upsertTeamMember(userId: string, data: any) {
  await assertAdmin(userId);
  const parsed = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1).max(200),
    role: z.string().max(200).optional().nullable(),
    bio: z.string().max(2000).optional().nullable(),
    image: z.string().url().max(800).optional().nullable(),
    display_order: z.number().int().min(0).default(0),
  }).parse(data);
  const { error } = parsed.id
    ? await supabaseAdmin.from("team").update(parsed).eq("id", parsed.id)
    : await supabaseAdmin.from("team").insert(parsed);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function deleteTeamMember(userId: string, id: string) {
  await assertAdmin(userId);
  const { error } = await supabaseAdmin.from("team").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

/* ────────────── VIDEOS ────────────── */

export async function getVideos() {
  const { data } = await supabaseAdmin.from("videos").select("*").order("display_order");
  return data ?? [];
}

export async function getFeaturedVideos() {
  const { data } = await supabaseAdmin
    .from("videos").select("*").eq("is_featured", true).order("display_order").limit(6);
  return data ?? [];
}

export async function upsertVideo(userId: string, data: any) {
  await assertAdmin(userId);
  const parsed = z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional().nullable(),
    url: z.string().min(1).max(800),
    thumbnail: z.string().url().max(800).optional().nullable(),
    category: z.string().max(120).optional().nullable(),
    is_featured: z.boolean().default(false),
    display_order: z.number().int().min(0).default(0),
  }).parse(data);
  const { error } = parsed.id
    ? await supabaseAdmin.from("videos").update(parsed).eq("id", parsed.id)
    : await supabaseAdmin.from("videos").insert(parsed);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function deleteVideo(userId: string, id: string) {
  await assertAdmin(userId);
  const { error } = await supabaseAdmin.from("videos").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}
