-- Permissoes iniciais para desenvolvimento e homologacao.
-- Perfis e atribuicoes de usuarios devem ser criados pela administracao.

insert into public.permissoes (recurso, acao, descricao)
values
    ('unidades', 'listar', 'Visualizar unidades permitidas'),
    ('pessoas', 'listar', 'Visualizar pessoas da unidade permitida'),
    ('pessoas', 'criar', 'Cadastrar pessoas'),
    ('pessoas', 'editar', 'Alterar dados de pessoas'),
    ('usuarios', 'listar', 'Visualizar usuarios'),
    ('usuarios', 'editar', 'Alterar usuarios e atribuicoes'),
    ('perfis', 'listar', 'Visualizar perfis'),
    ('perfis', 'editar', 'Alterar perfis'),
    ('permissoes', 'listar', 'Visualizar permissoes'),
    ('auditoria', 'listar', 'Consultar auditoria')
on conflict (recurso, acao) do nothing;
