"""Dependencias de autenticacao compartilhadas pelos routers da API."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client, create_client

from app.configuracoes.config import settings


bearer_scheme = HTTPBearer(auto_error=False)


def get_supabase_auth_client() -> Client:
    """Cria um cliente usando a chave anon para validar sessoes de usuarios."""
    if not settings.supabase_url or not settings.supabase_anon_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Autenticacao indisponivel: Supabase nao configurado.",
        )

    return create_client(settings.supabase_url, settings.supabase_anon_key)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    """Valida o Bearer token e retorna os dados do usuario autenticado."""
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticacao obrigatorio.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        response = get_supabase_auth_client().auth.get_user(credentials.credentials)
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticacao invalido.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from error

    if response.user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario nao encontrado para o token informado.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {
        "id": str(response.user.id),
        "email": response.user.email,
        "metadata": response.user.user_metadata or {},
    }


def get_authenticated_supabase_client(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> Client:
    """Retorna o cliente anon com o token do usuario para que o RLS seja aplicado."""
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticacao obrigatorio.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    cliente = get_supabase_auth_client()
    try:
        response = cliente.auth.get_user(credentials.credentials)
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticacao invalido.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from error

    if response.user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario nao encontrado para o token informado.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    cliente.postgrest.auth(credentials.credentials)
    return cliente


def require_permission(recurso: str, acao: str):
    """Cria uma dependencia que exige uma permissao do usuario autenticado."""

    def permission_dependency(
        cliente: Client = Depends(get_authenticated_supabase_client),
    ) -> Client:
        try:
            resposta = cliente.rpc(
                "usuario_tem_permissao",
                {
                    "recurso_consultado": recurso,
                    "acao_consultada": acao,
                },
            ).execute()
        except Exception as error:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Nao foi possivel validar a permissao do usuario.",
            ) from error

        if resposta.data is not True:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Usuario sem permissao: {recurso}:{acao}.",
            )

        return cliente

    return permission_dependency
