-- Fundacao compartilhada do Sistema EFG.
-- Depende do schema auth do Supabase.

create extension if not exists "pgcrypto";

create table if not exists public.unidades (
    id uuid primary key default gen_random_uuid(),
    nome text not null,
    codigo text not null unique,
    ativo boolean not null default true,
    criado_em timestamptz not null default now(),
    atualizado_em timestamptz not null default now()
);

create table if not exists public.pessoas (
    id uuid primary key default gen_random_uuid(),
    unidade_id uuid not null references public.unidades(id),
    nome_completo text not null,
    cpf text,
    email text,
    telefone text,
    ativo boolean not null default true,
    criado_em timestamptz not null default now(),
    atualizado_em timestamptz not null default now(),
    constraint pessoas_cpf_nao_vazio check (cpf is null or length(trim(cpf)) > 0)
);

create unique index if not exists pessoas_cpf_unico
    on public.pessoas (cpf)
    where cpf is not null and ativo = true;

create table if not exists public.usuarios (
    id uuid primary key references auth.users(id) on delete restrict,
    pessoa_id uuid not null unique references public.pessoas(id),
    unidade_id uuid not null references public.unidades(id),
    ativo boolean not null default true,
    criado_em timestamptz not null default now(),
    atualizado_em timestamptz not null default now()
);

create table if not exists public.perfis (
    id uuid primary key default gen_random_uuid(),
    nome text not null unique,
    descricao text,
    ativo boolean not null default true,
    criado_em timestamptz not null default now()
);

create table if not exists public.permissoes (
    id uuid primary key default gen_random_uuid(),
    recurso text not null,
    acao text not null,
    descricao text,
    unique (recurso, acao)
);

create table if not exists public.usuario_perfis (
    usuario_id uuid not null references public.usuarios(id) on delete cascade,
    perfil_id uuid not null references public.perfis(id) on delete restrict,
    criado_em timestamptz not null default now(),
    primary key (usuario_id, perfil_id)
);

create table if not exists public.perfil_permissoes (
    perfil_id uuid not null references public.perfis(id) on delete cascade,
    permissao_id uuid not null references public.permissoes(id) on delete restrict,
    primary key (perfil_id, permissao_id)
);

create table if not exists public.auditoria (
    id uuid primary key default gen_random_uuid(),
    unidade_id uuid references public.unidades(id),
    usuario_id uuid references public.usuarios(id),
    recurso text not null,
    recurso_id uuid,
    acao text not null,
    valor_anterior jsonb,
    valor_novo jsonb,
    criado_em timestamptz not null default now()
);

create index if not exists pessoas_unidade_idx on public.pessoas (unidade_id);
create index if not exists usuarios_unidade_idx on public.usuarios (unidade_id);
create index if not exists auditoria_recurso_idx on public.auditoria (recurso, recurso_id);
create index if not exists auditoria_unidade_idx on public.auditoria (unidade_id, criado_em desc);

comment on table public.unidades is 'Unidades institucionais atendidas pelo sistema.';
comment on table public.pessoas is 'Cadastro central de alunos, professores, funcionarios e responsaveis.';
comment on table public.usuarios is 'Vinculo entre uma pessoa e uma conta autenticada do Supabase.';
comment on table public.auditoria is 'Historico de operacoes relevantes sem apagar o estado anterior.';
