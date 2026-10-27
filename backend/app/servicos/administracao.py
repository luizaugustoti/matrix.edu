"""Consultas administrativas protegidas por autenticacao e RLS."""

from fastapi import HTTPException, status
from supabase import Client


def _tratar_erro_consulta(error: Exception) -> None:
    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail="Nao foi possivel consultar os dados administrativos.",
    ) from error


def listar_perfis(cliente: Client) -> list[dict]:
    try:
        resposta = cliente.table("perfis").select("*").eq("ativo", True).order("nome").execute()
        return resposta.data or []
    except Exception as error:
        _tratar_erro_consulta(error)
        return []


def listar_permissoes(cliente: Client) -> list[dict]:
    try:
        resposta = cliente.table("permissoes").select("*").order("recurso").order("acao").execute()
        return resposta.data or []
    except Exception as error:
        _tratar_erro_consulta(error)
        return []
