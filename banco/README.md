# Banco de Dados (Supabase + PostgreSQL)

Esta pasta organiza tudo que envolve estrutura e seguranca de dados.

## O que deve ficar aqui
- Migrations de estrutura
- Seeds de dados iniciais
- Politicas de seguranca (RLS)

## O que nao deve ficar aqui
- Codigo de interface (React)
- Regras de negocio da API
- Credenciais reais

## Estrutura
```
banco/
├── migrations/
├── seeds/
├── politicas/
└── README.md
```

## Explicacao das pastas

### migrations/
Alteracoes estruturais do banco (tabelas, colunas, indices, constraints).

### seeds/
Dados iniciais ou dados utilitarios para testes e desenvolvimento.

### politicas/
Politicas de seguranca do Supabase/PostgreSQL, especialmente RLS.

## Quem normalmente trabalha aqui
- Estudantes que atuam em dados e back-end.

## Como conecta com o sistema
Back-end consome as tabelas do PostgreSQL via Supabase; RLS protege acesso aos dados conforme usuario/perfil.
