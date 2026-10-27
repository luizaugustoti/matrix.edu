# Migrations Pendentes

As migrations abaixo estao versionadas no repositorio, mas a aplicacao no
projeto Supabase sera feita posteriormente, em uma etapa controlada.

## Ordem de aplicacao

### Fundacao

- [ ] `banco/migrations/001_fundacao.sql`
- [ ] `banco/seeds/001_permissoes_fundacao.sql`
- [ ] `banco/politicas/001_fundacao_rls.sql`

Cria unidades, pessoas, usuarios, perfis, permissoes, vinculos, auditoria e
as politicas iniciais de acesso.

### Cursos e componentes

- [ ] `banco/migrations/002_cursos.sql`
- [ ] `banco/politicas/002_cursos_rls.sql`

Cria cursos e componentes curriculares com suas regras de leitura por unidade.

### Turmas e horarios

- [ ] `banco/migrations/003_turmas.sql`
- [ ] `banco/politicas/003_turmas_rls.sql`

Cria turmas, horarios, capacidade, professor responsavel e situacoes da turma.

### Autorizacao de escrita

- [ ] `banco/seeds/002_permissoes_pedagogico.sql`
- [ ] `banco/politicas/004_escrita_rls.sql`

Adiciona permissoes pedagogicas e libera insercoes somente para usuarios
autenticados com a acao correspondente.

## Estado atual

- Migrations escritas e revisadas no repositorio.
- Fundacao ja foi aplicada anteriormente no projeto Supabase e as oito tabelas
  foram confirmadas via API REST.
- A aplicacao das migrations `002` e `003` sera repetida/confirmada somente na
  etapa final de sincronizacao do banco.
- Nenhuma migration nova deve ser marcada como aplicada apenas por existir no Git.
- O seed `002` e a policy `004` dependem da fundacao, dos cursos e das turmas.

## Procedimento quando formos aplicar

1. Fazer backup ou confirmar que o ambiente e de desenvolvimento.
2. Executar os arquivos na ordem acima no SQL Editor do Supabase.
3. Marcar cada item como concluido somente depois de executar sem erro.
4. Consultar `information_schema.tables` para confirmar as tabelas.
5. Verificar `rowsecurity` das tabelas protegidas.
6. Testar a API com usuario autenticado.
7. Registrar data, ambiente e resultado nesta lista.

## Regra de controle

O nome do arquivo e a ordem de aplicacao devem permanecer estaveis. Qualquer
alteracao estrutural nova deve receber um novo numero de migration, sem editar
uma migration que ja tenha sido aplicada em algum ambiente.
