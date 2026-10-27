from uuid import UUID, uuid4

import pytest
from fastapi import HTTPException

from app.schemas.fundacao import PessoaCriacao, UnidadeCriacao
from app.servicos.fundacao import (
    criar_pessoa,
    criar_unidade,
    listar_pessoas,
    listar_unidades,
)


class FakeResponse:
    def __init__(self, data):
        self.data = data


class FakeQuery:
    def __init__(self, data=None, error=None):
        self.data = data or []
        self.error = error
        self.operations = []

    def select(self, fields):
        self.operations.append(("select", fields))
        return self

    def eq(self, field, value):
        self.operations.append(("eq", field, value))
        return self

    def order(self, field):
        self.operations.append(("order", field))
        return self

    def insert(self, payload):
        self.operations.append(("insert", payload))
        return self

    def execute(self):
        if self.error:
            raise self.error
        return FakeResponse(self.data)


class FakeClient:
    def __init__(self, query):
        self.query_instance = query
        self.table_name = None

    def table(self, name):
        self.table_name = name
        return self.query_instance


def test_lista_unidades_aplica_filtros_e_ordenacao():
    query = FakeQuery([{"id": "1", "nome": "Valparaiso", "ativo": True}])
    resultado = listar_unidades(FakeClient(query))

    assert resultado == query.data
    assert query.operations == [
        ("select", "*"),
        ("eq", "ativo", True),
        ("order", "nome"),
    ]


def test_cria_unidade_com_payload_validado():
    query = FakeQuery([{"id": "1", "nome": "Valparaiso", "codigo": "VAL"}])
    dados = UnidadeCriacao(nome="Valparaiso", codigo="VAL")
    cliente = FakeClient(query)

    resultado = criar_unidade(cliente, dados)

    assert resultado["codigo"] == "VAL"
    assert query.operations == [("insert", {"nome": "Valparaiso", "codigo": "VAL"})]


def test_cria_pessoa_serializa_uuid_da_unidade():
    unidade_id = uuid4()
    query = FakeQuery([{"id": "1", "unidade_id": str(unidade_id)}])
    dados = PessoaCriacao(
        unidade_id=unidade_id,
        nome_completo="Ana Silva",
        cpf="12345678901",
    )

    criar_pessoa(FakeClient(query), dados)

    payload = query.operations[0][1]
    assert payload["unidade_id"] == str(unidade_id)
    assert payload["nome_completo"] == "Ana Silva"


def test_erro_de_duplicidade_vira_conflito_http():
    query = FakeQuery(error=RuntimeError("duplicate key value violates unique constraint"))
    dados = UnidadeCriacao(nome="Valparaiso", codigo="VAL")

    with pytest.raises(HTTPException) as excecao:
        criar_unidade(FakeClient(query), dados)

    assert excecao.value.status_code == 409


def test_lista_pessoas_filtra_por_unidade_e_ativo():
    unidade_id = UUID("11111111-1111-1111-1111-111111111111")
    query = FakeQuery([])

    assert listar_pessoas(FakeClient(query), unidade_id) == []
    assert query.operations == [
        ("select", "*"),
        ("eq", "unidade_id", str(unidade_id)),
        ("eq", "ativo", True),
        ("order", "nome_completo"),
    ]
