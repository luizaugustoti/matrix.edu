# ⚡ O QUE FAZER AGORA?

## Situação Atual
✅ Login funcionando
✅ Usuário teste criado
✅ Unidade "Campus Central" criada
❌ Tabelas de Cursos/Turmas não existem (migrations faltando)

## Solução: 2 CLIQUES NO SUPABASE 🖱️

### PASSO 1: Abra o Supabase
- URL: https://app.supabase.com/project/xgwnqjokdutagfqfynfz/sql/editor
- Faça login se pedir

### PASSO 2: Copie este SQL

```sql
-- MIGRATION 002: CURSOS
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

### PASSO 3: Cola no Supabase SQL Editor
- Clique na caixa de texto
- Cola (Ctrl+V)
- Clica em "Executar" (ou Ctrl+Shift+Enter)

### PASSO 4: Espera ficar verde ✅

Se vira verde = sucesso!
Se ficar vermelho = copia e cola de novo (pode ser que cortou)

### PASSO 5: Limpa e faz de novo com Migration 003

```sql
-- MIGRATION 003: TURMAS
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

## DEPOIS DISSO

Terminal do backend:
```
python scripts/inserir_dados_simples.py
```

Isso insere:
- Campus Central ✅
- Técnico em Informática (Curso)
- Programação em Python (Componente)
- Turma 2026.1
- Horários (seg, qua, sex 09:00)

## VALIDAÇÃO

Abra: http://localhost:5173
Login: teste@instituicao.edu.br / SenhaForte123!

Vai aparecer "Campus Central" e dados de Cursos/Turmas.

---

**⏱️ Tempo total: ~5 minutos**

Qualquer dúvida, leia: `documentos/GUIA_APLICAR_MIGRATIONS_PASSO_A_PASSO.md`
