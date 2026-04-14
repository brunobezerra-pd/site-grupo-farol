# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Site institucional do **Grupo Farol** — maior agência de creators da América Latina. Composto por uma home pública com conteúdo dinâmico e um painel admin para edição de conteúdo sem código.

**Stack:** HTML + CSS + JS puro · Tailwind CSS CLI standalone · Vercel Serverless Functions · Supabase (Postgres + Auth + Storage)

---

## Build Commands

```bash
# Gerar output.css (produção, minificado)
npm run build:css
# tailwindcss -i ./tailwind.input.css -o ./assets/css/output.css --minify

# Watch durante desenvolvimento
npm run watch:css
# tailwindcss -i ./tailwind.input.css -o ./assets/css/output.css --watch
```

> `assets/css/output.css` é gerado pelo Tailwind CLI — nunca editar manualmente.

**Deploy:** Vercel (push para main). Variáveis de ambiente configuradas no painel da Vercel.

---

## Architecture

### Fluxo de dados — site público

`index.html` carrega → `main.js` faz `Promise.all` com três chamadas paralelas:
- `GET /api/content` → preenche Hero, Sobre, CTA Final
- `GET /api/creators` → alimenta `slider.js`
- `GET /api/partners` → renderiza grid de parceiros

Skeleton loaders ficam ativos até as chamadas resolverem. Falhas individuais exibem fallback sem quebrar o restante da página.

### Fluxo de dados — painel admin

`/admin/index.html` → login via Supabase Auth → JWT salvo em `localStorage` → `/admin/dashboard.html` verifica JWT ao carregar → chamadas de escrita enviam `Authorization: Bearer <token>` → Serverless Functions validam o JWT via `SUPABASE_SERVICE_ROLE_KEY`.

### Serverless Functions (`/api`)

Cada arquivo exporta um único handler que roteia por `req.method`. Rotas de escrita sempre validam o JWT antes de qualquer operação no banco.

| Arquivo | Responsabilidade |
|---|---|
| `content.js` | GET/POST da tabela `content` (pares key/value) |
| `creators.js` | CRUD completo da tabela `creators` |
| `partners.js` | GET/POST/DELETE da tabela `partners` |
| `upload.js` | Upload para Supabase Storage, retorna URL pública |
| `keepalive.js` | Cron diário (09h UTC) que previne pausa do Supabase free tier |

### Frontend JS

| Arquivo | Responsabilidade |
|---|---|
| `assets/js/main.js` | Orquestra `Promise.all`, skeleton loaders, i18n stub (`STRINGS`), distribui dados para seções |
| `assets/js/slider.js` | Renderiza cards de creators, navegação por setas, swipe touch, loop infinito |
| `assets/js/admin.js` | Lógica do dashboard: abas, formulários, uploads, feedback de sucesso/erro |

---

## Banco de Dados (Supabase)

### Tabelas

**`content`** — pares `key TEXT PRIMARY KEY / value TEXT`. Chaves gerenciáveis: `hero_headline`, `hero_subheadline`, `hero_cta1_text`, `hero_cta1_url`, `hero_cta2_text`, `hero_cta2_url`, `about_text`, `about_stat1_value`, `about_stat1_label` (idem stat2, stat3), `cta_final_text`, `cta_final_subtext`, `cta_final_btn_text`, `cta_final_btn_url`, `contact_url`.

**`creators`** — `id UUID`, `name`, `category`, `photo_url`, `instagram_url`, `youtube_url`, `tiktok_url`, `position INTEGER`, `created_at`. Ordenado por `position ASC`.

**`partners`** — `id UUID`, `name`, `logo_url`, `created_at`. Ordenado por `created_at ASC`.

### Storage buckets

- `creators` — fotos dos talentos (leitura pública, escrita via service role)
- `partners` — logos dos parceiros (leitura pública, escrita via service role)

---

## Variáveis de Ambiente

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=          # usado no front (Supabase JS SDK)
SUPABASE_SERVICE_ROLE_KEY=  # apenas nas Serverless Functions
CRON_SECRET=                # validado no header x-cron-secret do keepalive
```

`SUPABASE_SERVICE_ROLE_KEY` e `CRON_SECRET` nunca chegam ao front-end.

---

## Tailwind & Tipografia

**Fontes locais** declaradas em `tailwind.input.css` via `@font-face`: `Agharti` (variável, headlines), `Casual Human` (acento de marca), `Foun` (destaques editoriais).  
**Google Fonts:** `Poppins` (corpo/UI/admin) e `PT Serif` (subtítulos editoriais).

**Tailwind config** estende: `fontFamily` (agharti, casual, foun, serif→PT Serif, sans→Poppins), `colors` (vermelho `#C0392B`, bege `#F5ECD7`, preto `#1A1A1A` — validar com Figma), `screens` padrão (sm 640, md 768, lg 1024, xl 1280).

---

## Decisões Importantes

- **Mobile-first:** estilos base para mobile, sobrescritos com `md:` e `lg:`.
- **Conformidade WCAG de contraste desativada na Fase 1** — fidelidade ao Figma tem prioridade.
- **Reordenação de creators** via campo numérico `position` (sem drag-and-drop — Fase 2).
- **Gestão de usuários admin** feita diretamente no dashboard do Supabase (sem tela no produto — Fase 2).
- **i18n:** textos fixos do HTML usam `data-i18n="chave"` e objeto `STRINGS` em `main.js` — sem troca de idioma ativa na Fase 1.
- **Admin não indexável:** `robots.txt` bloqueia `/admin/` + header `X-Robots-Tag: noindex, nofollow` via `vercel.json`.

---

## Ordem de Implementação

Issues sequenciais (cada uma depende da anterior): Setup (01) → DB schema (02) → Serverless Functions (03–07) → Admin (08–12) → Site público (13–21) → QA/deploy (22). Ver `ISSUES.md` para detalhes de cada issue.
