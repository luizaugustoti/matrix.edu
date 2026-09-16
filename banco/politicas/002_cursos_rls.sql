-- RLS de cursos e componentes. Aplicar depois de banco/migrations/002_cursos.sql.

alter table public.cursos enable row level security;
alter table public.componentes_curriculares enable row level security;

create policy cursos_leitura_permitida
    on public.cursos for select
    to authenticated
    using (
        unidade_id in (select u.unidade_id from public.usuarios u where u.id = auth.uid() and u.ativo = true)
        and public.usuario_tem_permissao('cursos', 'listar')
    );

create policy componentes_leitura_permitida
    on public.componentes_curriculares for select
    to authenticated
    using (
        curso_id in (
            select c.id
            from public.cursos c
            join public.usuarios u on u.unidade_id = c.unidade_id
            where u.id = auth.uid() and u.ativo = true
        )
        and public.usuario_tem_permissao('componentes', 'listar')
    );
