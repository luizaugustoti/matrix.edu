"""Contratos da API para cursos e componentes curriculares."""

from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class CursoCriacao(BaseModel):
    unidade_id: UUID
    nome: str = Field(min_length=2, max_length=160)
    codigo: str = Field(min_length=2, max_length=40)
    tipo: str = Field(min_length=2, max_length=80)
    duracao_dias: int | None = Field(default=None, gt=0)
    carga_horaria: int | None = Field(default=None, gt=0)


class CursoResposta(CursoCriacao):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    situacao: str


class ComponenteCriacao(BaseModel):
    curso_id: UUID
    nome: str = Field(min_length=2, max_length=160)
    codigo: str = Field(min_length=2, max_length=40)
    carga_horaria: int | None = Field(default=None, gt=0)
    competencias: list[str] = Field(default_factory=list, max_length=50)


class ComponenteResposta(ComponenteCriacao):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    ativo: bool
