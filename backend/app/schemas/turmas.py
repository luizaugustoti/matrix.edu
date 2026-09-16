"""Contratos da API para turmas e horarios."""

from datetime import date, time
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class HorarioCriacao(BaseModel):
    dia_semana: int = Field(ge=0, le=6)
    hora_inicio: time
    hora_fim: time


class HorarioResposta(HorarioCriacao):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    turma_id: UUID


class TurmaCriacao(BaseModel):
    unidade_id: UUID
    curso_id: UUID
    professor_id: UUID | None = None
    nome: str = Field(min_length=2, max_length=160)
    periodo: str | None = Field(default=None, max_length=80)
    data_inicio: date | None = None
    data_fim: date | None = None
    sala: str | None = Field(default=None, max_length=120)
    capacidade: int | None = Field(default=None, gt=0)


class TurmaResposta(TurmaCriacao):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    situacao: str


class HorarioComTurma(HorarioCriacao):
    turma_id: UUID
