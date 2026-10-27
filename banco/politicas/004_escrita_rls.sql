-- Policies de escrita para a fundacao pedagogica.
-- Aplicar depois das migrations, seeds e policies anteriores.

create policy unidades_criacao_permitida
    on public.unidades for insert
    to authenticated
    with check (public.usuario_tem_permissao('unidades', 'criar'));

create policy pessoas_criacao_permitida
    on public.pessoas for insert
    to authenticated
    with check (
        unidade_id in (select u.unidade_id from public.usuarios u where u.id = auth.uid() and u.ativo = true)
        and public.usuario_tem_permissao('pessoas', 'criar')
    );

create policy cursos_criacao_permitida
    on public.cursos for insert
    to authenticated
    with check (
        unidade_id in (select u.unidade_id from public.usuarios u where u.id = auth.uid() and u.ativo = true)
        and public.usuario_tem_permissao('cursos', 'criar')
    );

create policy componentes_criacao_permitida
    on public.componentes_curriculares for insert
    to authenticated
    with check (
        curso_id in (
            select c.id from public.cursos c
            join public.usuarios u on u.unidade_id = c.unidade_id
            where u.id = auth.uid() and u.ativo = true
        )
        and public.usuario_tem_permissao('componentes', 'criar')
    );

create policy turmas_criacao_permitida
    on public.turmas for insert
    to authenticated
    with check (
        unidade_id in (select u.unidade_id from public.usuarios u where u.id = auth.uid() and u.ativo = true)
        and public.usuario_tem_permissao('turmas', 'criar')
    );

create policy horarios_criacao_permitida
    on public.turma_horarios for insert
    to authenticated
    with check (
        turma_id in (
            select t.id from public.turmas t
            join public.usuarios u on u.unidade_id = t.unidade_id
            where u.id = auth.uid() and u.ativo = true
        )
        and public.usuario_tem_permissao('horarios', 'criar')
    );
