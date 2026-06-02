
# Premium Textile Manufacturing Platform

Stack note: building on the project's existing stack — TanStack Start (React 19 + Vite), Tailwind v4, ShadCN UI, Motion for React (Framer Motion successor, same API), and Lovable Cloud (Supabase under the hood). All your feature requirements are preserved; only the framework differs from your Next.js spec.

## 1. Backend (Lovable Cloud)

Enable Lovable Cloud, then create these tables with RLS:

- **profiles** — `id (uuid, FK auth.users)`, `full_name`, `avatar_url`, `created_at`. Auto-created via trigger on signup.
- **user_roles** — `id`, `user_id`, `role` (enum: `admin`, `user`). Separate table + `has_role()` security-definer function (avoids recursion, prevents privilege escalation).
- **collections** — `id`, `slug`, `name`, `description`, `cover_image`, `is_public` (bool), `display_order`, `created_at`.
- **products** — `id`, `collection_id` (FK), `name`, `slug`, `description`, `composition`, `weight_gsm`, `width_cm`, `is_public`, `display_order`.
- **product_images** — `id`, `product_id` (FK), `url`, `alt`, `display_order`.
- **website_content** — `id`, `section_key` (unique: `hero`, `about`, `manufacturing`, `contact`, etc.), `content` (jsonb), `updated_at`.
- **inquiries** — `id`, `name`, `email`, `phone`, `company`, `message`, `created_at`, `status`.

Storage bucket: `collections` (public) for collection/product/hero images.

RLS summary:
- Public read on `collections`/`products` only where `is_public=true`.
- Authenticated read on all `collections`/`products`.
- Admin-only write (insert/update/delete) on all content tables via `has_role(auth.uid(), 'admin')`.
- `profiles`: users read/update own; admins read all.
- `inquiries`: anyone insert; admins read.
- `website_content`: public read, admin write.

## 2. Routes (TanStack Start, file-based)

```
src/routes/
  __root.tsx                       Header + Footer + providers
  index.tsx                        Home (all sections)
  about.tsx
  collections.index.tsx            Grid of collections
  collections.$slug.tsx            Collection detail + products
  contact.tsx
  auth.tsx                         Combined login/register tabs
  _authenticated/
    route.tsx                      Integration-managed gate
    private-collections.tsx        Auth-only collections view
    admin/
      route.tsx                    Admin gate (has_role check)
      index.tsx                    Dashboard overview
      collections.tsx              CRUD collections
      products.tsx                 CRUD products + image upload
      content.tsx                  Edit website_content sections
      users.tsx                    View registered users + inquiries
```

Each public route gets its own `head()` with unique title/description/og tags.

## 3. Home Page Sections (single index route)

Hero Banner → About Company → Featured Collections → Manufacturing Excellence → Featured Products → Testimonials → Contact CTA. All content sourced from `website_content` so admin can edit. Motion-driven fade/slide/stagger reveals on scroll.

## 4. Auth

Lovable Cloud email/password + Google sign-in (via Lovable broker). Profiles auto-created. First registered user can be seeded as admin via SQL migration; subsequent admin promotion via SQL.

## 5. Admin Dashboard

- Collections: list, create, edit, delete; toggle public/private; reorder.
- Products: per-collection CRUD; multi-image upload to Storage; public/private toggle.
- Website content: form-based editor per section (hero headline/sub/cta, about text, manufacturing bullets, contact info).
- Users: read-only list (id, email, name, joined date) via admin server fn using `supabaseAdmin`.
- Inquiries: read + status update.

## 6. Design & UX

Luxury textile aesthetic: warm neutral palette (cream/ivory/charcoal with brass accent), serif display + clean sans body, generous whitespace, large editorial imagery, subtle grain/texture. Mobile-first. Motion for React for hero reveal, section scroll-in, collection card hover lift, image parallax. All colors as semantic tokens in `src/styles.css`.

## Technical Details

- Server functions (`createServerFn`) for all data reads/writes; admin-only ones use `requireSupabaseAuth` + `has_role` check inside handler.
- Public collection/product reads use `supabaseAdmin` inside server fn with `WHERE is_public=true` (so public route loaders don't 401 during SSR).
- Authenticated private-collections route lives under `_authenticated/` and uses `requireSupabaseAuth` middleware.
- TanStack Query for caching: `ensureQueryData` in loaders, `useSuspenseQuery` in components.
- `<img loading="lazy">` with Supabase Storage URLs (Next/Image not available; equivalent lazy + responsive `srcset` pattern used).
- All input validated with Zod in server fns.
- Tailwind v4 tokens in `src/styles.css` (oklch).
- Install: `motion`, `zod` (likely already present).

## Build Order

1. Enable Lovable Cloud + migrations (tables, RLS, roles, trigger, storage bucket, seed website_content + sample collections).
2. Design tokens + shared Header/Footer + Motion wrappers.
3. Public pages (Home, About, Collections list/detail, Contact).
4. Auth page + integration-managed `_authenticated` layout.
5. Admin dashboard (collections, products + uploads, content, users, inquiries).
6. Polish: animations, responsive QA, SEO meta per route.
