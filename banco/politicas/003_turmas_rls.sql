-- RLS de turmas e horarios.

alter table public.turmas enable row level security;
alter table public.turma_horarios enable row level security;

create policy turmas_leitura_permitida
    on public.turmas for select
    to authenticated
    using (
        unidade_id in (select u.unidade_id from public.usuarios u where u.id = auth.uid() and u.ativo = true)
        and public.usuario_tem_permissao('turmas', 'listar')
    );

create policy turma_horarios_leitura_permitida
    on public.turma_horarios for select
    to authenticated
    using (
        turma_id in (
            select t.id
            from public.turmas t
            join public.usuarios u on u.unidade_id = t.unidade_id
            where u.id = auth.uid() and u.ativo = true
        )
        and public.usuario_tem_permissao('turmas', 'listar')
    );
