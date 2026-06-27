# Ascot Fashions — Developer Guide

> Next.js 15 project with Supabase, Tailwind CSS v4, motion, and TanStack Query.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + `tw-animate-css` |
| Animation | `motion` (framer-motion fork) |
| Data fetching | `@tanstack/react-query` |
| Backend | Supabase (Postgres, Auth, Storage) |
| Server logic | Next.js Server Actions (`"use server"`) |
| UI library | shadcn/ui (Radix primitives) |
| Fonts | Cormorant Garamond (display), Inter (sans) |
| Smooth scroll | Lenis |

---

## Project Structure

```
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (fonts, providers, header, footer)
│   ├── not-found.tsx             # 404 page
│   ├── page.tsx                  # Home page (hero, about, collections, process, featured, testimonials, contact)
│   ├── about/page.tsx            # About page
│   ├── contact/page.tsx          # Contact page + inquiry form
│   ├── auth/page.tsx             # Sign-in page (email/password + Google OAuth)
│   ├── register/page.tsx         # Registration page
│   ├── private-collections/      # Member-only collections page (auth required)
│   │   └── page.tsx
│   └── admin/                    # Admin panel (auth + admin role required)
│       ├── layout.tsx            # Admin shell (permission check + tab navigation)
│       ├── page.tsx              # Admin dashboard overview
│       ├── collections/page.tsx  # CRUD collections
│       ├── products/page.tsx     # CRUD products with images
│       ├── content/page.tsx      # JSON editor for website sections
│       ├── inquiries/page.tsx    # View contact form submissions
│       └── users/page.tsx        # View/promote users
├── components/
│   ├── layout/                   # Shared layout components
│   │   ├── SiteHeader.tsx        # Sticky nav with auth-aware links
│   │   ├── SiteFooter.tsx        # Footer with dynamic content
│   │   ├── Reveal.tsx            # Scroll-reveal animation wrapper
│   │   ├── ImageReveal.tsx       # Image with skeleton + hover zoom
│   │   ├── Lightbox.tsx          # Image lightbox (yet-another-react-lightbox)
│   │   ├── Masonry.tsx           # CSS columns masonry layout
│   │   └── SmoothScroll.tsx      # Lenis smooth scroll
│   └── ui/                       # 47 shadcn/ui components (buttons, inputs, dialogs, etc.)
├── hooks/
│   ├── use-auth.ts               # Auth state (session, user, loading)
│   └── use-mobile.tsx            # Mobile breakpoint detection
├── integrations/
│   └── supabase/
│       ├── client.ts             # Browser-side Supabase client (anon key)
│       ├── server.ts             # Server-only Supabase client (service role key)
│       └── types.ts              # Database type definitions
├── lib/
│   ├── actions.ts                # All server actions (public reads, auth reads, admin CRUD)
│   └── utils.ts                  # cn() utility (clsx + tailwind-merge)
├── styles/
│   └── globals.css               # Tailwind v4 CSS config + theme variables
├── public/
│   └── favicon.svg               # Ascot "A" favicon
├── supabase/
│   ├── seed.sql                  # Full schema + seed content (run in Supabase SQL Editor)
│   └── storage.sql               # Storage bucket + RLS policies
├── docs/
│   ├── USERS.md                  # User guide
│   └── DEVELOPERS.md             # This file
├── .env.local                    # Environment variables (not committed)
├── next.config.ts                # Next.js config
├── package.json
├── postcss.config.mjs            # PostCSS with @tailwindcss/postcss
└── tsconfig.json                 # TypeScript config with @/ path alias
```

---

## Key Files Explained

### `lib/actions.ts` — All Server Actions

This is the single file containing every backend operation. Server Actions are Next.js functions with the `"use server"` directive that run on the server and can be called directly from client components.

**Categories:**

| Category | Functions | Auth required |
|---|---|---|
| Public reads | `getWebsiteContent`, `getCollections`, `getCollectionBySlug`, `getFeaturedProducts`, `getAllCollectionsWithProducts`, `getAllProductsWithImages` | No |
| Inquiries | `submitInquiry` | No (validated via Zod) |
| Auth reads | `checkIsAdmin(userId)`, `getAllCollectionsAuthed(userId)` | Yes (userId param) |
| Admin CRUD | `upsertCollection`, `deleteCollection`, `upsertProduct`, `deleteProduct`, `listAllProductsAdmin`, `upsertContent`, `listUsers`, `listInquiries`, `promoteToAdmin` | Yes (assertAdmin check inside) |

Admin functions call `assertAdmin(userId)` which looks up the user's role in `user_roles` table via the service-role Supabase client.

### `hooks/use-auth.ts` — Authentication

A React hook that subscribes to Supabase `onAuthStateChange` and exposes `{ session, user, loading }`. Uses `localStorage` for session persistence (same as Supabase default). Unlike Next.js middleware-based auth, this is purely client-side — the session lives in the browser.

### `app/layout.tsx` — Root Layout

Wraps every page with:
- Google Fonts (Cormorant Garamond + Inter)
- `<Providers>` — TanStack Query client + Sonner toaster
- `<SmoothScroll>` — Lenis smooth scrolling
- `<SiteHeader>` — Navigation bar
- `<main>` — Page content
- `<SiteFooter>` — Footer

### `app/admin/layout.tsx` — Admin Layout

Client component that:
1. Waits for `useAuth()` to resolve
2. Redirects to sign-in if no user
3. Calls `checkIsAdmin(user.id)` — shows "Admin access required" if not admin
4. Renders tab navigation + children

### `integrations/supabase/server.ts` — Service Role Client

Creates a Supabase admin client using the `SUPABASE_SERVICE_ROLE_KEY`. This bypasses RLS entirely — used for all server-side database operations. Never expose this to the client.

### `integrations/supabase/client.ts` — Browser Client

Creates a Supabase anon client using `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Used for:
- `supabase.auth.signInWithPassword()` / `signInWithOAuth()` / `signOut()`
- `supabase.auth.onAuthStateChange()`
- `supabase.storage.from("collections").upload()` — file uploads in ImageUpload

---

## Routing Overview

| Route | Type | Auth | Component |
|---|---|---|---|
| `/` | Public | None | `app/page.tsx` |
| `/about` | Public | None | `app/about/page.tsx` |
| `/contact` | Public | None | `app/contact/page.tsx` |
| `/auth` | Public | Redirects if logged in | `app/auth/page.tsx` |
| `/register` | Public | None | `app/register/page.tsx` |
| `/private-collections` | Protected | Must be signed in | `app/private-collections/page.tsx` |
| `/admin` | Protected | Must be admin | `app/admin/*` |

Protected pages check auth client-side using `useAuth()` — no Next.js middleware is involved. This keeps the auth model identical to the original TanStack Start version.

---

## Data Flow

1. **Page loads** → client component mounts → `useQuery` fires → calls server action → server action queries Supabase (service role) → returns data
2. **TanStack Query** caches the result and re-fetches when query keys change
3. **Admin mutations** (create/edit/delete) → call server action → invalidate relevant queries → UI updates automatically
4. **Demo data fallback**: Each page merges real data with defaults: `const data = { ...DEFAULTS, ...(realData ?? {}) }`

---

## Theme System

Colors are defined in `styles/globals.css` using CSS custom properties with OKLCH values:

- **Background**: Warm ivory (`oklch(0.978 0.012 84)`)
- **Foreground**: Deep charcoal (`oklch(0.22 0.012 60)`)
- **Accent**: Brass/gold (`oklch(0.66 0.105 75)`)

A `.dark` variant is included but not toggled by default. To enable dark mode, add the `dark` class to the `<html>` element.

Utility classes defined:
- `container-x` — centered max-width container with responsive padding
- `.font-display` — serif font for headings
- `hairline` — 1px top border with 12% foreground opacity

---

## Supabase Setup

### Database
Run `supabase/seed.sql` in the Supabase SQL Editor. It creates:
- Tables: `profiles`, `user_roles`, `collections`, `products`, `product_images`, `website_content`, `inquiries`
- Triggers: auto-create profile + user_role on signup, auto-update `updated_at`
- Functions: `has_role(uuid, app_role)`, `handle_new_user()`
- RLS policies on all tables
- Default website content (hero, about, process, etc.)

### Storage
Run `supabase/storage.sql` to:
- Create the `collections` bucket (public, 10MB limit, images only)
- Add RLS policies: public read, authenticated upload

### Auth
- Disable email confirmation in Supabase Dashboard → Auth → Providers → Email for development
- Google OAuth: configure in Supabase Dashboard → Auth → Providers → Google

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Adding a New Page

1. Create `app/route-name/page.tsx`
2. Add `"use client"` if you need hooks or interactivity
3. Use `useQuery` to fetch data from server actions
4. Add demo data fallback as default exports
5. Set `document.title` via `useEffect`
6. Add the link to `SiteHeader.tsx` if needed

To add a new admin section:
1. Create `app/admin/new-section/page.tsx`
2. Add the tab to `app/admin/layout.tsx`
3. Add the server action to `lib/actions.ts`

---

## Common Customizations

**Change colors:** Edit the `:root` CSS variables in `styles/globals.css`

**Add a new icon to process pillars:** Map the icon name in the home page's process section to a lucide-react icon

**Modify the home page layout:** Edit `app/page.tsx` — each section (hero, about, collections, process, featured, testimonials, contact) is a separate block

**Change font:** Update the Google Fonts link in `app/layout.tsx` and the `--font-display` / `--font-sans` theme variables in `styles/globals.css`

---

## Build & Deploy

```bash
npm run dev      # Development server
npm run build    # Production build
npm start        # Start production server
```

The project is a standard Next.js app — deploy to Vercel, Netlify, Railway, or any Node.js host. Set the four environment variables in your hosting dashboard.
