# Site Institucional — Grupo Farol

Home pública com conteúdo dinâmico + painel admin para edição sem código.

**Stack:** HTML + CSS + JS puro · Tailwind CSS · Vercel Serverless Functions · Supabase

---

## Setup inicial

### 1. Clonar e instalar dependências

```bash
npm install
```

### 2. Variáveis de ambiente

Copie o exemplo e preencha com suas credenciais do Supabase:

```bash
cp .env.local.example .env.local
```

| Variável | Onde encontrar |
|---|---|
| `SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API → anon/public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API → service_role (secret) |
| `CRON_SECRET` | Gere um segredo aleatório (ex: `openssl rand -hex 32`) |

> `SUPABASE_SERVICE_ROLE_KEY` e `CRON_SECRET` nunca chegam ao front-end. São usados apenas nas Serverless Functions.

### 3. Banco de dados (Supabase SQL Editor)

No Supabase Dashboard, acesse **SQL Editor** e execute os dois scripts abaixo, nesta ordem:

**Passo 3a — Criar tabelas** (`sql/01_schema.sql`)

```sql
-- cole o conteúdo de sql/01_schema.sql aqui
```

Cria as tabelas `content`, `creators` e `partners`, além do índice de ordenação dos creators.

**Passo 3b — Seed inicial** (`sql/02_seed.sql`)

```sql
-- cole o conteúdo de sql/02_seed.sql aqui
```

Insere os 18 campos editáveis da tabela `content` com valores placeholder em PT-BR. Substitua os campos marcados com `⚠️` após decisão do cliente (ver seção "Decisões em aberto").

### 4. Storage buckets

No Supabase Dashboard, acesse **Storage** e crie dois buckets:

| Bucket | Configuração |
|---|---|
| `creators` | Ative **Public bucket** (leitura pública) |
| `partners` | Ative **Public bucket** (leitura pública) |

> Escrita nos buckets é feita exclusivamente via `SUPABASE_SERVICE_ROLE_KEY` pelas Serverless Functions — nunca pelo front-end.

### 5. Usuário admin

No Supabase Dashboard, acesse **Authentication → Users** e clique em **Add user**.

Crie o usuário com o e-mail e senha que a equipe Farol utilizará para acessar o painel admin.

> Gestão de usuários (criar, revogar, trocar senha) é responsabilidade do técnico via dashboard do Supabase. Não há tela de gestão de usuários no produto (Fase 2).

### 6. Variáveis de ambiente na Vercel

No painel da Vercel, acesse **Project Settings → Environment Variables** e adicione as mesmas variáveis do `.env.local`:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`

---

## Desenvolvimento local

```bash
# Gerar CSS (uma vez)
npm run build:css

# Watch mode (durante desenvolvimento)
npm run watch:css
```

Para testar as Serverless Functions localmente, use a [Vercel CLI](https://vercel.com/docs/cli):

```bash
npx vercel dev
```

---

## Deploy na Vercel

1. Importe o repositório na Vercel (New Project → Import Git Repository)
2. Configure as variáveis de ambiente em **Project Settings → Environment Variables**
3. Após o deploy, verifique em **Project Settings → Cron Jobs** que o job `/api/keepalive` aparece agendado para `0 9 * * *`

---

## Decisões em aberto (aguardando cliente)

| # | Decisão | Impacto |
|---|---|---|
| D01 | Destino do botão "Fale com o Farol" — WhatsApp, e-mail ou URL externa | Atualizar `contact_url`, `hero_cta2_url` e `cta_final_btn_url` no seed |
| D02 | Conteúdo do placeholder na seção CTA Final — imagem ou vídeo | Layout da coluna direita do CTA Final |
| D03 | Lista inicial de creators para popular o slider | Necessário antes do deploy em produção |
| D04 | Lista inicial de logos de parceiros | Necessário antes do deploy em produção |
