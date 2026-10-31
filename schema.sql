-- LexTramita / BuroAI - esquema Supabase
create extension if not exists vector;
create extension if not exists pgcrypto;

-- Usuarios (perfil ligado a auth.users)
create table if not exists public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  nombre text,
  rol text not null default 'autonomo' check (rol in ('autonomo', 'gestoria', 'admin')),
  plan text not null default 'expediente' check (plan in ('expediente', 'gestoria')),
  created_at timestamptz not null default now()
);

-- Expedientes
create table if not exists public.expedientes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  cliente_nombre text not null,
  tipo_negocio text not null,
  municipio text not null,
  estado text not null default 'borrador'
    check (estado in ('borrador', 'documentacion', 'revision', 'presentado', 'aprobado', 'rechazado')),
  progreso smallint not null default 0 check (progreso between 0 and 100),
  datos jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists expedientes_usuario_idx on public.expedientes (usuario_id, estado);

-- Ordenanzas municipales y boletines (RAG)
create table if not exists public.ordenanzas_municipales (
  id uuid primary key default gen_random_uuid(),
  fuente text not null,                 -- BOE | BORM | BOCM | AYTO
  external_id text not null,            -- identificador oficial (p.ej. BOE-A-2026-1234)
  municipio text,                       -- null = ambito estatal/autonomico
  titulo text not null,
  contenido text not null,
  url text,
  fecha_publicacion date not null,
  vigente boolean not null default true,
  embedding vector(1536),
  created_at timestamptz not null default now(),
  unique (fuente, external_id)
);
create index if not exists ordenanzas_embedding_hnsw
  on public.ordenanzas_municipales using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);
create index if not exists ordenanzas_municipio_idx on public.ordenanzas_municipales (municipio, vigente);

-- Busqueda semantica
create or replace function public.match_ordenanzas(
  query_embedding vector(1536),
  match_threshold float default 0.3,
  match_count int default 5,
  filter_municipio text default null
)
returns table (
  id uuid, fuente text, external_id text, municipio text, titulo text,
  contenido text, url text, fecha_publicacion date, similarity float
)
language sql stable as $$
  select o.id, o.fuente, o.external_id, o.municipio, o.titulo, o.contenido, o.url,
         o.fecha_publicacion, 1 - (o.embedding <=> query_embedding) as similarity
  from public.ordenanzas_municipales o
  where o.vigente
    and o.embedding is not null
    and (filter_municipio is null or o.municipio is null or lower(o.municipio) = lower(filter_municipio))
    and 1 - (o.embedding <=> query_embedding) > match_threshold
  order by o.embedding <=> query_embedding
  limit match_count;
$$;

-- RLS
alter table public.usuarios enable row level security;
alter table public.expedientes enable row level security;
alter table public.ordenanzas_municipales enable row level security;

drop policy if exists "usuarios_self" on public.usuarios;
create policy "usuarios_self" on public.usuarios for select using (auth.uid() = id);
drop policy if exists "expedientes_owner_all" on public.expedientes;
create policy "expedientes_owner_all" on public.expedientes for all
  using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);
drop policy if exists "ordenanzas_read" on public.ordenanzas_municipales;
create policy "ordenanzas_read" on public.ordenanzas_municipales for select using (true);
-- Escrituras en ordenanzas: solo service_role (cron), que ignora RLS.

-- ===== v2: pagos, leads de partners, log de ingesta =====
create table if not exists public.pagos (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,            -- id del evento Stripe (idempotencia)
  tipo text not null check (tipo in ('expediente', 'suscripcion')),
  plan text,
  email text,
  importe_cents integer not null default 0,
  estado text not null,
  stripe_session_id text,
  stripe_customer_id text,
  created_at timestamptz not null default now()
);
create table if not exists public.partner_leads (
  id uuid primary key default gen_random_uuid(),
  partner text not null check (partner in ('seguro_rc', 'prl')),
  email text not null,
  negocio text,
  ciudad text,
  created_at timestamptz not null default now()
);
create table if not exists public.ingesta_log (
  id uuid primary key default gen_random_uuid(),
  boe integer not null default 0,
  feeds integer not null default 0,
  simulados integer not null default 0,
  upserted integer not null default 0,
  embedded integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.pagos enable row level security;
alter table public.partner_leads enable row level security;
alter table public.ingesta_log enable row level security;
-- Sin politicas: solo accesibles con service_role (servidor).
