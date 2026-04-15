# ISSUES — Grupo Farol Institutional Website

**Reference:** SPEC v2.0 / PRD v1.2  
**Implementation order:** sequential — each issue depends on the previous one.

---

## ISSUE 01 — Repository setup and base infrastructure

**Context:**  
Set up the project file structure per SPEC, install Tailwind standalone CLI, create `.env.local`, and configure all base files.

**Tasks:**
- Create folder structure per SPEC section 1
- Create `.env.local` with all variables from SPEC section 2 (empty values, ready to fill)
- Create `.env.local.example` with variable names only — no values
- Create `.gitignore` including: `.env.local`, `node_modules/`, `PRD.md`, `SPEC.md`, `ISSUES.md`, `KICKOFF.md`
- Connect to Supabase MCP — verify connection before proceeding
- Connect to Figma MCP — read the Figma file, confirm three frames exist (Desktop, Tablet, Mobile)
- Extract color styles from Figma via Figma MCP and populate `tailwind.config.js` `theme.extend.colors` with named tokens (e.g. `farol-red`, `farol-beige`)
- Extract breakpoint values from Figma frame dimensions and set in `tailwind.config.js` `screens`
- Create `tailwind.config.js` with font families, colors and breakpoints (SPEC sections 5, 6)
- Create `tailwind.input.css` with `@tailwind` directives, `@font-face` declarations (SPEC section 4.1) and Google Fonts `@import` (SPEC section 4.2)
- Create minimal `package.json` with `build:css` and `watch:css` scripts (SPEC section 6.4)
- Create `vercel.json` per SPEC section 17
- Create `robots.txt` per SPEC section 19
- Run Tailwind build — confirm `assets/css/output.css` generates without errors

**Acceptance criteria:**  
`.env.local` exists and is gitignored. Figma MCP connected and three frames confirmed. Color tokens from Figma in Tailwind config. `assets/css/output.css` generated successfully. No planning docs committed.

---

## ISSUE 02 — Database schema and storage on Supabase

**Context:**  
Create all tables, apply RLS policies and create storage buckets via Supabase MCP.

**Tasks:**
- Use Supabase MCP to create tables `content`, `creators`, `partners` (SPEC section 12.1, 12.2, 12.3)
- Apply RLS policies immediately after each table creation (SPEC section 12.4) — never leave a table without RLS
- Verify RLS is active on all three tables via Supabase MCP
- Use Supabase MCP to create storage buckets: `creators`, `partners`, `content` — all with public read access (SPEC section 12.5)
- Seed `content` table with all expected keys (SPEC section 12.1) using PT-BR placeholder values
- Create `README.md` with only the information strictly necessary for setup and operation — no architecture decisions, no business context, no references to planning documents

**Acceptance criteria:**  
All three tables exist with RLS enabled and verified. All three buckets created with public read. Content table seeded. README contains only operational information.

---

## ISSUE 03 — Serverless Function: `/api/content`

**Context:**  
Create read and write endpoints for the `content` table.

**Tasks:**
- Create `/api/content.js`:
  - `GET`: returns all `content` rows as `{ key: value }` JSON object
  - `POST`: validates JWT, upserts fields, returns `{ ok: true }`
  - Missing/invalid JWT → `401`
  - Errors → `500` with message
- Use `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from environment

**Acceptance criteria:**  
`GET` returns all keys. `POST` without JWT returns 401. `POST` with valid JWT updates database.

---

## ISSUE 04 — Serverless Function: `/api/creators`

**Context:**  
Full CRUD for slider creators.

**Tasks:**
- Create `/api/creators.js`:
  - `GET`: creators ordered by `position ASC`
  - `POST`: create creator (JWT required)
  - `PUT`: update creator by `id` (JWT required)
  - `DELETE`: remove creator by `id` (JWT required)

**Acceptance criteria:**  
`GET` returns ordered array. Full CRUD works with JWT validation.

---

## ISSUE 05 — Serverless Function: `/api/partners`

**Context:**  
CRUD for partner logos.

**Tasks:**
- Create `/api/partners.js`:
  - `GET`: partners ordered by `created_at ASC`
  - `POST`: create partner (JWT required)
  - `DELETE`: remove by `id` (JWT required)

**Acceptance criteria:**  
`GET` returns array. POST and DELETE work with JWT validation.

---

## ISSUE 06 — Serverless Functions: `/api/upload` and `/api/upload` DELETE

**Context:**  
Image upload and deletion for all three storage buckets.

**Tasks:**
- Create `/api/upload.js`:
  - `POST`: receives `multipart/form-data` with `file` and `bucket`, validates JWT, uploads to Supabase Storage, returns `{ url }`
  - `DELETE`: receives `{ bucket, path }`, validates JWT, removes file from Storage, returns `{ ok: true }`
  - Valid buckets: `creators`, `partners`, `content`
  - Front-end validates 2MB and `image/*` — function does not revalidate

**Acceptance criteria:**  
Upload returns public URL. Delete removes file. Invalid bucket or missing JWT returns appropriate error.

---

## ISSUE 07 — Serverless Function: `/api/keepalive`

**Context:**  
Daily cron endpoint to prevent Supabase from pausing.

**Tasks:**
- Create `/api/keepalive.js` per SPEC section 17
- Validate `x-cron-secret` header
- Run lightweight query on `content` table
- Return `{ ok: true, timestamp }`

**Acceptance criteria:**  
Missing secret returns 401. Correct secret returns 200.

---

## ISSUE 08 — Admin login page

**Context:**  
Login page at `/admin/index.html`.

**Tasks:**
- Email + password form
- Farol logo in header (SPEC section 16 — admin branding)
- `noindex, nofollow` meta tag
- Supabase JS SDK via CDN
- JS logic: check existing JWT → redirect; on submit → `signInWithPassword` → redirect or show error
- Semantic HTML: `<form>`, `<label>`, `<input>`
- Error message with `role="alert"`
- Tailwind styling, Poppins font

**Acceptance criteria:**  
Correct credentials redirect to dashboard. Wrong credentials show error. Existing session skips login. Not indexed by search engines.

---

## ISSUE 09 — Admin dashboard: structure, tabs and image slot component

**Context:**  
Base structure for `/admin/dashboard.html` including the reusable image upload/remove component used across all tabs.

**Tasks:**
- Auth check on load — redirect to login if not authenticated
- Farol logo in header + Sign out button
- Tab navigation: Hero, About, Talents, Partners, Final CTA, Settings
- `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`
- Global toast component for success/error feedback
- `noindex, nofollow` meta tag
- Reusable image slot component (used in Hero, About, Final CTA tabs):
  - Shows current image if URL exists, shows placeholder if not
  - Upload button (always visible): validates `image/*` and 2MB, calls `POST /api/upload`, saves URL to `content` table
  - Remove button (visible only when image exists): calls `DELETE /api/upload`, clears URL from `content` table, reverts to placeholder
  - Preview updates immediately after upload or remove

**Acceptance criteria:**  
Unauthenticated access redirects to login. Tabs switch correctly. Sign out works. Image slot component uploads, previews and removes correctly.

---

## ISSUE 10 — Admin dashboard: Hero and About tabs

**Tasks:**
- **Hero tab:** Headline, Subheadline, CTA 1 Text, CTA 1 URL, CTA 2 Text, CTA 2 URL — pre-fill from `GET /api/content`, save via `POST /api/content`
- **About tab:** Institutional text (textarea), three big number pairs (value + label), image slot (key: `about_image_url`) — pre-fill and save
- All inputs with associated `<label>` and descriptive placeholder

**Acceptance criteria:**  
Fields pre-fill from database. Save updates database and shows toast. Image slot works correctly in About tab.

---

## ISSUE 11 — Admin dashboard: Talents tab

**Tasks:**
- List creators ordered by `position` with Edit and Remove per item
- Add Creator form: Name, Category, Position, Instagram URL, YouTube URL, TikTok URL, photo upload (bucket `creators`)
- Edit: pre-fill form → `PUT /api/creators`
- Remove: confirm → `DELETE /api/creators`
- Add: `POST /api/creators`
- Reload list after each operation

**Acceptance criteria:**  
Full creator CRUD. Photo upload with preview. List updates after operations.

---

## ISSUE 12 — Admin dashboard: Partners, Final CTA and Settings tabs

**Tasks:**
- **Partners tab:** logo grid with Remove per item, Add Partner (name + logo upload, bucket `partners`)
- **Final CTA tab:** Text, Subtext, Button text, Button URL, image slot (key: `cta_final_image_url`)
- **Settings tab:** `contact_url` field — pre-fill and save

**Acceptance criteria:**  
All tabs persist to database. Logo upload works. Image slot works in Final CTA. Contact URL saves correctly.

---

## ISSUE 13 — Public site: HTML structure and header (Desktop)

**Context:**  
Create `index.html` semantic structure and implement the Desktop header via Figma MCP.

**Tasks:**
- Read Desktop frame from Figma MCP
- Create `index.html` with full semantic structure per SPEC section 18
- Skip link, `<header>`, `<nav>`, `<main id="main-content">`, `<footer>`
- Sections with `aria-labelledby`
- Import `assets/css/output.css` and Supabase JS SDK
- **Desktop header:** no logo, full horizontal nav — extract exact layout from Figma Desktop frame
- Placeholder sections for all home content (filled in subsequent issues)

**Acceptance criteria:**  
Semantic structure complete. Desktop header matches Figma. Skip link functional on keyboard focus.

---

## ISSUE 14 — Public site: header Tablet and Mobile

**Context:**  
Add tablet and mobile header behavior on top of the desktop implementation.

**Tasks:**
- Read Tablet and Mobile frames from Figma MCP — note differences from desktop
- Tablet + Mobile: show Farol logo, hide horizontal nav, show hamburger icon
- Hamburger dropdown: simple vertical menu, JS toggle, Tailwind transition
- `aria-expanded`, `aria-controls`, `aria-label` on hamburger
- Focus managed on open; Escape closes
- Click outside closes dropdown

**Acceptance criteria:**  
Desktop header unchanged. Logo + hamburger visible on tablet/mobile. Dropdown opens/closes correctly. Keyboard accessible.

---

## ISSUE 15 — Public site: Hero section (Desktop)

**Context:**  
Implement Hero with SVG elements and dynamic content — Desktop breakpoint.

**Tasks:**
- Read Desktop frame from Figma MCP
- Extract exact x/y coordinates of lighthouse, light beam and sparkle SVG elements relative to the lighthouse container
- Extract SVG code for all three elements from Figma
- Implement Hero layout faithful to Figma Desktop frame
- Lighthouse container: `position: relative`
- Light beam and sparkle: `position: absolute` with values derived from Figma coordinates
- Sparkle must visually "exit the lighthouse window" — position relative to lighthouse, not viewport
- Dynamic content (headline, subheadline, CTAs) loaded via `GET /api/content`
- Skeleton loader during content fetch
- Fallback to HTML placeholder if API fails

**Acceptance criteria:**  
Hero matches Figma Desktop exactly. Sparkle exits lighthouse window at correct position. Content loads from database. Fallback works.

---

## ISSUE 16 — Public site: Hero section (Tablet and Mobile)

**Context:**  
Apply Tablet and Mobile layouts to the Hero section.

**Tasks:**
- Read Tablet and Mobile frames from Figma MCP
- Document x/y coordinates of all three SVG elements for each breakpoint
- Apply breakpoint-specific position classes for tablet and mobile
- Sparkle must maintain its "exiting the lighthouse window" relationship at all breakpoints
- Typography scales per Figma values for each frame

**Acceptance criteria:**  
Hero layout matches Figma Tablet and Mobile frames. Sparkle-to-lighthouse relationship maintained at all breakpoints.

---

## ISSUE 17 — Public site: About section

**Context:**  
Implement About section across all breakpoints.

**Tasks:**
- Read all three Figma frames
- Institutional text and big numbers loaded via `GET /api/content`
- Image slot: shows uploaded image (`about_image_url`) or static placeholder
- Skeleton loader during loading
- Desktop: per Figma. Mobile: single column stacked.

**Acceptance criteria:**  
Section matches Figma across breakpoints. Image shows uploaded or placeholder. Big numbers editable via admin appear correctly.

---

## ISSUE 18 — Public site: Creators section and tags

**Context:**  
Implement the "Mais de 200 Creators" section with category tags.

**Tasks:**
- Read all three Figma frames
- Fixed content (not CMS-editable in Phase 1)
- Tags: Humor & Criatividade, Gastronomia, Esportes & Games, Moda & Beleza, Lifestyle, Páginas & Comunidades
- Desktop: tags in a row. Tablet/Mobile: tags wrap into multiple lines
- `data-i18n` attributes on all fixed texts

**Acceptance criteria:**  
Section matches Figma across breakpoints. Tags wrap correctly on smaller screens.

---

## ISSUE 19 — Public site: Featured Talents slider (Desktop)

**Context:**  
Implement the talent slider for Desktop — 3 cards visible.

**Tasks:**
- Read Desktop frame from Figma MCP — extract card design and slider layout
- Create `assets/js/slider.js`
- Render cards from `GET /api/creators` ordered by `position`
- Desktop: 3 cards visible simultaneously
- Navigation arrows: left disabled on first slide, right disabled on last slide — no loop
- Skeleton loader during loading
- `role="region"` + `aria-label="Featured talents"` + `aria-live="polite"`
- Arrow `aria-label` and `disabled` at boundaries

**Acceptance criteria:**  
3 cards visible on desktop. Arrows disable at boundaries. No loop. Data from database. Accessibility implemented.

---

## ISSUE 20 — Public site: Featured Talents slider (Tablet and Mobile)

**Context:**  
Apply Tablet and Mobile slider behavior — 1 card + peek.

**Tasks:**
- Read Tablet and Mobile frames from Figma MCP — extract peek width/design
- 1 card fully visible + partial right-edge peek of the next card
- Peek is a visual affordance — implemented via CSS overflow and partial card visibility
- Touch swipe navigation (`touchstart`, `touchend`)
- Same boundary behavior: first slide no previous, last slide no next
- Arrows visible on mobile/tablet (below card per Figma)

**Acceptance criteria:**  
1 card + peek visible on tablet and mobile. Swipe works. Boundary behavior maintained. Peek visually matches Figma.

---

## ISSUE 21 — Public site: How We Work section

**Tasks:**
- Read all three Figma frames
- Four blocks (icon + title + text) — fixed content, not CMS-editable
- Desktop: 4 columns (or per Figma). Mobile: 1 column stacked
- `data-i18n` on all texts

**Acceptance criteria:**  
Section matches Figma across breakpoints.

---

## ISSUE 22 — Public site: Partners section

**Tasks:**
- Read all three Figma frames
- Logos loaded via `GET /api/partners`
- Desktop: multi-column grid per Figma. Mobile: 2-column grid
- `alt="[name] logo"` on each logo
- Skeleton loader. If no partners: section hidden.

**Acceptance criteria:**  
Logos load from database. Layout matches Figma. Alt texts present.

---

## ISSUE 23 — Public site: Final CTA section and Footer

**Tasks:**
- Read all three Figma frames
- **Final CTA:** text/CTA left column (content from `GET /api/content`), image slot right column (`cta_final_image_url` or placeholder). Mobile: single column stacked.
- **Footer:** fixed content per Figma. `role="contentinfo"`. Responsive.

**Acceptance criteria:**  
CTA section renders with database data. Image slot shows uploaded image or placeholder. Footer responsive.

---

## ISSUE 24 — Parallel loading and global fallbacks

**Tasks:**
- `Promise.all([fetchContent(), fetchCreators(), fetchPartners()])` on page load
- Skeleton loaders before calls, removed after
- Per-section fallbacks: text sections keep HTML placeholders, slider shows "Talents coming soon", partners section hidden
- Image slots: null/empty URL always renders static placeholder — never broken `<img>` tag
- `STRINGS` object in `main.js` for i18n preparation

**Acceptance criteria:**  
Page loads with any combination of API failures. No broken image tags. No unhandled console errors.

---

## ISSUE 25 — Testing, responsiveness review and deploy

**Tasks:**
- Review all sections across mobile (< 768px), tablet (768–1024px), desktop (> 1024px)
- Verify Hero SVG positioning at all breakpoints — sparkle must exit lighthouse window correctly
- Verify slider peek effect on tablet and mobile
- Verify all `alt`, `aria-label`, `aria-labelledby`, tab order and keyboard navigation
- Verify no credentials in source code
- Verify `/admin/` returns `X-Robots-Tag: noindex`
- Verify `robots.txt` blocks `/admin/`
- Verify `.gitignore` excludes all planning docs
- Configure environment variables on Vercel
- Deploy and verify keepalive cron is registered
- Run Lighthouse on public site — fix if score < 85

**Acceptance criteria:**  
All PRD section 8 acceptance criteria verified. Deploy working. Cron registered. Lighthouse ≥ 85. Planning docs not in repository.

---

## ISSUE 26 — Favicon and OpenGraph

**Context:**  
Add favicon and OpenGraph metadata to the site using assets already placed in `assets/images/`.

**Pre-condition:**  
`assets/images/favicon.png` and `assets/images/OpenGraph.png` must exist before running this issue.

**Tasks:**
- Add favicon to `<head>` of `index.html`, `/admin/index.html` and `/admin/dashboard.html`:
  ```html
  <link rel="icon" type="image/png" href="/assets/images/favicon.png">
  ```
- Add OpenGraph and Twitter Card meta tags to `index.html` `<head>`:
  - `og:title` — fallback: "Grupo Farol"
  - `og:description` — fallback: "A maior agência de creators da América Latina"
  - `og:image` — absolute URL to `/assets/images/OpenGraph.png`
  - `og:type` — `website`
  - `og:url` — site domain (confirm after domain is connected)
  - `twitter:card` — `summary_large_image`
  - `twitter:image` — same as `og:image`
- OpenGraph tags do not go on admin pages

**Acceptance criteria:**  
Favicon appears on browser tab on all three pages. OpenGraph tags present and valid in `index.html`. Admin pages unaffected by OG tags.

---

## Issues Summary

| # | Issue | Type |
|---|---|---|
| 01 | Repository setup and base infrastructure | Infra |
| 02 | Database schema and storage on Supabase | Infra |
| 03 | Serverless Function: `/api/content` | Backend |
| 04 | Serverless Function: `/api/creators` | Backend |
| 05 | Serverless Function: `/api/partners` | Backend |
| 06 | Serverless Functions: `/api/upload` and DELETE | Backend |
| 07 | Serverless Function: `/api/keepalive` | Backend |
| 08 | Admin login page | Admin |
| 09 | Admin dashboard: structure, tabs and image slot component | Admin |
| 10 | Admin dashboard: Hero and About tabs | Admin |
| 11 | Admin dashboard: Talents tab | Admin |
| 12 | Admin dashboard: Partners, Final CTA and Settings tabs | Admin |
| 13 | Public site: HTML structure and header (Desktop) | Front |
| 14 | Public site: header Tablet and Mobile | Front |
| 15 | Public site: Hero section (Desktop) | Front |
| 16 | Public site: Hero section (Tablet and Mobile) | Front |
| 17 | Public site: About section | Front |
| 18 | Public site: Creators section and tags | Front |
| 19 | Public site: Featured Talents slider (Desktop) | Front |
| 20 | Public site: Featured Talents slider (Tablet and Mobile) | Front |
| 21 | Public site: How We Work section | Front |
| 22 | Public site: Partners section | Front |
| 23 | Public site: Final CTA section and Footer | Front |
| 24 | Parallel loading and global fallbacks | Front |
| 25 | Testing, responsiveness review and deploy | QA |
| 26 | Favicon and OpenGraph | Polish |
