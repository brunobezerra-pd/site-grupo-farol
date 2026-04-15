# SPEC — Grupo Farol Institutional Website

**Version:** 2.0  
**Status:** Approved for implementation  
**Date:** April 2026  
**Reference:** PRD v1.2  
**Changelog v2.0:** Added MCP integrations (Supabase + Figma), .env.local setup, Figma-driven breakpoint strategy, Hero section SVG positioning spec, slider boundary behavior, per-breakpoint implementation strategy, content bucket, image placeholder/upload/remove pattern, admin branding, gitignore rules, Figma color/style integration with Tailwind.

---

## 1. File Structure

```
/
├── index.html                  ← Public home page
├── admin/
│   ├── index.html              ← Admin login
│   └── dashboard.html          ← Admin editing panel
├── api/
│   ├── content.js              ← GET /api/content
│   ├── creators.js             ← GET + POST + PUT + DELETE /api/creators
│   ├── partners.js             ← GET + POST + DELETE /api/partners
│   ├── upload.js               ← POST /api/upload
│   └── keepalive.js            ← GET /api/keepalive (Vercel Cron)
├── assets/
│   ├── css/
│   │   └── output.css          ← Tailwind CLI generated CSS (do not edit manually)
│   ├── js/
│   │   ├── main.js             ← Public site logic
│   │   ├── slider.js           ← Talent slider logic
│   │   └── admin.js            ← Admin panel logic
│   ├── fonts/
│   │   ├── AghartiVF.woff2
│   │   ├── CasualHuman.woff2
│   │   ├── CasualHuman-Bold.woff2
│   │   └── Foun.woff2
│   └── images/
│       └── placeholders/       ← Static placeholder SVGs for sections with no uploaded image
├── tailwind.config.js
├── tailwind.input.css
├── vercel.json
└── .env.local                  ← Never committed
```

### 1.1 .gitignore rules

The following must be in `.gitignore`:
- `.env.local`
- `node_modules/`
- `PRD.md`
- `SPEC.md`
- `ISSUES.md`
- `KICKOFF.md`

`README.md` is allowed in the repository but must contain only information strictly necessary for setup and operation — no architecture decisions, no business context, no credentials, no references to internal planning documents.

---

## 2. Environment Variables

Create `.env.local` at project root from the very first issue. Never commit it.

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=xxxx
SUPABASE_SERVICE_ROLE_KEY=xxxx
CRON_SECRET=a-long-random-secret
FIGMA_FILE_KEY=xxxx              ← Figma file key (used during development only)
```

`SUPABASE_SERVICE_ROLE_KEY` and `CRON_SECRET` are used only in Serverless Functions — never exposed to the browser.  
`SUPABASE_ANON_KEY` is used in the browser via Supabase JS SDK — this is expected and safe because RLS protects the data.  
`FIGMA_FILE_KEY` is a development-only variable used by the Figma MCP. It must not be referenced in any deployed code.

---

## 3. MCP Integrations

The Claude Code session must connect to and actively use two MCP servers throughout development:

### 3.1 Supabase MCP
- Use for: creating tables, applying RLS policies, creating storage buckets, seeding data, inspecting schema
- All database operations must go through the Supabase MCP when possible, not manual SQL copy-paste
- RLS policies must be applied immediately after table creation in the same operation — never leave a table without RLS

### 3.2 Figma MCP (official Figma Developer MCP)
- Use for: extracting design tokens (colors, typography, spacing), inspecting components, reading SVG elements, getting exact values for positioning and layout
- The Figma file has three separate frames, one per breakpoint: **Desktop**, **Tablet**, **Mobile**
- Always read the correct frame for the breakpoint being implemented
- Figma layers and components are structured to aid HTML/CSS comprehension — use them as implementation reference
- Figma color styles must be extracted and mapped to Tailwind config — do not hardcode color values

### 3.3 SVG Asset Handling (critical)
When the Figma MCP exports or downloads an SVG asset to disk:
- **Never** pass the SVG file to the Claude API as an image — the API only accepts `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- SVG is XML-based text — always read it using bash: `cat filename.svg`
- Inspect the XML structure as text and embed or reference it directly in the HTML
- If the file was downloaded with a `.png` extension but contains SVG content, rename it to `.svg` first: `mv filename.png filename.svg`
- This rule applies to every SVG asset throughout the entire project — hero illustration, icons, decorative elements

---

## 4. Typography and Fonts

### 4.1 @font-face declarations (in `tailwind.input.css`)

```css
@font-face {
  font-family: 'Agharti';
  src: url('/assets/fonts/AghartiVF.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Casual Human';
  src: url('/assets/fonts/CasualHuman.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Casual Human';
  src: url('/assets/fonts/CasualHuman-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Foun';
  src: url('/assets/fonts/Foun.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

### 4.2 Google Fonts

```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=PT+Serif:ital,wght@0,400;0,700;1,400&display=swap');
```

### 4.3 Font Hierarchy

> ⚠️ No explicit pattern defined in Figma. Font application must follow Figma as source of truth. Verify during implementation via Figma MCP.

| Font | Likely use |
|---|---|
| Agharti | Display headlines and titles |
| Casual Human | Brand accent and personality elements |
| Foun | Editorial highlights, quotes |
| PT Serif | Editorial subtitles |
| Poppins | Body text, UI, labels, admin |

---

## 5. Visual Identity and Tailwind Integration

### 5.1 Color Tokens

Do not hardcode any color values. Extract all color styles from the Figma file via Figma MCP and map them directly to `tailwind.config.js` under `theme.extend.colors`.

Example structure (exact values must come from Figma):
```js
colors: {
  'farol-red': '#xxxxxx',
  'farol-beige': '#xxxxxx',
  'farol-black': '#xxxxxx',
  // ... all styles found in Figma
}
```

This ensures the Tailwind color palette is always in sync with the design.

### 5.2 WCAG Contrast

WCAG color contrast compliance is explicitly excluded from Phase 1. Figma fidelity takes priority.

---

## 6. CSS and Tailwind

### 6.1 Approach

Tailwind CSS via **standalone CLI** — no mandatory Node/npm, no webpack or vite.

### 6.2 Units

- Typography: `rem`
- Spacing: `rem` for structural, `em` for text-relative
- Breakpoints: `px` in Tailwind config, applied via responsive class prefixes

### 6.3 Breakpoints

Breakpoints must match the three frames defined in the Figma file exactly. Read the frame dimensions via Figma MCP before setting values in `tailwind.config.js`.

Approximate reference (confirm with Figma):
```js
screens: {
  sm: '640px',   // mobile landscape
  md: '768px',   // tablet
  lg: '1024px',  // desktop
  xl: '1280px',  // wide desktop
}
```

### 6.4 Build Scripts

```json
{
  "scripts": {
    "build:css": "tailwindcss -i ./tailwind.input.css -o ./assets/css/output.css --minify",
    "watch:css": "tailwindcss -i ./tailwind.input.css -o ./assets/css/output.css --watch"
  }
}
```

---

## 7. Implementation Strategy — Breakpoints

Each front-end section is implemented in three sequential passes:

1. **Desktop first** — extract design from Desktop frame in Figma, implement fully
2. **Tablet** — extract from Tablet frame, apply differences. Note: tablet and mobile show logo in header; desktop does not.
3. **Mobile** — extract from Mobile frame, apply differences

This means front-end issues are split by breakpoint where the section has meaningful layout differences. The AI must compare all three frames before implementing to identify what changes and what stays the same.

---

## 8. Responsiveness

### 8.1 Principle

Desktop-first implementation order (per section 7), but mobile-first CSS (Tailwind default). Base styles target mobile, overridden with `md:` and `lg:`.

### 8.2 Header / Navigation

| Breakpoint | Behavior |
|---|---|
| Desktop | No logo. Full horizontal navigation menu visible. |
| Tablet | Farol logo visible. Hamburger menu only — horizontal nav hidden. |
| Mobile | Farol logo visible. Hamburger menu only — horizontal nav hidden. |

Dropdown behavior (tablet + mobile):
- Click hamburger → simple vertical dropdown opens
- Click outside or click item → dropdown closes
- Escape key closes dropdown
- `aria-expanded`, `aria-controls`, `aria-label` on hamburger button
- Focus managed: first item focused on open

### 8.3 Section Behavior

| Section | Desktop | Tablet | Mobile |
|---|---|---|---|
| Hero | Full layout per Figma | Per Figma tablet frame | Per Figma mobile frame |
| About | Text + big numbers inline | Per Figma | Single column, stacked |
| Creators | Tags in a row | Tags wrap | Tags wrap |
| Talents slider | 3 cards visible | 1 card + peek of next | 1 card + peek of next |
| How We Work | 4 columns | Per Figma | 1 column, stacked |
| Partners | Multi-column grid | Per Figma | 2-column grid |
| Final CTA | 2 columns | Per Figma | 1 column, stacked |

### 8.4 Responsive Typography

Large display titles scale proportionally using Tailwind responsive classes. Exact sizes must be read from Figma frames for each breakpoint.

---

## 9. Hero Section — SVG Positioning

The Hero section contains three SVG elements whose positions change across breakpoints:
- **Lighthouse** (farol)
- **Light beam** (luz que sai do farol)
- **Sparkle icon** (ícone de brilho)

### Rules
- All three are SVG/vector — extract from Figma via Figma MCP
- Positioning is static per breakpoint, not animated
- The sparkle icon must always appear to "come out of the lighthouse window" — its position is relative to the lighthouse, not to the viewport
- Use CSS `position: absolute` with percentage-based or `calc()` values relative to the lighthouse container, so the relationship holds across screen sizes within each breakpoint range
- Read exact coordinates from each Figma frame (Desktop, Tablet, Mobile) and implement as breakpoint-specific position classes
- The lighthouse container must be a positioned parent (`position: relative`) that wraps all three SVG elements

### Implementation note
Before writing any Hero CSS, read all three Figma frames and document the x/y coordinates of each SVG element relative to the lighthouse container. Use those values as the source of truth.

---

## 10. Talent Slider

### Behavior
- **Desktop:** 3 cards visible simultaneously
- **Tablet:** 1 card fully visible + partial peek of the next card on the right edge
- **Mobile:** 1 card fully visible + partial peek of the next card on the right edge
- The peek effect signals to the user that more items exist — it is a visual affordance, not a separate component

### Navigation rules
- First slide: only "next" action available (no previous)
- Last slide: only "previous" action available (no next)
- No loop — the slider has a defined start and end
- Navigation via arrows (always visible, disabled state when at boundary)
- Navigation via swipe on touch devices

### Admin control
- Number of slides is determined by how many creators are configured in the admin
- Each creator in the admin = one slide card
- Reordering via numeric `position` field

---

## 11. Image Placeholders — Upload and Remove Pattern

Every section in the Figma that contains a placeholder image must follow this pattern:

**Public site behavior:**
- If an image has been uploaded for that slot: display the uploaded image
- If no image has been uploaded (or it has been removed): display the original static placeholder (SVG or styled div, matching the Figma placeholder visually)

**Admin behavior:**
- Each image slot has an upload button and, when an image exists, a remove button
- Upload: calls `POST /api/upload` with the appropriate bucket, saves the returned URL to the database
- Remove: deletes the file from Supabase Storage, clears the URL from the database — public site reverts to placeholder

**Sections with image placeholders (verify all in Figma):**
- About section (gray placeholder beside institutional text)
- Final CTA section (right column placeholder)
- Any other placeholder found in Figma frames

**Database:** image URLs for these slots are stored as keys in the `content` table (e.g. `about_image_url`, `cta_final_image_url`). Empty string or null = show placeholder.

---

## 12. Database Schema (Supabase / Postgres)

### 12.1 Table `content`

```sql
CREATE TABLE content (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

**Expected keys:**

| key | Description |
|---|---|
| `hero_headline` | Hero main title |
| `hero_subheadline` | Hero subtitle |
| `hero_cta1_text` | CTA 1 button text |
| `hero_cta1_url` | CTA 1 button URL |
| `hero_cta2_text` | CTA 2 button text |
| `hero_cta2_url` | CTA 2 button URL |
| `about_text` | About section institutional text |
| `about_image_url` | About section image (empty = show placeholder) |
| `about_stat1_value` | Big number 1 value |
| `about_stat1_label` | Big number 1 label |
| `about_stat2_value` | Big number 2 value |
| `about_stat2_label` | Big number 2 label |
| `about_stat3_value` | Big number 3 value |
| `about_stat3_label` | Big number 3 label |
| `cta_final_text` | Final CTA title |
| `cta_final_subtext` | Final CTA subtext |
| `cta_final_btn_text` | Final CTA button text |
| `cta_final_btn_url` | Final CTA button URL |
| `cta_final_image_url` | Final CTA right column image (empty = show placeholder) |
| `contact_url` | "Fale com o Farol" button destination |

### 12.2 Table `creators`

```sql
CREATE TABLE creators (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  category      TEXT NOT NULL,
  photo_url     TEXT NOT NULL,
  instagram_url TEXT,
  youtube_url   TEXT,
  tiktok_url    TEXT,
  position      INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### 12.3 Table `partners`

```sql
CREATE TABLE partners (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  logo_url   TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 12.4 RLS Policies

Must be applied immediately after table creation — never leave a table without RLS.

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

### 12.5 Supabase Storage Buckets

| Bucket | Use | Policy |
|---|---|---|
| `creators` | Creator photos | Public read, write via service role |
| `partners` | Partner logos | Public read, write via service role |
| `content` | Section images (about, CTA final, etc.) | Public read, write via service role |

---

## 13. API — Serverless Functions

### 13.1 `GET /api/content`
Returns all `content` table fields as JSON object `{ key: value }`.

### 13.2 `POST /api/content`
Updates `content` table fields. Requires JWT.  
**Headers:** `Authorization: Bearer <supabase_jwt>`  
**Body:** `{ "key": "value", ... }`  
**Response:** `{ "ok": true }`

### 13.3 `GET /api/creators`
Returns creator list ordered by `position ASC`.

### 13.4 `POST /api/creators`
Creates new creator. Requires JWT.

### 13.5 `PUT /api/creators`
Updates existing creator by `id`. Requires JWT.

### 13.6 `DELETE /api/creators`
Removes creator by `id`. Requires JWT.

### 13.7 `GET /api/partners`
Returns partner list ordered by `created_at ASC`.

### 13.8 `POST /api/partners`
Creates new partner. Requires JWT.

### 13.9 `DELETE /api/partners`
Removes partner by `id`. Requires JWT.

### 13.10 `POST /api/upload`
Uploads image to Supabase Storage. Requires JWT.  
**Body:** `multipart/form-data` with `file` and `bucket` (`creators`, `partners`, or `content`).  
**Validations:** `image/*` only, 2MB max (front-end validated).  
**Response:** `{ "url": "public_url" }`

### 13.11 `DELETE /api/upload`
Removes image from Supabase Storage. Requires JWT.  
**Body:** `{ "bucket": "content", "path": "filename.jpg" }`  
**Response:** `{ "ok": true }`

---

## 14. Authentication

- Supabase Auth (email + password)
- JWT stored in `localStorage` after login
- All write calls send `Authorization: Bearer <token>`
- Serverless Functions validate JWT via `SUPABASE_SERVICE_ROLE_KEY`
- Invalid or missing JWT returns `401 Unauthorized`
- Public site never accesses authenticated routes

---

## 15. Public Site — Behavior

### Content loading
- `Promise.all([fetchContent(), fetchCreators(), fetchPartners()])` on page load
- Skeleton loaders shown during loading
- Section fallbacks if individual calls fail
- Empty/null image URLs render the static placeholder, never a broken image tag

### i18n (preparation only)
- All fixed texts use `data-i18n="key"` attributes
- `STRINGS` object in `main.js` centralizes PT-BR texts
- No language switching in MVP

---

## 16. Admin Panel — Behavior

### Branding
- Admin panel must display the Farol logo in the header for consistent branding
- Style: clean, functional, Poppins font

### Login (`/admin/index.html`)
- Email + password
- Valid JWT in localStorage → redirect to dashboard
- Success → redirect to dashboard
- Error → "Incorrect email or password"

### Dashboard (`/admin/dashboard.html`)
- Auth check on load
- Tabs: Hero, About, Talents, Partners, Final CTA, Settings
- Save button per tab with success/error feedback
- Sign out button

### Image slots in admin
Every section with an image placeholder must show:
- Current image preview (if uploaded)
- Upload button (always visible)
- Remove button (visible only when an image exists)
- On remove: file deleted from Storage, URL cleared from `content` table, preview reverts to placeholder

---

## 17. Supabase Keepalive

Vercel Cron Job running daily at 09:00 UTC.

### `vercel.json`
```json
{
  "crons": [{ "path": "/api/keepalive", "schedule": "0 9 * * *" }],
  "rewrites": [{ "source": "/api/(.*)", "destination": "/api/$1" }],
  "headers": [{
    "source": "/admin/(.*)",
    "headers": [{ "key": "X-Robots-Tag", "value": "noindex, nofollow" }]
  }]
}
```

### `/api/keepalive.js`
```js
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const token = req.headers['x-cron-secret']
  if (token !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const { error } = await supabase.from('content').select('key').limit(1)
  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ ok: true, timestamp: new Date().toISOString() })
}
```

---

## 18. Semantic HTML and Accessibility

### Structure
```html
<body>
  <a href="#main-content" class="skip-link">Skip to content</a>
  <header role="banner">
    <nav aria-label="Main navigation">...</nav>
  </header>
  <main id="main-content">
    <section aria-labelledby="hero-heading">...</section>
    <section aria-labelledby="about-heading">...</section>
    <section aria-labelledby="creators-heading">...</section>
    <section aria-labelledby="talents-heading">...</section>
    <section aria-labelledby="how-heading">...</section>
    <section aria-labelledby="partners-heading">...</section>
    <section aria-labelledby="cta-heading">...</section>
  </main>
  <footer role="contentinfo">...</footer>
</body>
```

### Accessibility requirements

| Element | Requirement |
|---|---|
| Creator images | `alt="Photo of [name]"` |
| Partner logos | `alt="[name] logo"` |
| Section images | `alt` from content or empty if decorative |
| Decorative images | `alt=""` + `role="presentation"` |
| Slider | `role="region"` + `aria-label="Featured talents"` + `aria-live="polite"` |
| Slider arrows | `aria-label` + `disabled` attribute at boundaries |
| Hamburger button | `aria-expanded` + `aria-controls` + `aria-label="Open menu"` |
| Social links | `aria-label="[name]'s [platform]"` + `rel="noopener noreferrer"` |
| Skip link | Visible on keyboard focus |
| WCAG contrast | Excluded from Phase 1 — Figma fidelity takes priority |

---

## 19. robots.txt

```
User-agent: *
Disallow: /admin/
```

---

## 20. Recorded Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| Front-end framework | HTML + CSS + vanilla JS | No build step, faster delivery |
| Admin framework | HTML + CSS + vanilla JS | Consistency, no extra dependencies |
| CSS | Tailwind standalone CLI | Scalable, no bundler, plain HTML compatible |
| CSS units | `rem`/`em` | Responsive and typographic scalability |
| Responsiveness order | Desktop → Tablet → Mobile per section | Matches Figma frame structure |
| Mobile menu | Simple dropdown | Simple, no dependencies |
| Hero SVG positioning | Absolute positioning relative to lighthouse container | Maintains sparkle-to-window relationship across breakpoints |
| Slider loop | No loop, hard boundaries | Matches Figma navigation affordance |
| Color tokens | Extracted from Figma via MCP | Single source of truth, Tailwind in sync with design |
| Database | Supabase Postgres | Free tier, integrated Auth and Storage |
| Authentication | Supabase Auth | Avoids building auth from scratch |
| Image storage | Supabase Storage (3 buckets) | Integrated, automatic public URLs |
| Creator reordering | Numeric `position` field | Drag-and-drop deferred to Phase 2 |
| User management | Via Supabase dashboard | Admin screen deferred to Phase 2 |
| Keepalive | Daily Vercel Cron | Free on Hobby plan |
| Planning docs in repo | Excluded via .gitignore | No internal info leaked to repository |
