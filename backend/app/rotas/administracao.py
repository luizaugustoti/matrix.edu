"""Endpoints administrativos protegidos por autenticacao e RLS."""

from fastapi import APIRouter, Depends
from supabase import Client

from app.autenticacao.dependencias import get_authenticated_supabase_client
from app.schemas.administracao import PermissaoResposta, PerfilResposta
from app.servicos.administracao import listar_perfis, listar_permissoes

router = APIRouter(prefix="/administracao", tags=["administracao"])


@router.get("/perfis", response_model=list[PerfilResposta])
def obter_perfis(cliente: Client = Depends(get_authenticated_supabase_client)) -> list[dict]:
    return listar_perfis(cliente)


@router.get("/permissoes", response_model=list[PermissaoResposta])
def obter_permissoes(cliente: Client = Depends(get_authenticated_supabase_client)) -> list[dict]:
    return listar_permissoes(cliente)
