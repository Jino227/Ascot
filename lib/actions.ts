"use server";

import { supabaseAdmin } from "@/integrations/supabase/server";
import { z } from "zod";

/* ────────────── PUBLIC READS ────────────── */

function normalizeSupabaseSchemaError(error: any, fallbackMessage: string) {
  const message = String(error?.message ?? "");
  if (/could not find the table|schema cache/i.test(message)) {
    return `Supabase schema is out of sync. Run supabase/migrations/20260724100000_repair_premium_client_schema.sql in the Supabase SQL editor, then retry. Original error: ${message}`;
  }
  return fallbackMessage;
}

export async function getWebsiteContent() {
  const { data, error } = await supabaseAdmin.from("website_content").select("*");
  if (error) throw new Error(error.message);
  const map: Record<string, any> = {};
  for (const row of (data ?? []) as any[]) map[row.section_key] = row.content;
  return map;
}

export async function getCollections(opts?: { includePrivate?: boolean; userId?: string }) {
  let q = supabaseAdmin.from("collections").select("*").order("display_order");
  if (!opts?.includePrivate && !opts?.userId) q = q.eq("is_public", true);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  const collections = data ?? [];
  const collectionIds = collections.map((collection: any) => collection.id);
  const { data: imageRows, error: imageError } = collectionIds.length
    ? await supabaseAdmin.from("collection_images").select("*").in("collection_id", collectionIds).order("display_order")
    : { data: [], error: null };
  if (imageError) throw new Error(imageError.message);
  const imagesByCollection = new Map<string, any[]>();
  for (const image of imageRows ?? []) {
    const images = imagesByCollection.get(image.collection_id) ?? [];
    images.push(image);
    imagesByCollection.set(image.collection_id, images);
  }
  const withImages = collections.map((collection: any) => ({
    ...collection,
    collection_images: imagesByCollection.get(collection.id) ?? [],
  }));
  if (opts?.userId) {
    const { data: clientData } = await supabaseAdmin
      .from("clients").select("id").eq("user_id", opts.userId).eq("is_active", true).maybeSingle();
    if (clientData) {
      const { data: assigned } = await supabaseAdmin
        .from("collection_clients").select("collection_id").eq("client_id", clientData.id);
      const assignedIds = new Set((assigned ?? []).map((a: any) => a.collection_id));
      return withImages.filter((c: any) => c.is_public || assignedIds.has(c.id)).map((c: any) => ({
        ...c,
        collection_images: c.collection_images?.filter((img: any) =>
          !img.is_private || assignedIds.has(c.id)
        ) ?? [],
      }));
    }
    return withImages.filter((c: any) => c.is_public).map((c: any) => ({
      ...c,
      collection_images: c.collection_images?.filter((img: any) => !img.is_private) ?? [],
    }));
  }
  return withImages.map((c: any) => ({
    ...c,
    collection_images: c.collection_images?.filter((img: any) => !img.is_private) ?? [],
  }));
}

export async function getCollectionBySlug(slug: string, userId?: string) {
  const { data: collection } = await supabaseAdmin
    .from("collections").select("*").eq("slug", slug).maybeSingle();
  if (!collection) return null;
  const { data: collectionImages, error: imageError } = await supabaseAdmin
    .from("collection_images").select("*").eq("collection_id", collection.id).order("display_order");
  if (imageError) throw new Error(imageError.message);
  let images = collectionImages ?? [];
  const privateImageCount = images.filter((img: any) => img.is_private).length;
  let hasPrivateAccess = false;
  if (!collection.is_public && !userId) return null;
  if (!userId) {
    images = images.filter((img: any) => !img.is_private);
  } else {
    const { data: clientData } = await supabaseAdmin
      .from("clients").select("id").eq("user_id", userId).eq("is_active", true).maybeSingle();
    const isAdmin = await checkIsAdmin(userId);
    if (!isAdmin.isAdmin && !clientData && !collection.is_public) return null;
    if (isAdmin.isAdmin) {
      hasPrivateAccess = true;
    } else if (clientData) {
      const { data: assigned } = await supabaseAdmin
        .from("collection_clients").select("collection_id").eq("client_id", clientData.id);
      const assignedIds = new Set((assigned ?? []).map((a: any) => a.collection_id));
      if (!collection.is_public && !assignedIds.has(collection.id)) return null;
      hasPrivateAccess = assignedIds.has(collection.id);
      images = images.filter((img: any) => !img.is_private || assignedIds.has(collection.id));
    } else if (!isAdmin.isAdmin) {
      images = images.filter((img: any) => !img.is_private);
    }
  }
  return { ...collection, collection_images: images, private_image_count: privateImageCount, has_private_access: hasPrivateAccess };
}

export async function getFeaturedProducts() {
  const { data } = await supabaseAdmin
    .from("products").select("*, product_images(*)")
    .eq("is_public", true).eq("is_featured", true)
    .order("display_order").limit(6);
  return data ?? [];
}

export async function getFeaturedCollections() {
  const { data } = await supabaseAdmin
    .from("collections").select("*")
    .eq("is_public", true).order("display_order").limit(6);
  const collections = data ?? [];
  const ids = collections.map((collection: any) => collection.id);
  const { data: images } = ids.length
    ? await supabaseAdmin.from("collection_images").select("*").in("collection_id", ids).order("display_order")
    : { data: [] };
  return collections.map((collection: any) => ({
    ...collection,
    collection_images: (images ?? []).filter((image: any) => image.collection_id === collection.id),
  }));
}

export async function getJourneySteps() {
  const { data } = await supabaseAdmin
    .from("journey_steps").select("*").eq("is_published", true).order("step_order");
  return data ?? [];
}

export async function getAllCollectionsWithProducts() {
  const { data: collections } = await supabaseAdmin
    .from("collections").select("*").order("display_order");
  const { data: allProducts } = await supabaseAdmin
    .from("products").select("*, product_images(*)").order("display_order");
  const byColl: Record<string, any[]> = {};
  for (const p of allProducts ?? []) {
    const cid = p.collection_id;
    if (cid == null) continue;
    if (!byColl[cid]) byColl[cid] = [];
    byColl[cid].push(p);
  }
  return (collections ?? []).map((c) => ({ ...c, products: byColl[c.id] ?? [] }));
}

export async function getPublicDesigns(limit?: number) {
  const q = supabaseAdmin
    .from("designs")
    .select("id, url, alt, is_private, display_order, created_at")
    .eq("is_private", false)
    .order("display_order")
    .order("created_at");
  const { data } = limit ? await q.limit(limit) : await q;
  return data ?? [];
}

export async function getDesignsForUser(userId: string) {
  const { data } = await supabaseAdmin
    .from("designs")
    .select("id, url, alt, is_private, display_order, created_at")
    .order("display_order")
    .order("created_at");
  return data ?? [];
}

export async function getDesignsAdmin(userId: string) {
  await assertAdmin(userId);
  const { data } = await supabaseAdmin
    .from("designs")
    .select("*")
    .order("display_order")
    .order("created_at");
  return data ?? [];
}

export async function upsertDesign(userId: string, data: {
  id?: string; url: string; alt?: string; is_private: boolean; display_order: number;
}) {
  await assertAdmin(userId);
  const parsed = z.object({
    id: z.string().uuid().optional(),
    url: z.string().min(1).max(800),
    alt: z.string().max(400).optional().nullable(),
    is_private: z.boolean(),
    display_order: z.number().int().min(0).default(0),
  }).parse(data);
  
  const { error } = parsed.id
    ? await supabaseAdmin.from("designs").update({ ...parsed, uploaded_by: userId }).eq("id", parsed.id)
    : await supabaseAdmin.from("designs").insert({ ...parsed, uploaded_by: userId });
    
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function deleteDesign(userId: string, id: string) {
  await assertAdmin(userId);
  const { error } = await supabaseAdmin.from("designs").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function uploadDesignImage(userId: string, formData: FormData) {
  await assertAdmin(userId);
  const file = formData.get("file") as File | null;
  if (!file) throw new Error("No file provided");
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `designs/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = new Uint8Array(await file.arrayBuffer());
  const { error } = await supabaseAdmin.storage
    .from("media")
    .upload(path, buffer, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  const { data: urlData } = supabaseAdmin.storage.from("media").getPublicUrl(path);
  return { ok: true, url: urlData.publicUrl };
}

export async function getPublicDesignImages(limit?: number) {
  const q = supabaseAdmin
    .from("collection_images")
    .select("id, url, alt, display_order, collection_id, collections!inner(name, slug, is_public)")
    .eq("is_private", false)
    .order("display_order");
  const { data } = limit ? await q.limit(limit) : await q;
  return ((data ?? []) as any[]).filter((img: any) => img.collections?.is_public === true);
}

export async function getDesignImagesForUser(userId: string) {
  const { isAdmin } = await checkIsAdmin(userId);
  if (isAdmin) {
    const { data } = await supabaseAdmin
      .from("collection_images")
      .select("id, url, alt, is_private, display_order, collection_id, collections!inner(name, slug, is_public)")
      .order("display_order");
    return data ?? [];
  }
  const { data: clientData } = await supabaseAdmin
    .from("clients").select("id").eq("user_id", userId).eq("is_active", true).maybeSingle();
  if (clientData) {
    const { data: assigned } = await supabaseAdmin
      .from("collection_clients").select("collection_id").eq("client_id", clientData.id);
    const assignedIds = new Set((assigned ?? []).map((a: any) => a.collection_id));
    const { data } = await supabaseAdmin
      .from("collection_images")
      .select("id, url, alt, is_private, display_order, collection_id, collections!inner(name, slug, is_public)")
      .order("display_order");
    return ((data ?? []) as any[]).filter((img: any) => {
      if (!img.collections?.is_public && !assignedIds.has(img.collection_id)) return false;
      if (img.is_private && !assignedIds.has(img.collection_id)) return false;
      return true;
    });
  }
  return getPublicDesignImages();
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
    .from("user_roles").select("role").eq("user_id", userId)
    .eq("role", "admin").maybeSingle();
  return { isAdmin: !!data };
}

export async function checkIsClient(userId: string) {
  const { data } = await supabaseAdmin
    .from("clients").select("id").eq("user_id", userId).eq("is_active", true).maybeSingle();
  return { isClient: !!data, clientId: data?.id ?? null };
}

export async function getAllCollectionsAuthed(userId: string) {
  const { data: client } = await supabaseAdmin
    .from("clients").select("is_active").eq("user_id", userId).maybeSingle();
  if (client && !client.is_active) throw new Error("Account disabled. Contact the Ascot team.");
  return getCollections({ userId });
}

/* ────────────── ADMIN ────────────── */

async function assertAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Error("Forbidden: admin required");
}

export async function assertAdminRole(userId: string) {
  await assertAdmin(userId);
  return true;
}

/* Collections */
const collectionSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(200),
  description: z.string().max(4000).optional().nullable(),
  cover_image: z.string().max(800).optional().nullable(),
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

/* Collection Images */
export async function upsertCollectionImage(userId: string, data: {
  id?: string; collection_id: string; url: string; alt?: string; is_private: boolean; display_order: number;
}) {
  await assertAdmin(userId);
  const { error } = data.id
    ? await supabaseAdmin.from("collection_images").update(data).eq("id", data.id)
    : await supabaseAdmin.from("collection_images").insert(data);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function deleteCollectionImage(userId: string, id: string) {
  await assertAdmin(userId);
  const { error } = await supabaseAdmin.from("collection_images").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

/* Collection-Client assignment */
export async function assignCollectionToClient(userId: string, collectionId: string, clientId: string) {
  await assertAdmin(userId);
  const { error } = await supabaseAdmin.from("collection_clients").upsert(
    { collection_id: collectionId, client_id: clientId },
    { onConflict: "collection_id,client_id" }
  );
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function unassignCollectionFromClient(userId: string, collectionId: string, clientId: string) {
  await assertAdmin(userId);
  const { error } = await supabaseAdmin.from("collection_clients").delete()
    .eq("collection_id", collectionId).eq("client_id", clientId);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function getCollectionClients(userId: string) {
  await assertAdmin(userId);
  const { data } = await supabaseAdmin.from("collection_clients").select("*, clients(*)");
  return data ?? [];
}

/* Journey Steps */
export async function getJourneyStepsAdmin(userId: string) {
  await assertAdmin(userId);
  const { data } = await supabaseAdmin.from("journey_steps").select("*").order("step_order");
  return data ?? [];
}

export async function uploadJourneyImage(userId: string, formData: FormData) {
  await assertAdmin(userId);
  const file = formData.get("file") as File | null;
  if (!file) throw new Error("No file provided");
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `journey/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = new Uint8Array(await file.arrayBuffer());
  const { error } = await supabaseAdmin.storage
    .from("media")
    .upload(path, buffer, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  const { data: urlData } = supabaseAdmin.storage.from("media").getPublicUrl(path);
  return { ok: true, url: urlData.publicUrl };
}

export async function upsertJourneyStep(userId: string, data: {
  id?: string; title: string; subtitle?: string; description: string; image?: string; step_order: number; is_published: boolean;
}) {
  await assertAdmin(userId);
  const parsed = z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(1).max(200),
    subtitle: z.string().max(300).optional(),
    description: z.string().min(1).max(4000),
    image: z.string().max(800).optional(),
    step_order: z.number().int().min(0),
    is_published: z.boolean().default(true),
  }).parse(data);
  const { error } = parsed.id
    ? await supabaseAdmin.from("journey_steps").update(parsed).eq("id", parsed.id)
    : await supabaseAdmin.from("journey_steps").insert(parsed);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function deleteJourneyStep(userId: string, id: string) {
  await assertAdmin(userId);
  const { error } = await supabaseAdmin.from("journey_steps").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

/* Products */
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
  image_urls: z.array(z.string().max(800)).max(20).optional(),
});

export async function upsertProduct(userId: string, data: any) {
  await assertAdmin(userId);
  const parsed = productSchema.parse(data);
  const { image_urls, ...row } = parsed;
  let productId = parsed.id;
  if (productId) {
    await supabaseAdmin.from("products").update(row).eq("id", productId);
  } else {
    const { data: ins, error } = await supabaseAdmin.from("products").insert(row).select("id").single();
    if (error || !ins) throw new Error(error?.message ?? "Unable to create product");
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
  const { data } = await supabaseAdmin
    .from("products").select("*, product_images(*), collections(name,slug)")
    .order("created_at", { ascending: false });
  return data ?? [];
}

/* Content */
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
  await supabaseAdmin.from("user_roles").upsert(
    { user_id: targetUserId, role: "admin" }, { onConflict: "user_id,role" }
  );
  return { ok: true };
}

export async function listClients(userId: string) {
  await assertAdmin(userId);
  const { data: clients, error: clientError } = await supabaseAdmin
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });
  if (clientError) throw new Error(normalizeSupabaseSchemaError(clientError, clientError.message));

  const userIds = [...new Set((clients ?? []).map((client: any) => client.user_id).filter(Boolean))];
  const profilesByUserId = new Map<string, { full_name?: string | null; email?: string | null }>();

  if (userIds.length) {
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);
    if (profileError) throw new Error(profileError.message);

    for (const profile of profiles ?? []) {
      profilesByUserId.set(profile.id, profile);
    }
  }

  return (clients ?? []).map((client: any) => ({
    ...client,
    profiles: profilesByUserId.get(client.user_id) ?? null,
  }));
}

export async function createClientAccount(adminUserId: string, data: {
  email: string;
  password: string;
  company_name?: string;
  contact_person?: string;
  phone?: string;
}) {
  await assertAdmin(adminUserId);
  const parsed = z.object({
    email: z.string().email().max(200),
    password: z.string().min(8).max(128),
    company_name: z.string().max(200).optional(),
    contact_person: z.string().max(200).optional(),
    phone: z.string().max(40).optional(),
  }).parse(data);

  const { data: created, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: parsed.email,
    password: parsed.password,
    email_confirm: true,
    user_metadata: { full_name: parsed.contact_person ?? parsed.company_name ?? parsed.email },
  });
  if (authError || !created.user) throw new Error(authError?.message ?? "Unable to create client login");

  const { error: clientError } = await supabaseAdmin.from("clients").insert({
    user_id: created.user.id,
    company_name: parsed.company_name,
    contact_person: parsed.contact_person,
    email: parsed.email,
    phone: parsed.phone,
    is_active: true,
  });
  if (clientError) {
    await supabaseAdmin.auth.admin.deleteUser(created.user.id);
    throw new Error(normalizeSupabaseSchemaError(clientError, clientError.message));
  }

  const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
    id: created.user.id,
    full_name: parsed.contact_person ?? parsed.company_name ?? parsed.email,
    email: parsed.email,
  }, { onConflict: "id" });
  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(created.user.id);
    throw new Error(profileError.message);
  }

  await supabaseAdmin.from("user_roles").upsert(
    { user_id: created.user.id, role: "client" },
    { onConflict: "user_id,role" },
  );
  return { ok: true, userId: created.user.id };
}

export async function createAdminAccount(adminUserId: string, data: {
  email: string;
  password: string;
  name?: string;
}) {
  await assertAdmin(adminUserId);
  const parsed = z.object({
    email: z.string().email().max(200),
    password: z.string().min(8).max(128),
    name: z.string().max(200).optional(),
  }).parse(data);

  const { data: created, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: parsed.email,
    password: parsed.password,
    email_confirm: true,
    user_metadata: { full_name: parsed.name ?? parsed.email },
  });
  if (authError || !created.user) throw new Error(authError?.message ?? "Unable to create admin");

  await supabaseAdmin.from("user_roles").upsert(
    { user_id: created.user.id, role: "admin" },
    { onConflict: "user_id,role" },
  );
  return { ok: true, userId: created.user.id };
}

export async function setClientAccountStatus(adminUserId: string, clientId: string, enabled: boolean) {
  await assertAdmin(adminUserId);
  const { data: client, error: clientLookupError } = await supabaseAdmin
    .from("clients").select("user_id").eq("id", clientId).single();
  if (clientLookupError || !client) throw new Error(clientLookupError?.message ?? "Client not found");

  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(client.user_id, {
    ban_duration: enabled ? "none" : "876000h",
  });
  if (authError) throw new Error(authError.message);

  const { error } = await supabaseAdmin.from("clients").update({ is_active: enabled }).eq("id", clientId);
  if (error) throw new Error(normalizeSupabaseSchemaError(error, error.message));
  return { ok: true };
}

export async function upsertClient(userId: string, data: any) {
  await assertAdmin(userId);
  const parsed = z.object({
    id: z.string().uuid().optional(),
    user_id: z.string().uuid(),
    company_name: z.string().max(200).optional(),
    contact_person: z.string().max(200).optional(),
    email: z.string().max(200).optional(),
    phone: z.string().max(40).optional(),
    is_active: z.boolean().default(true),
  }).parse(data);
  const { error } = parsed.id
    ? await supabaseAdmin.from("clients").update(parsed).eq("id", parsed.id)
    : await supabaseAdmin.from("clients").insert(parsed);
  if (error) throw new Error(normalizeSupabaseSchemaError(error, error.message));
  return { ok: true };
}

export async function deleteClient(userId: string, id: string) {
  await assertAdmin(userId);
  const { error } = await supabaseAdmin.from("clients").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

/* Works */
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
    cover_image: z.string().max(800).optional().nullable(),
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

/* Team */
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
    image: z.string().max(800).optional().nullable(),
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

/* Videos */
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
    thumbnail: z.string().max(800).optional().nullable(),
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

/* Hero Media Upload */
export async function uploadHeroMedia(userId: string, formData: FormData) {
  await assertAdmin(userId);
  const file = formData.get("file") as File | null;
  if (!file) throw new Error("No file provided");

  const ext = file.name.split(".").pop() ?? "bin";
  const path = `hero/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { error } = await supabaseAdmin.storage
    .from("media")
    .upload(path, buffer, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);

  const { data: urlData } = supabaseAdmin.storage.from("media").getPublicUrl(path);
  return { ok: true, url: urlData.publicUrl };
}

/* Activity log */
export async function logActivity(userId: string, action: string, entity?: string, entityId?: string, metadata?: any) {
  await supabaseAdmin.from("activity_logs").insert({
    user_id: userId, action, entity, entity_id: entityId, metadata,
  });
}

export async function getActivityLogs(userId: string) {
  await assertAdmin(userId);
  const { data } = await supabaseAdmin.from("activity_logs")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false }).limit(100);
  return data ?? [];
}

/* Celebrity Showcase */
export async function getPublicCelebrities() {
  const { data } = await supabaseAdmin
    .from("celebrity_showcase")
    .select("*")
    .eq("is_published", true)
    .order("display_order")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getCelebritiesAdmin(userId: string) {
  await assertAdmin(userId);
  const { data } = await supabaseAdmin
    .from("celebrity_showcase")
    .select("*")
    .order("display_order")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function uploadCelebrityImage(userId: string, formData: FormData) {
  await assertAdmin(userId);
  const file = formData.get("file") as File | null;
  if (!file) throw new Error("No file provided");
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `celebrities/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = new Uint8Array(await file.arrayBuffer());
  const { error } = await supabaseAdmin.storage
    .from("media")
    .upload(path, buffer, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  const { data: urlData } = supabaseAdmin.storage.from("media").getPublicUrl(path);
  return { ok: true, url: urlData.publicUrl };
}

export async function upsertCelebrity(userId: string, data: {
  id?: string; name: string; description?: string; image: string; display_order: number; is_published: boolean;
}) {
  await assertAdmin(userId);
  const parsed = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1).max(200),
    description: z.string().max(800).optional().nullable(),
    image: z.string().url().max(800),
    display_order: z.number().int().default(0),
    is_published: z.boolean().default(true),
  }).parse(data);

  const { error } = parsed.id
    ? await supabaseAdmin.from("celebrity_showcase").update(parsed).eq("id", parsed.id)
    : await supabaseAdmin.from("celebrity_showcase").insert(parsed);
    
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function deleteCelebrity(userId: string, id: string) {
  await assertAdmin(userId);
  const { error } = await supabaseAdmin.from("celebrity_showcase").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

