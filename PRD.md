# PRD — Grupo Farol Institutional Website

**Version:** 1.2  
**Status:** Approved for implementation  
**Date:** April 2026  
**Changelog v1.2:** Added RNF06 — continuous database availability.  
**Changelog v1.1:** Scope revised for same-day delivery. Removed audit log, multiple users, and drag-and-drop. Authentication simplified to single login. User management delegated to Supabase dashboard.

---

## 1. Context and Objective

Grupo Farol is the largest creator agency in Latin America. The institutional website is the main entry point for brands seeking partnerships and for talents who want to join the casting.

The goal of this project is to build the home page faithful to the approved Figma design, with a simple admin panel that allows Farol's creative team to update content without depending on a developer.

---

## 2. Target Audience

### Website visitors
- Brands seeking creator partnerships
- Creators interested in joining the casting
- Press and institutional partners

### Admin panel users
- Grupo Farol creative team (shared single login)
- Technical level: non-technical — the interface must be simple and error-tolerant

### Super admin (outside the product)
- Project technical lead
- Manages users directly via Supabase dashboard (create, revoke, change password)
- No dedicated screen required in MVP

---

## 3. Scope — Phase 1 (this delivery)

### 3.1 Public website (Home)

| Section | Description |
|---|---|
| Header | Logo + navigation menu (Sobre, Como Trabalhamos, Talentos, Contatos, Fale Conosco) |
| Hero | Main headline, subheadline, two CTAs (Conheça Nossos Creators / Fale com o Farol) |
| About | Institutional text + three big numbers (+200 Creators, +1000 Projects, +1000 Clients) |
| Creators | "Mais de 200 Creators" callout + category tags (Humor & Criatividade, Gastronomia, etc.) |
| Featured Talents | Slider with creator cards (photo, name, category, social media) |
| How We Work | Four methodology blocks with icon, title and text |
| Partners | Grid of client/partner logos |
| Final CTA | Two-column section — text/CTA on the left, placeholder on the right (image or video, TBD) |
| Footer | TBD |

### 3.2 Admin Panel

CMS-manageable fields:

| Section | What is editable |
|---|---|
| Hero | Headline, subheadline, button texts and their URLs |
| About | Institutional text, values of the three big numbers and their labels |
| Featured Talents | Add/edit/remove creators (name, photo, category, social media links, numeric order) |
| Partners | Add/remove partner logos (image upload + brand name) |
| Final CTA | Text, subtext, button text and button URL |
| Contact | Destination of "Fale com o Farol" button (WhatsApp, email or external URL — TBD with client) |

Fields **not editable** via CMS (require deploy):
- Layout and design structure
- Navigation menu
- "How We Work" section (fixed texts for now)
- Creator category tags

---

## 4. Functional Requirements

### Public website
- FR01 — The website must be faithful to the approved Figma design
- FR02 — Dynamic content must be loaded from Supabase at render time
- FR03 — The Talents slider must work on desktop and mobile (touch)
- FR04 — The website must be responsive for mobile, tablet and desktop
- FR05 — The text structure must be prepared for future internationalization (i18n), without implementation in Phase 1

### Admin Panel
- FR06 — Access protected by email + password authentication, managed via Supabase Auth
- FR07 — Single shared login for the Farol team; user creation and management done by super admin via Supabase dashboard
- FR08 — Image upload (creator photos and partner logos) stored in Supabase Storage
- FR09 — Creator reordering via numeric position field (no drag-and-drop in MVP)
- FR10 — Visual feedback of confirmation on save and error on failure

---

## 5. Non-Functional Requirements

- NFR01 — Stack: HTML + CSS + vanilla JavaScript on front and admin; Vercel Serverless Functions on back; Supabase (Postgres + Auth + Storage) as data platform
- NFR02 — Deploy on Vercel, domain to be connected after delivery
- NFR03 — Performance: public website must achieve Lighthouse score ≥ 85 on performance
- NFR04 — Security: admin panel must not be indexable by search engines (robots.txt + meta noindex)
- NFR05 — Project must use environment variables for all credentials (never hardcoded)
- NFR06 — The project must ensure continuous database availability, preventing automatic pauses due to inactivity

---

## 6. Out of Scope — Phase 1

- Internal pages (Sobre, Talentos, Como Trabalhamos, Contatos)
- Individual creator profile page
- Blog or content area
- Active internationalization (EN/ES)
- Social media integration (automatic feed)
- Custom contact form system
- Multiple users with differentiated access levels *(Phase 2)*
- Content change audit log *(Phase 2)*
- Drag-and-drop for creator reordering *(Phase 2)*
- User management screen inside the product *(Phase 2)*

---

## 7. Open Decisions

| # | Decision | Owner | Deadline |
|---|---|---|---|
| D01 | Destination of "Fale com o Farol" button (WhatsApp, email or external URL) | Client | Before Hero implementation |
| D02 | Content of the placeholder in Final CTA section (image or video) | Client | Can be delivered with placeholder |
| D03 | Initial list of creators to populate the slider | Client | Before production deploy |
| D04 | Initial list of partner logos | Client | Before production deploy |

---

## 8. Acceptance Criteria (Phase 1)

- [ ] Home renders correctly in Chrome, Safari and Firefox (desktop and mobile)
- [ ] Talent slider content is manageable via admin without touching code
- [ ] Partner logos are manageable via admin without touching code
- [ ] About section big numbers are editable via admin
- [ ] Image upload works and images appear on the site after saving
- [ ] The site does not break if an optional field is empty
- [ ] Credentials are not exposed in the source code
- [ ] Admin panel is not indexable by search engines

---

## 9. References

- Design: Figma (to be shared)
- Stack reference: Vercel Docs, Supabase Docs
- Visual identity: as per approved Figma (beige/red/black palette, bold display typography)
