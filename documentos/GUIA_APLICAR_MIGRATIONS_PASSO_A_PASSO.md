# 📋 Guia: Aplicar Migrations no Supabase

## Passo 1: Abrir o SQL Editor
Acesse: https://app.supabase.com/project/xgwnqjokdutagfqfynfz/sql/editor

## Passo 2: Executar Migration 002 (Cursos e Componentes)

Copie e cole o SQL abaixo no SQL Editor e clique em "Executar":

```sql
-- Migration 002: Cursos e Componentes
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
```

## Passo 3: Executar Migration 003 (Turmas e Horários)

Limpe o editor (Ctrl+A, Delete) e cole o SQL abaixo:

```sql
-- Migration 003: Turmas e Horários
create table if not exists public.turmas (
    id uuid primary key default gen_random_uuid(),
    unidade_id uuid not null references public.unidades(id),
    curso_id uuid not null references public.cursos(id),
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
    constraint turmas_situacao_valida check (situacao in ('planejada', 'ativa', 'finalizada')),
    unique (unidade_id, curso_id, nome, periodo)
);

create table if not exists public.turma_horarios (
    id uuid primary key default gen_random_uuid(),
    turma_id uuid not null references public.turmas(id) on delete cascade,
    dia_semana integer not null,
    hora_inicio time,
    hora_fim time,
    criado_em timestamptz not null default now(),
    constraint turma_horarios_dia_valido check (dia_semana >= 0 and dia_semana <= 6),
    unique (turma_id, dia_semana, hora_inicio)
);

create index if not exists turmas_unidade_idx on public.turmas (unidade_id);
create index if not exists turmas_curso_idx on public.turmas (curso_id);
create index if not exists turma_horarios_turma_idx on public.turma_horarios (turma_id);
```

## Passo 4: Verificar Sucesso

Se não houver erros, as tabelas foram criadas com sucesso! ✅

## Passo 5: Continuar com Script de Dados

Após as migrations serem aplicadas, execute no terminal do backend:

```bash
python scripts/inserir_dados_simples.py
```

Isso vai:
1. Inserir Campus Central
2. Associar usuário teste ao campus
3. Criar cursos e componentes
4. Criar turmas e horários

## Status Atual

- ✅ Migration 001 (Fundação): Já aplicada ao criar o projeto
- ⏳ Migration 002 (Cursos): Aguardando aplicação manual
- ⏳ Migration 003 (Turmas): Aguardando aplicação manual
- ⏳ Dados de teste: Aguardando migrations
