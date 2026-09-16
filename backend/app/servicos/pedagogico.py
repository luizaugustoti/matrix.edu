"""Regras de acesso para a base pedagogica."""

from uuid import UUID

from fastapi import HTTPException, status
from supabase import Client

from app.schemas.pedagogico import ComponenteCriacao, CursoCriacao


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


def listar_cursos(cliente: Client, unidade_id: UUID) -> list[dict]:
    try:
        resposta = (
            cliente.table("cursos")
            .select("*")
            .eq("unidade_id", str(unidade_id))
            .eq("situacao", "ativo")
            .order("nome")
            .execute()
        )
        return resposta.data or []
    except Exception as error:
        _tratar_erro_banco(error)
        return []


def criar_curso(cliente: Client, dados: CursoCriacao) -> dict:
    try:
        resposta = cliente.table("cursos").insert(dados.model_dump(mode="json")).execute()
        return resposta.data[0]
    except Exception as error:
        _tratar_erro_banco(error)
        return {}


def listar_componentes(cliente: Client, curso_id: UUID) -> list[dict]:
    try:
        resposta = (
            cliente.table("componentes_curriculares")
            .select("*")
            .eq("curso_id", str(curso_id))
            .eq("ativo", True)
            .order("nome")
            .execute()
        )
        return resposta.data or []
    except Exception as error:
        _tratar_erro_banco(error)
        return []


def criar_componente(cliente: Client, dados: ComponenteCriacao) -> dict:
    try:
        resposta = (
            cliente.table("componentes_curriculares")
            .insert(dados.model_dump(mode="json"))
            .execute()
        )
        return resposta.data[0]
    except Exception as error:
        _tratar_erro_banco(error)
        return {}
