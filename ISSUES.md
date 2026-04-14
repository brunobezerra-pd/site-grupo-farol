# ISSUES — Grupo Farol Institutional Website

**Reference:** SPEC v1.2 / PRD v1.2  
**Implementation order:** sequential — each issue depends on the previous one.

---

## ISSUE 01 — Repository setup and base infrastructure

**Context:**  
Set up the project file structure as defined in the SPEC, install Tailwind standalone CLI, and ensure the environment is ready for development.

**Tasks:**
- Create folder structure per SPEC section 1 (`/admin`, `/api`, `/assets/css`, `/assets/js`, `/assets/fonts`, `/assets/images`)
- Create `tailwind.input.css` with `@tailwind base/components/utilities` directives, `@font-face` declarations for local fonts (SPEC section 3.1) and Google Fonts `@import` (SPEC section 3.2)
- Create `tailwind.config.js` with breakpoints, colors and font families defined in SPEC sections 4 and 5
- Create minimal `package.json` with `build:css` and `watch:css` scripts (SPEC section 5.4)
- Create `vercel.json` with rewrites, admin headers and cron configuration (SPEC section 13)
- Create `robots.txt` blocking `/admin/` (SPEC section 14)
- Create `.env.local.example` with all required environment variables (SPEC section 2) — no real values
- Create `.gitignore` ignoring `.env.local` and `node_modules`
- Run Tailwind build and confirm `assets/css/output.css` is generated without errors

**Acceptance criteria:**  
`assets/css/output.css` successfully generated. Folder structure matches SPEC. No real credentials committed.

---

## ISSUE 02 — Database schema on Supabase

**Context:**  
Create tables and storage buckets on Supabase as defined in the SPEC. This issue is executed manually on the Supabase dashboard, but the SPEC should generate ready-to-run SQL scripts.

**Tasks:**
- Generate complete SQL script for creating `content`, `creators` and `partners` tables (SPEC sections 8.1, 8.2, 8.3)
- Generate SQL seed script with initial values for the `content` table (all keys from SPEC with PT-BR placeholder values)
- Generate RLS (Row Level Security) script to run immediately after table creation:
  - Enable RLS on all three tables
  - Public read policy (`SELECT`) on all three tables — required for the public site
  - Authenticated write policy (`INSERT`, `UPDATE`, `DELETE`) on all three tables — only Supabase Auth users can write
  - Script must be a single block, safe to re-run (use `DROP POLICY IF EXISTS` before each `CREATE POLICY`)

```sql
-- Enable RLS
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Public read
DROP POLICY IF EXISTS "Public read" ON content;
DROP POLICY IF EXISTS "Public read" ON creators;
DROP POLICY IF EXISTS "Public read" ON partners;
CREATE POLICY "Public read" ON content FOR SELECT USING (true);
CREATE POLICY "Public read" ON creators FOR SELECT USING (true);
CREATE POLICY "Public read" ON partners FOR SELECT USING (true);

-- Authenticated write
DROP POLICY IF EXISTS "Auth write" ON content;
DROP POLICY IF EXISTS "Auth write" ON creators;
DROP POLICY IF EXISTS "Auth write" ON partners;
CREATE POLICY "Auth write" ON content FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write" ON creators FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write" ON partners FOR ALL USING (auth.role() = 'authenticated');
```

- Document in `README.md` instructions for:
  - Running the table creation script in Supabase SQL Editor
  - Running the RLS script immediately after (mandatory — without it the database is publicly writable)
  - Creating `creators` and `partners` buckets in Supabase Storage with public read access
  - Creating admin user via Supabase Auth dashboard
  - Configuring environment variables on Vercel

**Acceptance criteria:**  
SQL scripts ready to copy and paste into Supabase. RLS enabled and verified on all three tables (check via Supabase dashboard — tables should show the shield icon). README with clear setup instructions including RLS step as mandatory.

---

## ISSUE 03 — Serverless Function: `/api/content`

**Context:**  
Create read and write endpoints for the `content` table fields.

**Tasks:**
- Create `/api/content.js` with:
  - `GET`: fetches all records from `content` table and returns as JSON object `{ key: value }`
  - `POST`: receives JSON object, validates JWT in `Authorization` header, upserts into `content` table, returns `{ ok: true }`
  - Invalid or missing JWT returns `401 Unauthorized`
  - Internal errors return `500` with message
- Use `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from environment variables

**Acceptance criteria:**  
`GET /api/content` returns JSON with all keys. `POST /api/content` without JWT returns 401. `POST /api/content` with valid JWT updates the database.

---

## ISSUE 04 — Serverless Function: `/api/creators`

**Context:**  
Create CRUD endpoints for slider creators.

**Tasks:**
- Create `/api/creators.js` with:
  - `GET`: returns creator list ordered by `position ASC`
  - `POST`: creates new creator (requires JWT)
  - `PUT`: updates creator by `id` (requires JWT)
  - `DELETE`: removes creator by `id` (requires JWT)
  - JWT validation on all write routes
  - Errors return appropriate status and message

**Acceptance criteria:**  
`GET /api/creators` returns ordered array. Full CRUD working with authentication.

---

## ISSUE 05 — Serverless Function: `/api/partners`

**Context:**  
Create CRUD endpoints for partner logos.

**Tasks:**
- Create `/api/partners.js` with:
  - `GET`: returns partner list ordered by `created_at ASC`
  - `POST`: creates new partner (requires JWT)
  - `DELETE`: removes partner by `id` (requires JWT)
  - JWT validation on write routes

**Acceptance criteria:**  
`GET /api/partners` returns array. POST and DELETE working with authentication.

---

## ISSUE 06 — Serverless Function: `/api/upload`

**Context:**  
Create image upload endpoint to Supabase Storage.

**Tasks:**
- Create `/api/upload.js` with:
  - `POST`: receives `multipart/form-data` with `file` and `bucket` fields
  - Validates JWT in header
  - Validates that `bucket` is `creators` or `partners`
  - Uploads file to the correct bucket in Supabase Storage
  - Returns `{ url: "public_image_url" }`
  - Errors return appropriate status and message
- Note: max size validation (2MB) is done on front-end — function does not need to revalidate

**Acceptance criteria:**  
Image upload returns accessible public URL. Invalid bucket returns error. Invalid JWT returns 401.

---

## ISSUE 07 — Serverless Function: `/api/keepalive`

**Context:**  
Create the endpoint called daily by Vercel Cron to keep Supabase active.

**Tasks:**
- Create `/api/keepalive.js` per SPEC section 13
- Validate `x-cron-secret` header against `CRON_SECRET` environment variable
- Run `SELECT key FROM content LIMIT 1` on Supabase
- Return `{ ok: true, timestamp }` on success

**Acceptance criteria:**  
Call without `x-cron-secret` returns 401. Call with correct secret returns 200 without errors.

---

## ISSUE 08 — Admin login page

**Context:**  
Create the admin panel login page at `/admin/index.html`.

**Tasks:**
- Create `/admin/index.html` with:
  - Form with email and password fields
  - Submit button
  - Error message "Incorrect email or password" (hidden by default)
  - `noindex, nofollow` meta tag
  - Import Supabase JS SDK via CDN
  - JS logic:
    - Valid JWT in localStorage → redirect to `dashboard.html`
    - On submit: calls `supabase.auth.signInWithPassword()`
    - Success: redirect to `dashboard.html`
    - Error: show error message
- Style with Tailwind (centered layout, clean UI using Poppins)
- Semantic HTML: `<form>`, `<label>`, `<input>` with correct attributes
- Accessibility: labels associated to inputs, visible focus, error message with `role="alert"`

**Acceptance criteria:**  
Login with correct credentials redirects to dashboard. Incorrect login shows error. Already logged-in user goes directly to dashboard. Page not indexed by search engines.

---

## ISSUE 09 — Admin dashboard: structure and tabs

**Context:**  
Create the base structure of the admin panel at `/admin/dashboard.html` with tab navigation and authentication check.

**Tasks:**
- Create `/admin/dashboard.html` with:
  - Authentication check on load (no valid JWT → redirect to login)
  - Header with system logo/name and "Sign out" button (`supabase.auth.signOut()` + redirect to login)
  - Tab navigation: Hero, About, Talents, Partners, Final CTA, Settings
  - Content area that switches per active tab
  - `noindex, nofollow` meta tag
  - Global feedback: toast/message component for success (green) and error (red)
- Style with Tailwind (horizontal tabs layout, clean UI, Poppins)
- Semantic and accessible HTML: `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`

**Acceptance criteria:**  
Access without authentication redirects to login. Tabs switch content correctly. Sign out ends session. Structure ready to receive content from next issues.

---

## ISSUE 10 — Admin dashboard: Hero and About tabs

**Context:**  
Implement Hero and About section editing tabs in the dashboard.

**Tasks:**
- **Hero tab:**
  - Fields: Headline, Subheadline, CTA 1 Text, CTA 1 URL, CTA 2 Text, CTA 2 URL
  - Pre-fill via `GET /api/content`
  - "Save Hero" button → `POST /api/content` with tab fields
  - Success/error feedback

- **About tab:**
  - Fields: Institutional text (textarea), and for each big number: Value and Label (3 pairs)
  - Pre-fill via `GET /api/content`
  - "Save About" button → `POST /api/content`
  - Success/error feedback

- All inputs with associated `<label>`, descriptive placeholder and `aria-describedby` where relevant

**Acceptance criteria:**  
Fields load with current database values. Save updates database and shows confirmation. Network error shows error message.

---

## ISSUE 11 — Admin dashboard: Talents tab

**Context:**  
Implement creator management in the dashboard.

**Tasks:**
- List creators ordered by `position` with "Edit" and "Remove" buttons per item
- "Add Creator" button opens form (inline or simple modal) with fields:
  - Name, Category, Position (number), Instagram URL, YouTube URL, TikTok URL
  - Photo upload: `input[type="file"]` with preview, `image/*` and 2MB validation, calls `POST /api/upload` with `creators` bucket
- Edit: pre-fills form with current data → `PUT /api/creators`
- Remove: simple confirmation ("Are you sure?") → `DELETE /api/creators`
- Add: `POST /api/creators`
- Reload list after each operation
- Success/error feedback on all operations

**Acceptance criteria:**  
Full creator CRUD works. Photo upload works and preview shows before saving. List updates after each operation.

---

## ISSUE 12 — Admin dashboard: Partners, Final CTA and Settings tabs

**Context:**  
Implement remaining dashboard tabs.

**Tasks:**
- **Partners tab:**
  - Logo grid with "Remove" button per item
  - "Add Partner" button: Name field + logo upload (bucket `partners`)
  - `POST /api/partners` to add, `DELETE /api/partners` to remove
  - Reload grid after each operation

- **Final CTA tab:**
  - Fields: Text, Subtext, Button text, Button URL
  - Pre-fill via `GET /api/content`
  - "Save" button → `POST /api/content`

- **Settings tab:**
  - Field: Contact URL for "Fale com o Farol" button (accepts WhatsApp, email or URL)
  - Pre-fill via `GET /api/content` (key `contact_url`)
  - "Save" button → `POST /api/content`

**Acceptance criteria:**  
All tabs work with database persistence. Logo upload works. Contact URL setting saves correctly.

---

## ISSUE 13 — Public site: HTML structure and header

**Context:**  
Create `index.html` with complete semantic structure and responsive header with desktop menu and mobile dropdown.

**Tasks:**
- Create `index.html` with semantic structure per SPEC section 7.1:
  - Skip link ("Skip to content")
  - `<header>`, `<nav>`, `<main id="main-content">`, `<footer>`
  - Sections with `aria-labelledby` pointing to their headings
- Import `assets/css/output.css` and Supabase JS SDK via CDN
- **Header/Nav:**
  - Logo on the left
  - Horizontal menu on desktop (`md:flex`)
  - Hamburger icon on mobile (`md:hidden`)
  - Mobile dropdown: JS toggle, Tailwind animation (`transition`, `opacity`)
  - `aria-expanded`, `aria-controls`, `aria-label` on hamburger button
  - Focus managed: on open, focus first item; Escape closes
- Placeholder structure for all home sections (filled in subsequent issues)

**Acceptance criteria:**  
Desktop menu visible at ≥ 768px. Hamburger visible at < 768px. Dropdown opens/closes on click and Escape. Keyboard navigation functional. Skip link visible when focused.

---

## ISSUE 14 — Public site: Hero section

**Context:**  
Implement the Hero section with dynamic content loaded from Supabase, faithful to the Figma design.

**Tasks:**
- Implement Hero section per Figma (headline, subheadline, two CTAs)
- Content loaded via `GET /api/content` (`hero_*` keys)
- Skeleton loader during loading
- Fallback with placeholder text if call fails
- Responsive typography: `text-4xl md:text-6xl lg:text-8xl` for headline (adjust per Figma)
- Fonts per Figma (likely Agharti for headline)
- CTAs with dynamic `href` from database (`hero_cta1_url`, `hero_cta2_url`)
- `aria-label` on buttons if text is not sufficiently descriptive
- Responsive: stacked on mobile, Figma layout on desktop

**Acceptance criteria:**  
Hero renders with database content. Fonts and layout faithful to Figma. Responsive on mobile and desktop. Fallback works if API fails.

---

## ISSUE 15 — Public site: About section

**Context:**  
Implement the About section with institutional text and dynamic big numbers.

**Tasks:**
- Implement About section per Figma
- Institutional text and big numbers loaded via `GET /api/content` (`about_*` keys)
- Skeleton loader during loading
- Big numbers: large display typography, value + label (e.g. "+200 / Creators no Casting")
- Desktop layout: text on left, big numbers on right (or per Figma)
- Mobile layout: single column, stacked
- Responsive typography on numbers

**Acceptance criteria:**  
Section renders with database data. Big numbers updated in admin appear on site. Correct responsive layout.

---

## ISSUE 16 — Public site: Creators section and tags

**Context:**  
Implement the section with the "Mais de 200 Creators" callout and category tags.

**Tasks:**
- Implement section per Figma
- Fixed content (not CMS-editable in this phase)
- Tags: Humor & Criatividade, Gastronomia, Esportes & Games, Moda & Beleza, Lifestyle, Páginas & Comunidades
- Desktop layout: tags in a single row
- Mobile layout: tags wrap into multiple lines
- Responsive typography on "200 CREATORS" title

**Acceptance criteria:**  
Section renders correctly. Tags wrap to multiple lines on mobile. Responsive typography works.

---

## ISSUE 17 — Public site: Featured Talents section (slider)

**Context:**  
Implement the talent slider with dynamic data from Supabase.

**Tasks:**
- Create `assets/js/slider.js` with slider logic:
  - Renders cards from `GET /api/creators`
  - 3 cards visible on desktop (`lg:`), 1 on mobile
  - Previous/next arrows with infinite loop
  - Touch swipe: `touchstart` and `touchend` calculate direction
  - Arrows visible on mobile (positioned below the card)
- Creator card: photo, name, category, social media icons with links
- Skeleton loader during loading
- `role="region"` + `aria-label="Featured talents"` on container
- `aria-label` on arrows ("Previous creator", "Next creator")
- `aria-live="polite"` to announce card change to screen readers
- `alt="Photo of [name]"` on photos

**Acceptance criteria:**  
Slider works on desktop and mobile. Touch swipe functional. Data loads from database. Accessibility implemented. Infinite loop works.

---

## ISSUE 18 — Public site: How We Work section

**Context:**  
Implement the methodology section with four blocks. Fixed content in this phase.

**Tasks:**
- Implement section per Figma with four blocks (icon + title + text)
- Fixed content in HTML (not CMS-editable in Phase 1)
- Desktop layout: 4 columns (or 2x2 per Figma)
- Mobile layout: 1 column, stacked
- Texts prepared with `data-i18n` for future i18n

**Acceptance criteria:**  
Section renders per Figma. Correct responsive layout.

---

## ISSUE 19 — Public site: Partners section

**Context:**  
Implement the partner logo grid with dynamic data from Supabase.

**Tasks:**
- Logo grid loaded via `GET /api/partners`
- Skeleton loader during loading
- Desktop layout: multi-column grid (per Figma)
- Mobile layout: 2-column grid
- `alt="[partner name] logo"` on each logo
- Fallback: if no partners are registered, section is hidden (or shows placeholder)

**Acceptance criteria:**  
Logos load from database. Add/remove in admin reflects on site. Correct responsive layout. Alt texts present.

---

## ISSUE 20 — Public site: Final CTA section and Footer

**Context:**  
Implement the final CTA section and footer.

**Tasks:**
- **Final CTA section:**
  - Two-column layout: text/CTA on the left, placeholder on the right (solid background or placeholder image until content is defined)
  - Text, subtext and button loaded via `GET /api/content` (`cta_final_*` keys)
  - Mobile layout: single column, stacked
  - Skeleton loader during loading

- **Footer:**
  - Fixed content: logo, copyright, basic links (TBD — use placeholder for now)
  - `role="contentinfo"` on `<footer>`
  - Responsive layout

**Acceptance criteria:**  
CTA section renders with database data. Placeholder visible on the right. Footer present and responsive.

---

## ISSUE 21 — Parallel loading and global fallbacks

**Context:**  
Implement data loading logic in `main.js` with `Promise.all` and global fallbacks for the public site.

**Tasks:**
- Create `assets/js/main.js` with:
  - `Promise.all([fetchContent(), fetchCreators(), fetchPartners()])` on page load
  - Skeleton loaders activated before calls, removed after
  - Data distributed to each section's render functions
  - If `fetchContent()` fails: text sections keep HTML placeholders
  - If `fetchCreators()` fails: slider shows "Talents coming soon"
  - If `fetchPartners()` fails: partners section hidden
  - No API failure breaks the rest of the page
- Implement `STRINGS` object structure for future i18n (SPEC section 11)

**Acceptance criteria:**  
Page loads even with one or more APIs failing. Skeleton loaders appear and disappear correctly. Console shows no unhandled errors.

---

## ISSUE 22 — Testing, responsiveness adjustments and deploy

**Context:**  
Final validation, adjustments and Vercel deploy configuration.

**Tasks:**
- Review responsiveness on mobile (< 768px), tablet (768–1024px) and desktop (> 1024px)
- Verify all `alt`, `aria-label`, `aria-labelledby` and keyboard tab order
- Verify no credentials are exposed in source code
- Confirm `/admin/` returns `X-Robots-Tag: noindex` header
- Confirm `robots.txt` blocks `/admin/`
- Configure environment variables on Vercel (per `.env.local.example`)
- Deploy and verify keepalive cron is registered on Vercel
- Run Lighthouse on public site and record performance score
- Fix performance issues if score < 85

**Acceptance criteria:**  
All PRD section 8 acceptance criteria verified. Deploy working on Vercel. Cron registered. Lighthouse ≥ 85 on performance.

---

## Issues Summary

| # | Issue | Type |
|---|---|---|
| 01 | Repository setup and base infrastructure | Infra |
| 02 | Database schema on Supabase | Infra |
| 03 | Serverless Function: `/api/content` | Backend |
| 04 | Serverless Function: `/api/creators` | Backend |
| 05 | Serverless Function: `/api/partners` | Backend |
| 06 | Serverless Function: `/api/upload` | Backend |
| 07 | Serverless Function: `/api/keepalive` | Backend |
| 08 | Admin login page | Admin |
| 09 | Admin dashboard: structure and tabs | Admin |
| 10 | Admin dashboard: Hero and About tabs | Admin |
| 11 | Admin dashboard: Talents tab | Admin |
| 12 | Admin dashboard: Partners, Final CTA and Settings tabs | Admin |
| 13 | Public site: HTML structure and header | Front |
| 14 | Public site: Hero section | Front |
| 15 | Public site: About section | Front |
| 16 | Public site: Creators section and tags | Front |
| 17 | Public site: Featured Talents section (slider) | Front |
| 18 | Public site: How We Work section | Front |
| 19 | Public site: Partners section | Front |
| 20 | Public site: Final CTA section and Footer | Front |
| 21 | Parallel loading and global fallbacks | Front |
| 22 | Testing, responsiveness adjustments and deploy | QA |
