-- RLS da fundacao. Aplicar depois de banco/migrations/001_fundacao.sql.

create or replace function public.usuario_tem_permissao(
    recurso_consultado text,
    acao_consultada text
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
    select exists (
        select 1
        from public.usuarios u
        join public.usuario_perfis up on up.usuario_id = u.id
        join public.perfil_permissoes pp on pp.perfil_id = up.perfil_id
        join public.permissoes p on p.id = pp.permissao_id
        where u.id = auth.uid()
          and u.ativo = true
          and p.recurso = recurso_consultado
          and p.acao = acao_consultada
    );
$$;

alter table public.unidades enable row level security;
alter table public.pessoas enable row level security;
alter table public.usuarios enable row level security;
alter table public.perfis enable row level security;
alter table public.permissoes enable row level security;
alter table public.usuario_perfis enable row level security;
alter table public.perfil_permissoes enable row level security;
alter table public.auditoria enable row level security;

create policy unidades_leitura_permitida
    on public.unidades for select
    to authenticated
    using (
        id in (select u.unidade_id from public.usuarios u where u.id = auth.uid() and u.ativo = true)
        or public.usuario_tem_permissao('unidades', 'listar')
    );

create policy pessoas_leitura_permitida
    on public.pessoas for select
    to authenticated
    using (
        unidade_id in (select u.unidade_id from public.usuarios u where u.id = auth.uid() and u.ativo = true)
        and public.usuario_tem_permissao('pessoas', 'listar')
    );

create policy usuarios_proprio_registro
    on public.usuarios for select
    to authenticated
    using (id = auth.uid());

create policy perfis_leitura_administrativa
    on public.perfis for select
    to authenticated
    using (public.usuario_tem_permissao('perfis', 'listar'));

create policy permissoes_leitura_administrativa
    on public.permissoes for select
    to authenticated
    using (public.usuario_tem_permissao('permissoes', 'listar'));

create policy usuario_perfis_leitura_administrativa
    on public.usuario_perfis for select
    to authenticated
    using (
        usuario_id = auth.uid()
        or public.usuario_tem_permissao('usuarios', 'listar')
    );

create policy perfil_permissoes_leitura_administrativa
    on public.perfil_permissoes for select
    to authenticated
    using (public.usuario_tem_permissao('permissoes', 'listar'));

create policy auditoria_leitura_administrativa
    on public.auditoria for select
    to authenticated
    using (public.usuario_tem_permissao('auditoria', 'listar'));
