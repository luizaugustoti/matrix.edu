"""Endpoints da base pedagogica."""

from uuid import UUID

from fastapi import APIRouter, Depends, status
from supabase import Client

from app.autenticacao.dependencias import get_authenticated_supabase_client, require_permission
from app.schemas.pedagogico import (
    ComponenteCriacao,
    ComponenteResposta,
    CursoCriacao,
    CursoResposta,
)
from app.servicos.pedagogico import (
    criar_componente,
    criar_curso,
    listar_componentes,
    listar_cursos,
)

router = APIRouter(prefix="/pedagogico", tags=["pedagogico"])


@router.get("/unidades/{unidade_id}/cursos", response_model=list[CursoResposta])
def obter_cursos(
    unidade_id: UUID,
    cliente: Client = Depends(require_permission("cursos", "listar")),
) -> list[dict]:
    return listar_cursos(cliente, unidade_id)


@router.post("/cursos", response_model=CursoResposta, status_code=status.HTTP_201_CREATED)
def cadastrar_curso(
    dados: CursoCriacao,
    cliente: Client = Depends(require_permission("cursos", "criar")),
) -> dict:
    return criar_curso(cliente, dados)


@router.get("/cursos/{curso_id}/componentes", response_model=list[ComponenteResposta])
def obter_componentes(
    curso_id: UUID,
    cliente: Client = Depends(require_permission("componentes", "listar")),
) -> list[dict]:
    return listar_componentes(cliente, curso_id)


@router.post(
    "/componentes",
    response_model=ComponenteResposta,
    status_code=status.HTTP_201_CREATED,
)
def cadastrar_componente(
    dados: ComponenteCriacao,
    cliente: Client = Depends(require_permission("componentes", "criar")),
) -> dict:
    return criar_componente(cliente, dados)
