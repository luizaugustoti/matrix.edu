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

## Entregas atuais

- `migrations/001_fundacao.sql`: unidades, pessoas, usuarios, perfis, permissoes, vinculos e auditoria.
- `migrations/002_cursos.sql`: cursos e componentes curriculares.
- `migrations/003_turmas.sql`: turmas e horarios.
- `seeds/002_permissoes_pedagogico.sql`: permissoes de leitura e escrita pedagogica.
- `seeds/001_permissoes_fundacao.sql`: permissoes iniciais para desenvolvimento e homologacao.
- `politicas/001_fundacao_rls.sql`: funcao de autorizacao e politicas de leitura por unidade/permissao.
- `politicas/002_cursos_rls.sql`: politicas de leitura de cursos e componentes.
- `politicas/003_turmas_rls.sql`: politicas de leitura de turmas e horarios.
- `politicas/004_escrita_rls.sql`: policies de insercao para cadastros autorizados.

## Ordem de aplicacao

1. Aplicar `migrations/001_fundacao.sql` no projeto Supabase.
2. Aplicar `seeds/001_permissoes_fundacao.sql`.
3. Aplicar `politicas/001_fundacao_rls.sql`.
4. Aplicar `migrations/002_cursos.sql`.
5. Aplicar `politicas/002_cursos_rls.sql`.
6. Aplicar `migrations/003_turmas.sql`.
7. Aplicar `politicas/003_turmas_rls.sql`.
8. Aplicar `seeds/002_permissoes_pedagogico.sql`.
9. Aplicar `politicas/004_escrita_rls.sql`.

As politicas pressupoem que o schema `auth` do Supabase esteja disponivel. Os
arquivos ainda precisam ser aplicados e validados no projeto de desenvolvimento.

## Procedimento no Supabase

### 1. Abrir o projeto correto

1. Acesse o painel do Supabase.
2. Abra o projeto `xgwnqjokdutagfqfynfz`.
3. Entre em **SQL Editor**.
4. Crie uma nova consulta.

Antes de aplicar alteracoes, confirme que o projeto e o ambiente de
desenvolvimento corretos. Nao cole chaves ou senhas no SQL Editor.

### 2. Aplicar a migration

Abra o arquivo `migrations/001_fundacao.sql`, copie todo o conteudo para uma
consulta nova e clique em **Run**. Aguarde a conclusao sem fechar a pagina.

Essa etapa cria:

- `unidades`;
- `pessoas`;
- `usuarios`;
- `perfis`;
- `permissoes`;
- `usuario_perfis`;
- `perfil_permissoes`;
- `auditoria`.

Se aparecer erro nessa etapa, pare e corrija antes de executar os proximos
arquivos. A tabela `usuarios` depende do schema `auth.users`, que ja existe em
projetos Supabase.

### 3. Aplicar o seed

Abra uma nova consulta, copie `seeds/001_permissoes_fundacao.sql` e clique em
**Run**. O comando usa `on conflict do nothing`, portanto pode ser executado
novamente sem duplicar as permissoes.

### 4. Aplicar as politicas RLS

Abra uma nova consulta, copie `politicas/001_fundacao_rls.sql` e clique em
**Run**. Execute esta etapa somente depois da migration e do seed.

As politicas habilitam RLS e usam `auth.uid()` para relacionar o usuario
autenticado ao registro em `public.usuarios`.

### 5. Verificar as tabelas

No SQL Editor, execute:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
	and table_name in (
		'unidades', 'pessoas', 'usuarios', 'perfis',
		'permissoes', 'usuario_perfis', 'perfil_permissoes', 'auditoria'
	)
order by table_name;
```

O resultado esperado sao oito tabelas.

Verifique tambem o RLS:

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
	and tablename in (
		'unidades', 'pessoas', 'usuarios', 'perfis',
		'permissoes', 'usuario_perfis', 'perfil_permissoes', 'auditoria'
	)
order by tablename;
```

O campo `rowsecurity` deve ser `true` para as oito tabelas.

### 6. Validar pela API

Depois de executar as consultas, reinicie o backend e confira:

```text
GET http://localhost:8000/health/supabase
```

O campo `configured` deve ser `true`. A consulta de `GET /fundacao/unidades`
precisa usar um token valido; sem token, a resposta esperada e `401`.

### Problemas comuns

- `relation public.unidades does not exist`: a migration ainda nao foi executada ou foi executada em outro projeto.
- `relation auth.users does not exist`: a consulta nao esta sendo executada em um projeto Supabase.
- `policy already exists`: a politica ja foi aplicada; nao execute novamente sem revisar a politica existente.
- `permission denied`: confirme que o SQL foi executado no SQL Editor com o usuario administrativo do projeto.
- Resposta `404` na API REST: a tabela ainda nao existe ou o nome do projeto configurado esta incorreto.
