# SPEC — Grupo Farol Institutional Website

**Version:** 1.2  
**Status:** Approved for implementation  
**Date:** April 2026  
**Reference:** PRD v1.2  
**Changelog v1.2:** Added responsiveness, fonts, CSS/Tailwind, semantics and accessibility sections.  
**Changelog v1.1:** Added section 12 — Supabase Keepalive via Vercel Cron.

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
│   │   ├── AghartiVF.woff2         ← Variable font (all weights)
│   │   ├── CasualHuman.woff2       ← Regular weight
│   │   ├── CasualHuman-Bold.woff2  ← Bold weight
│   │   └── Foun.woff2
│   └── images/                 ← Static assets (logo, icons, etc.)
├── tailwind.config.js          ← Tailwind configuration
├── tailwind.input.css          ← CSS entry with @tailwind directives + @font-face
├── robots.txt                  ← Blocks /admin/ indexing
├── vercel.json                 ← Routes, cron and env configuration
└── .env.local                  ← Environment variables (never committed)
```

---

## 2. Environment Variables

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=xxxx
SUPABASE_SERVICE_ROLE_KEY=xxxx   ← used only in Serverless Functions
CRON_SECRET=a-long-random-secret
```

Rule: `SUPABASE_SERVICE_ROLE_KEY` and `CRON_SECRET` are never exposed on the front-end. Only `/api` Serverless Functions use them.

---

## 3. Typography and Fonts

### 3.1 @font-face declarations (in `tailwind.input.css`)

```css
/* Agharti — variable font, covers all weights */
@font-face {
  font-family: 'Agharti';
  src: url('/assets/fonts/AghartiVF.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

/* Casual Human */
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

/* Foun */
@font-face {
  font-family: 'Foun';
  src: url('/assets/fonts/Foun.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

### 3.2 Google Fonts (in `tailwind.input.css`)

```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=PT+Serif:ital,wght@0,400;0,700;1,400&display=swap');
```

### 3.3 Font Hierarchy

> ⚠️ No explicit pattern defined in Figma. Font application must follow Figma as the source of truth. The associations below are inferences — verify during implementation.

| Font | Likely use |
|---|---|
| Agharti | Display headlines and titles (hero, large numbers) |
| Casual Human | Brand accent and personality elements |
| Foun | Editorial highlights, quotes |
| PT Serif | Editorial subtitles with personality |
| Poppins | Body text, UI, labels, admin |

### 3.4 Tailwind Font Configuration

```js
// tailwind.config.js
module.exports = {
  content: ['./*.html', './admin/*.html', './assets/js/*.js'],
  theme: {
    extend: {
      fontFamily: {
        agharti: ['Agharti', 'sans-serif'],
        casual: ['Casual Human', 'sans-serif'],
        foun: ['Foun', 'serif'],
        serif: ['PT Serif', 'Georgia', 'serif'],
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
}
```

---

## 4. Visual Identity

| Token | Value |
|---|---|
| Primary color (red) | `#C0392B` (verify with Figma) |
| Background color (beige) | `#F5ECD7` (verify with Figma) |
| Text color (black) | `#1A1A1A` |

> ⚠️ Exact color values must be extracted from Figma before implementation. Add to `tailwind.config.js` under `theme.extend.colors`.

> ⚠️ WCAG color contrast compliance has been explicitly removed from Phase 1 requirements. Fidelity to Figma layout takes priority.

---

## 5. CSS and Tailwind

### 5.1 Approach

Tailwind CSS via **standalone CLI** — no mandatory Node/npm in project, no webpack or vite. The `tailwindcss` binary scans HTML and JS files and generates an optimized `assets/css/output.css`.

### 5.2 Units

- Typography: `rem` (base 16px, scaled via Tailwind)
- Spacing: `rem` for structural margins/paddings, `em` for text-relative spacing
- Breakpoints: defined in `px` in Tailwind config, used via responsive classes

### 5.3 Breakpoints

```js
// tailwind.config.js
screens: {
  sm: '640px',   // mobile landscape
  md: '768px',   // tablet
  lg: '1024px',  // desktop
  xl: '1280px',  // wide desktop
}
```

### 5.4 Build Scripts

```json
// package.json (minimal, scripts only)
{
  "scripts": {
    "build:css": "tailwindcss -i ./tailwind.input.css -o ./assets/css/output.css --minify",
    "watch:css": "tailwindcss -i ./tailwind.input.css -o ./assets/css/output.css --watch"
  }
}
```

---

## 6. Responsiveness

### 6.1 Principle

Mobile-first. Base styles for mobile, overridden with `md:` and `lg:` prefixes for tablet and desktop.

### 6.2 Navigation Menu

| Breakpoint | Behavior |
|---|---|
| Mobile (< 768px) | Hamburger icon visible; click opens vertical dropdown with menu items; close on outside click or item click |
| Tablet/Desktop (≥ 768px) | Full horizontal menu visible; hamburger hidden |

Dropdown implementation:
- Toggle via JS (add/remove `is-open` class)
- Open animation via Tailwind (`transition`, `opacity`, `translate-y`)
- Focus managed via JS (on open, focus first item; Escape closes)

### 6.3 Section Behavior

| Section | Desktop | Mobile |
|---|---|---|
| Hero | Free layout per Figma | Stacked, font scales proportionally |
| About | Text + big numbers inline | Single column, stacked |
| Creators | Tags in a row | Tags wrap, multiple lines |
| Talents | 3 cards in slider | 1 card at a time, swipe enabled |
| How We Work | 4 columns | 1 column, stacked |
| Partners | Multi-column grid | 2-column grid |
| Final CTA | 2 columns | 1 column, stacked |

### 6.4 Responsive Typography

Large display titles (e.g. "200 CREATORS") scale proportionally using Tailwind responsive classes:

```html
<h2 class="text-5xl md:text-7xl lg:text-9xl font-agharti font-black">
  200 CREATORS.
</h2>
```

### 6.5 Slider — Mobile

- 1 card at a time
- Swipe enabled via touch events (`touchstart`, `touchend`)
- Navigation arrows maintained on mobile (positioned below the card)
- Infinite loop maintained

---

## 7. Semantic HTML and Accessibility

### 7.1 Semantic Structure

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

### 7.2 Accessibility Requirements

| Element | Requirement |
|---|---|
| Creator images | `alt="Photo of [creator name]"` |
| Partner logos | `alt="[partner name] logo"` |
| Decorative images | `alt=""` + `role="presentation"` |
| Buttons without visible text | descriptive `aria-label` |
| Slider | `role="region"` + `aria-label="Featured talents"` + `aria-live="polite"` |
| Slider arrows | `aria-label="Previous creator"` / `aria-label="Next creator"` |
| Hamburger button | `aria-expanded` + `aria-controls` + `aria-label="Open menu"` |
| Social media links | `aria-label="[name]'s Instagram"` + `target="_blank"` + `rel="noopener noreferrer"` |
| Skip link | Visible when focused via keyboard |
| Visible focus | Never remove `outline` without replacing with a visible alternative |
| Tab order | Follow logical document reading order |

### 7.3 Compliance

- Target: WCAG 2.1 level AA — **except minimum color contrast** (explicit decision, Phase 1)
- Keyboard navigation functional across the entire site and admin

---

## 8. Database Schema (Supabase / Postgres)

### 8.1 Table `content`

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
| `about_stat1_value` | Big number 1 value (e.g. "+200") |
| `about_stat1_label` | Big number 1 label (e.g. "Creators no Casting") |
| `about_stat2_value` | Big number 2 value |
| `about_stat2_label` | Big number 2 label |
| `about_stat3_value` | Big number 3 value |
| `about_stat3_label` | Big number 3 label |
| `cta_final_text` | Final CTA section title |
| `cta_final_subtext` | Final CTA section subtext |
| `cta_final_btn_text` | Final CTA button text |
| `cta_final_btn_url` | Final CTA button URL |
| `contact_url` | "Fale com o Farol" button destination |

### 8.2 Table `creators`

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

### 8.3 Table `partners`

```sql
CREATE TABLE partners (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  logo_url   TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 8.4 Supabase Storage

| Bucket | Use | Policy |
|---|---|---|
| `creators` | Creator photos | Public read, write via service role |
| `partners` | Partner logos | Public read, write via service role |
| `content`  | Site-wide assets (About image, etc.) | Public read, write via service role |

---

## 9. API — Serverless Functions

### 9.1 `GET /api/content`

Returns all `content` table fields as a JSON object.

**Response:**
```json
{
  "hero_headline": "A Maior Agência de Creators da América Latina",
  "hero_subheadline": "...",
  ...
}
```

### 9.2 `POST /api/content`

Updates `content` table fields. Requires authentication.

**Headers:** `Authorization: Bearer <supabase_jwt>`

**Body:**
```json
{ "hero_headline": "New title" }
```

**Response:** `{ "ok": true }`

### 9.3 `GET /api/creators`

Returns creator list ordered by `position ASC`.

### 9.4 `POST /api/creators`

Creates new creator. Requires authentication.

### 9.5 `PUT /api/creators`

Updates existing creator. Requires authentication.  
**Body:** `id` + fields to update.

### 9.6 `DELETE /api/creators`

Removes creator. Requires authentication.  
**Body:** `{ "id": "uuid" }`

### 9.7 `GET /api/partners`

Returns partner list ordered by `created_at ASC`.

### 9.8 `POST /api/partners`

Creates new partner. Requires authentication.

### 9.9 `DELETE /api/partners`

Removes partner. Requires authentication.

### 9.10 `POST /api/upload`

Uploads image to Supabase Storage. Requires authentication.

**Body:** `multipart/form-data` with `file` and `bucket` fields (`creators`, `partners` or `content`).

**Validations:**
- Type: `image/*` only
- Max size: 2MB (validated on front-end before sending)

**Response:**
```json
{ "url": "https://xxxx.supabase.co/storage/v1/object/public/creators/filename.jpg" }
```

---

## 10. Authentication

- Managed by Supabase Auth (email + password)
- Login via Supabase JS SDK in browser
- JWT stored in `localStorage` after login
- All write calls send `Authorization: Bearer <token>`
- Serverless Functions validate JWT via `SUPABASE_SERVICE_ROLE_KEY`
- Invalid or missing JWT returns `401 Unauthorized`
- Public site never accesses authenticated routes

---

## 11. Public Site — Behavior

### Content loading
- On `index.html` load, JS runs `GET /api/content`, `GET /api/creators` and `GET /api/partners` in parallel (`Promise.all`)
- Skeleton loaders shown in dynamic sections during loading
- If a call fails, the section shows fallback content defined in HTML
- Empty fields do not break the layout

### i18n (preparation only)
- All fixed HTML texts use `data-i18n="key"` attributes
- A `STRINGS` object in `main.js` centralizes PT-BR texts
- No language switching in MVP — structure only

---

## 12. Admin Panel — Behavior

### Login (`/admin/index.html`)
- Email + password fields
- Calls `supabase.auth.signInWithPassword()`
- Success: redirects to `/admin/dashboard.html`
- Error: shows "Incorrect email or password"
- Valid JWT in localStorage: redirects directly to dashboard

### Dashboard (`/admin/dashboard.html`)
- Checks authentication on load; if not authenticated, redirects to login
- Loads current content via API to pre-fill fields
- Organized in tabs:
  1. **Hero** — text fields + URLs
  2. **About** — institutional text + big numbers
  3. **Talents** — list with edit/remove + "Add Creator" button
  4. **Partners** — logo grid with remove + "Add Partner" button
  5. **Final CTA** — text fields + URL
  6. **Settings** — contact URL
- **Save** button per tab
- Feedback: success message (green) or error (red) after each save
- **Sign out** button at the top

### Image upload
- `input[type="file"]` accepts `image/*` only
- Preview before saving
- 2MB front-end validation before upload
- On save: calls `POST /api/upload`, receives public URL, saves with other fields

---

## 13. Supabase Keepalive

### Problem
Supabase pauses free-tier projects after 7 days of inactivity.

### Solution
Vercel Cron Job (free on Hobby plan) calling a lightweight endpoint daily.

### `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/keepalive",
      "schedule": "0 9 * * *"
    }
  ],
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ],
  "headers": [
    {
      "source": "/admin/(.*)",
      "headers": [
        { "key": "X-Robots-Tag", "value": "noindex, nofollow" }
      ]
    }
  ]
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

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { error } = await supabase.from('content').select('key').limit(1)
  if (error) return res.status(500).json({ error: error.message })

  return res.status(200).json({ ok: true, timestamp: new Date().toISOString() })
}
```

---

## 14. robots.txt

```
User-agent: *
Disallow: /admin/
```

---

## 15. Recorded Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| Front-end framework | HTML + CSS + vanilla JS | No build step, faster delivery |
| Admin framework | HTML + CSS + vanilla JS | Consistency, no extra dependencies |
| CSS | Tailwind standalone CLI | Scalable, no bundler, compatible with plain HTML |
| CSS units | `rem`/`em` | Responsive and typographic scalability |
| Responsiveness strategy | Mobile-first | Tailwind standard, better progressiveness |
| Mobile menu | Simple dropdown | Simple to implement, no dependencies |
| Database | Supabase Postgres | Free tier, integrated with Auth and Storage |
| Authentication | Supabase Auth | Avoids building auth from scratch |
| Image storage | Supabase Storage | Integrated, automatic public URLs |
| Creator reordering | Numeric `position` field | Drag-and-drop deferred to Phase 2 |
| User management | Via Supabase dashboard | Admin screen deferred to Phase 2 |
| Keepalive | Daily Vercel Cron | Free on Hobby plan, zero extra config |
| WCAG contrast compliance | Not applied in Phase 1 | Figma fidelity takes priority |
