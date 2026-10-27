"""Contratos da API para a fundacao de dados."""

from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class UnidadeCriacao(BaseModel):
    nome: str = Field(min_length=2, max_length=120)
    codigo: str = Field(min_length=2, max_length=30, pattern=r"^[A-Za-z0-9_-]+$")


class UnidadeResposta(UnidadeCriacao):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    ativo: bool


class PessoaCriacao(BaseModel):
    unidade_id: UUID
    nome_completo: str = Field(min_length=2, max_length=160)
    cpf: str | None = Field(default=None, min_length=11, max_length=14)
    email: str | None = Field(default=None, max_length=254)
    telefone: str | None = Field(default=None, max_length=30)


class PessoaResposta(PessoaCriacao):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    ativo: bool
