"""Contratos da API para administracao e controle de acesso."""

from uuid import UUID

from pydantic import BaseModel, ConfigDict


class PerfilResposta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    nome: str
    descricao: str | None
    ativo: bool


class PermissaoResposta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    recurso: str
    acao: str
    descricao: str | None
