"""Regras de acesso para turmas e horarios."""

from uuid import UUID

from fastapi import HTTPException, status
from supabase import Client

from app.schemas.turmas import HorarioComTurma, TurmaCriacao


def _tratar_erro_banco(error: Exception) -> None:
    mensagem = str(error).lower()
    if "duplicate" in mensagem or "unique" in mensagem:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Registro duplicado.") from error
    raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Nao foi possivel concluir a operacao.") from error


def listar_turmas(cliente: Client, unidade_id: UUID) -> list[dict]:
    try:
        resposta = (
            cliente.table("turmas")
            .select("*")
            .eq("unidade_id", str(unidade_id))
            .neq("situacao", "cancelada")
            .order("nome")
            .execute()
        )
        return resposta.data or []
    except Exception as error:
        _tratar_erro_banco(error)
        return []


def criar_turma(cliente: Client, dados: TurmaCriacao) -> dict:
    try:
        resposta = cliente.table("turmas").insert(dados.model_dump(mode="json")).execute()
        return resposta.data[0]
    except Exception as error:
        _tratar_erro_banco(error)
        return {}


def listar_horarios(cliente: Client, turma_id: UUID) -> list[dict]:
    try:
        resposta = (
            cliente.table("turma_horarios")
            .select("*")
            .eq("turma_id", str(turma_id))
            .order("dia_semana")
            .order("hora_inicio")
            .execute()
        )
        return resposta.data or []
    except Exception as error:
        _tratar_erro_banco(error)
        return []


def criar_horario(cliente: Client, dados: HorarioComTurma) -> dict:
    try:
        resposta = cliente.table("turma_horarios").insert(dados.model_dump(mode="json")).execute()
        return resposta.data[0]
    except Exception as error:
        _tratar_erro_banco(error)
        return {}
