"""Cliente central do Supabase.

Funcao:
- Criar e exportar uma instancia de cliente Supabase para uso no back-end.

Quando alterar:
- Quando houver mudanca de biblioteca, estrategia de autenticacao ou configuracao.

Quem usa:
- Servicos de negocio e camadas que precisam persistir/consultar dados.

Arquivos dependentes:
- Modulos em `app/servicos/` e `app/modulos/`.
"""

from supabase import Client, create_client
from fastapi import HTTPException, status

from app.configuracoes.config import settings


def get_supabase_client() -> Client:
    if not settings.supabase_configured:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase nao configurado. Preencha o arquivo backend/.env.",
        )

    return create_client(settings.supabase_url, settings.supabase_service_role_key)
