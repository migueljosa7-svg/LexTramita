# LexTramita (BuroAI)

SaaS de licencias de apertura y trámites para autónomos y gestorías, con normativa municipal actualizada a diario (RAG sobre Supabase pgvector).

## Puesta en marcha
1. `npm install`
2. Copia `.env.example` a `.env.local` y rellénalo.
3. Ejecuta `schema.sql` en el SQL Editor de Supabase (es idempotente).
4. `npm run dev`

## Rutas API
- `POST /api/viability` – diagnóstico de viabilidad (RAG filtrado por municipio).
- `POST /api/plans/analyze` – análisis de planos con visión.
- `POST /api/checkout` y `POST /api/webhooks/stripe` – pagos.
- `POST /api/partners/lead` – leads de partners.
- `GET /api/cron/update-laws` – ingesta diaria (Vercel Cron, requiere `Bearer CRON_SECRET`).

Los boletines BORM/BOCM usan datos simulados salvo que configures `BULLETIN_FEEDS`.
