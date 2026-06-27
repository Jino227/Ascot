# Ascot Fashions — User Guide

> A bespoke clothing brand website with member-exclusive content and an admin panel.

---

## 1. Public Visitor (no account)

Anyone can browse the public site without signing in:

| Page | What you see |
|---|---|
| **Home** (`/`) | Hero banner, about section, public collections with products, featured pieces, process pillars, testimonials, contact CTA |
| **About** (`/about`) | Brand story with stats (years of craft, master tailors, garments crafted) |
| **Contact** (`/contact`) | Contact details (address, email, phone) + inquiry form to send a message |
| **Sign in** (`/auth`) | Log in with email/password or Google |

Collections marked **"Members Exclusive"** are visible but dimmed — you'll be prompted to sign in to view them.

---

## 2. Registered User / Member

After signing up at `/register` and signing in at `/auth`, you get access to:

- **Private Collections** (`/private-collections`) — all collections including exclusive member-only archives
- **Exclusive Pieces** section on the home page — premium products with "Exclusive" badges
- **Members Only** section on the home page — curated garments only available to members
- Collections marked "Members Exclusive" become fully visible with product details

**How to sign up:**
1. Go to `/register`
2. Enter your name, email, and password
3. Check your email for a verification link (if email confirmation is enabled)
4. Sign in at `/auth`

**How to sign in:**
- Use email/password, or click "Continue with Google"
- Once signed in, the header shows "Members", "Admin" (if applicable), and "Sign out"

---

## 3. Admin User

Admins have full CRUD access to all site content. After signing in, click **Admin** in the header to open the admin panel at `/admin`.

### Admin Dashboard (`/admin`)
Overview cards linking to each admin section.

### Collections (`/admin/collections`)
Manage product collections:
- **Create** — click "New collection", set name, slug, description, cover image, public/private toggle, display order
- **Edit** — click the pencil icon on any collection
- **Delete** — click the trash icon (asks for confirmation)
- Private collections are hidden from public visitors but visible to members

### Products (`/admin/products`)
Manage products within collections:
- **Create** — requires at least one collection to exist first
- **Edit** — change name, slug, description, composition, weight/width specs, public/featured toggles, order, and images
- **Delete** — click the trash icon
- Upload multiple images per product
- Mark products as **Featured** to show them in the "Featured pieces" section on the home page

### Website Content (`/admin/content`)
Edit all site text as JSON. Sections available:

| Section | Controls | Used on |
|---|---|---|
| `hero` | Eyebrow, title, subtitle, CTA, hero image | Home page hero |
| `about` | Eyebrow, title, body text | Home page about section |
| `process` | Eyebrow, title, pillars (icon, title, body) | Home page process section |
| `testimonials` | Array of quote/name/role objects | Home page testimonials |
| `contact` | Eyebrow, title, body, address, email, phone | Home contact CTA + `/contact` page |
| `about_page` | Title, subtitle, image, body paragraphs, stats | `/about` page |
| `footer` | Description, address, email, phone, copyright | Site footer |

Edit any section as plain JSON and click "Save {section}" — changes appear immediately on the live site.

### Users (`/admin/users`)
View all registered users and their roles. Click **"Make admin"** to promote a user to admin.

### Inquiries (`/admin/inquiries`)
View messages submitted via the contact form, sorted newest first.

---

## 4. Demo Data

If no database content exists yet, the site displays built-in demo data (Unsplash images, sample text, example collections/products) so the site looks complete out of the box. Once you add real content via the admin panel, demo data is automatically replaced.

---

## 5. Common Tasks

**Change the hero image:**
1. Go to `/admin/content`
2. Find the `hero` section
3. Set `"image"` to a public image URL (or use the Upload button in collections/products to get one)
4. Click "Save hero"

**Make a collection members-only:**
1. Go to `/admin/collections`
2. Edit the collection
3. Toggle "Public" OFF
4. Save — the collection will now show "Members Exclusive" and require sign-in

**Add a testimonial:**
1. Go to `/admin/content`
2. Find the `testimonials` section
3. Add an object to the `items` array: `{"quote": "...", "name": "...", "role": "..."}`
4. Save
