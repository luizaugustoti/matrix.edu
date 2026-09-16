"""Acesso aos dados centrais da aplicacao."""

from uuid import UUID

from fastapi import HTTPException, status
from supabase import Client

from app.schemas.fundacao import PessoaCriacao, UnidadeCriacao


def _tratar_erro_banco(error: Exception) -> None:
    mensagem = str(error).lower()
    if "duplicate" in mensagem or "unique" in mensagem:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ja existe um registro com os dados informados.",
        ) from error
    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail="Nao foi possivel concluir a operacao no banco de dados.",
    ) from error


def listar_unidades(cliente: Client) -> list[dict]:
    try:
        resposta = cliente.table("unidades").select("*").eq("ativo", True).order("nome").execute()
        return resposta.data or []
    except Exception as error:
        _tratar_erro_banco(error)
        return []


def criar_unidade(cliente: Client, dados: UnidadeCriacao) -> dict:
    try:
        resposta = cliente.table("unidades").insert(dados.model_dump()).execute()
        return resposta.data[0]
    except Exception as error:
        _tratar_erro_banco(error)
        return {}


def listar_pessoas(cliente: Client, unidade_id: UUID) -> list[dict]:
    try:
        resposta = (
            cliente.table("pessoas")
            .select("*")
            .eq("unidade_id", str(unidade_id))
            .eq("ativo", True)
            .order("nome_completo")
            .execute()
        )
        return resposta.data or []
    except Exception as error:
        _tratar_erro_banco(error)
        return []


def criar_pessoa(cliente: Client, dados: PessoaCriacao) -> dict:
    try:
        resposta = cliente.table("pessoas").insert(dados.model_dump(mode="json")).execute()
        return resposta.data[0]
    except Exception as error:
        _tratar_erro_banco(error)
        return {}
