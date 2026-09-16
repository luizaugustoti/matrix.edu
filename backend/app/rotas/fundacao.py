"""Endpoints dos cadastros centrais."""

from uuid import UUID

from fastapi import APIRouter, Depends, status
from supabase import Client

from app.autenticacao.dependencias import get_authenticated_supabase_client, require_permission
from app.schemas.fundacao import (
    PessoaCriacao,
    PessoaResposta,
    UnidadeCriacao,
    UnidadeResposta,
)
from app.servicos.fundacao import (
    criar_pessoa,
    criar_unidade,
    listar_pessoas,
    listar_unidades,
)

router = APIRouter(prefix="/fundacao", tags=["fundacao"])


@router.get("/unidades", response_model=list[UnidadeResposta])
def obter_unidades(cliente: Client = Depends(require_permission("unidades", "listar"))) -> list[dict]:
    return listar_unidades(cliente)


@router.post("/unidades", response_model=UnidadeResposta, status_code=status.HTTP_201_CREATED)
def cadastrar_unidade(
    dados: UnidadeCriacao,
    cliente: Client = Depends(require_permission("unidades", "criar")),
) -> dict:
    return criar_unidade(cliente, dados)


@router.get("/unidades/{unidade_id}/pessoas", response_model=list[PessoaResposta])
def obter_pessoas(
    unidade_id: UUID,
    cliente: Client = Depends(require_permission("pessoas", "listar")),
) -> list[dict]:
    return listar_pessoas(cliente, unidade_id)


@router.post("/pessoas", response_model=PessoaResposta, status_code=status.HTTP_201_CREATED)
def cadastrar_pessoa(
    dados: PessoaCriacao,
    cliente: Client = Depends(require_permission("pessoas", "criar")),
) -> dict:
    return criar_pessoa(cliente, dados)
