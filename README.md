# Site Grupo Farol

Institutional website for Grupo Farol. Public home page + admin panel.

## Stack

- HTML + CSS (Tailwind) + vanilla JavaScript
- Vercel Serverless Functions (Node.js)
- Supabase (Postgres + Auth + Storage)

## Setup

### 1. Environment variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```
SUPABASE_URL=           # Supabase project URL
SUPABASE_ANON_KEY=      # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=  # Supabase service role key (server-side only)
CRON_SECRET=            # Secret for the keepalive cron job
```

### 2. CSS build

Install dependencies and build:

```bash
npm install
npm run build:css
```

To watch for changes during development:

```bash
npm run watch:css
```

### 3. Local development

Use the [Vercel CLI](https://vercel.com/docs/cli) to run locally with serverless functions:

```bash
npm install -g vercel
vercel dev
```

### 4. Deploy

Connect the repository to a Vercel project and set all environment variables in the Vercel dashboard.

## Admin panel

Access at `/admin/`. Credentials are managed via the Supabase dashboard (Authentication → Users).
