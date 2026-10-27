"""Endpoints de turmas e horarios."""

from uuid import UUID

from fastapi import APIRouter, Depends, status
from supabase import Client

from app.autenticacao.dependencias import get_authenticated_supabase_client, require_permission
from app.schemas.turmas import HorarioComTurma, HorarioResposta, TurmaCriacao, TurmaResposta
from app.servicos.turmas import criar_horario, criar_turma, listar_horarios, listar_turmas

router = APIRouter(prefix="/pedagogico", tags=["turmas"])


@router.get("/unidades/{unidade_id}/turmas", response_model=list[TurmaResposta])
def obter_turmas(unidade_id: UUID, cliente: Client = Depends(require_permission("turmas", "listar"))) -> list[dict]:
    return listar_turmas(cliente, unidade_id)


@router.post("/turmas", response_model=TurmaResposta, status_code=status.HTTP_201_CREATED)
def cadastrar_turma(dados: TurmaCriacao, cliente: Client = Depends(require_permission("turmas", "criar"))) -> dict:
    return criar_turma(cliente, dados)


@router.get("/turmas/{turma_id}/horarios", response_model=list[HorarioResposta])
def obter_horarios(turma_id: UUID, cliente: Client = Depends(require_permission("horarios", "listar"))) -> list[dict]:
    return listar_horarios(cliente, turma_id)


@router.post("/horarios", response_model=HorarioResposta, status_code=status.HTTP_201_CREATED)
def cadastrar_horario(dados: HorarioComTurma, cliente: Client = Depends(require_permission("horarios", "criar"))) -> dict:
    return criar_horario(cliente, dados)
