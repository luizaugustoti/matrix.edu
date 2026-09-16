-- Permissoes de cursos, componentes, turmas e horarios.

insert into public.permissoes (recurso, acao, descricao)
values
    ('unidades', 'criar', 'Cadastrar unidades'),
    ('cursos', 'listar', 'Visualizar cursos da unidade'),
    ('cursos', 'criar', 'Cadastrar cursos'),
    ('cursos', 'editar', 'Alterar cursos'),
    ('componentes', 'listar', 'Visualizar componentes curriculares'),
    ('componentes', 'criar', 'Cadastrar componentes curriculares'),
    ('componentes', 'editar', 'Alterar componentes curriculares'),
    ('turmas', 'listar', 'Visualizar turmas da unidade'),
    ('turmas', 'criar', 'Cadastrar turmas'),
    ('turmas', 'editar', 'Alterar turmas'),
    ('horarios', 'listar', 'Visualizar horarios das turmas'),
    ('horarios', 'criar', 'Cadastrar horarios')
on conflict (recurso, acao) do nothing;
