-- Turmas e horarios da estrutura pedagogica.

create table if not exists public.turmas (
    id uuid primary key default gen_random_uuid(),
    unidade_id uuid not null references public.unidades(id),
    curso_id uuid not null references public.cursos(id),
    professor_id uuid references public.pessoas(id),
    nome text not null,
    periodo text,
    data_inicio date,
    data_fim date,
    sala text,
    capacidade integer,
    situacao text not null default 'planejada',
    criado_em timestamptz not null default now(),
    atualizado_em timestamptz not null default now(),
    constraint turmas_capacidade_positiva check (capacidade is null or capacidade > 0),
    constraint turmas_datas_validas check (data_fim is null or data_inicio is null or data_fim >= data_inicio),
    constraint turmas_situacao_valida check (situacao in ('planejada', 'aberta', 'em_andamento', 'finalizada', 'cancelada'))
);

create table if not exists public.turma_horarios (
    id uuid primary key default gen_random_uuid(),
    turma_id uuid not null references public.turmas(id) on delete cascade,
    dia_semana smallint not null,
    hora_inicio time not null,
    hora_fim time not null,
    constraint horarios_dia_valido check (dia_semana between 0 and 6),
    constraint horarios_horas_validas check (hora_fim > hora_inicio),
    unique (turma_id, dia_semana, hora_inicio)
);

create index if not exists turmas_unidade_idx on public.turmas (unidade_id);
create index if not exists turmas_curso_idx on public.turmas (curso_id);
create index if not exists turmas_professor_idx on public.turmas (professor_id);
create index if not exists turma_horarios_turma_idx on public.turma_horarios (turma_id);
