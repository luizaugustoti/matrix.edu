-- Cursos e componentes curriculares da fundacao pedagogica.

create table if not exists public.cursos (
    id uuid primary key default gen_random_uuid(),
    unidade_id uuid not null references public.unidades(id),
    nome text not null,
    codigo text not null,
    tipo text not null,
    duracao_dias integer,
    carga_horaria integer,
    situacao text not null default 'ativo',
    criado_em timestamptz not null default now(),
    atualizado_em timestamptz not null default now(),
    constraint cursos_duracao_positiva check (duracao_dias is null or duracao_dias > 0),
    constraint cursos_carga_horaria_positiva check (carga_horaria is null or carga_horaria > 0),
    constraint cursos_situacao_valida check (situacao in ('ativo', 'inativo')),
    unique (unidade_id, codigo)
);

create table if not exists public.componentes_curriculares (
    id uuid primary key default gen_random_uuid(),
    curso_id uuid not null references public.cursos(id),
    nome text not null,
    codigo text not null,
    carga_horaria integer,
    competencias text[] not null default '{}',
    ativo boolean not null default true,
    criado_em timestamptz not null default now(),
    atualizado_em timestamptz not null default now(),
    constraint componentes_carga_positiva check (carga_horaria is null or carga_horaria > 0),
    unique (curso_id, codigo)
);

create index if not exists cursos_unidade_idx on public.cursos (unidade_id);
create index if not exists componentes_curso_idx on public.componentes_curriculares (curso_id);
