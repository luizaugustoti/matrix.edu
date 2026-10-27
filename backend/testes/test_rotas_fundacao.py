from fastapi.testclient import TestClient

from app.autenticacao.dependencias import get_authenticated_supabase_client
from app.main import app


UNIDADE_ID = "11111111-1111-1111-1111-111111111111"
PESSOA_ID = "22222222-2222-2222-2222-222222222222"


class FakeResponse:
    def __init__(self, data):
        self.data = data


class FakeRpc:
    def execute(self):
        return FakeResponse(True)


class FakeQuery:
    def __init__(self, data=None, error=None):
        self.data = data or []
        self.error = error
        self.payload = None

    def select(self, _fields):
        return self

    def eq(self, _field, _value):
        return self

    def order(self, _field):
        return self

    def insert(self, payload):
        self.payload = payload
        return self

    def execute(self):
        if self.error:
            raise self.error
        return FakeResponse(self.data)


class FakeClient:
    def __init__(self, query):
        self.query = query

    def table(self, _name):
        return self.query

    def rpc(self, _name, _params):
        return FakeRpc()


def client_with(query):
    return lambda: FakeClient(query)


def test_unidades_exige_token():
    app.dependency_overrides.clear()
    response = TestClient(app).get("/fundacao/unidades")

    assert response.status_code == 401
    assert response.json()["detail"] == "Token de autenticacao obrigatorio."


def test_cadastra_unidade_e_retorna_201():
    query = FakeQuery(
        [
            {
                "id": UNIDADE_ID,
                "nome": "Valparaiso",
                "codigo": "VAL",
                "ativo": True,
            }
        ]
    )
    app.dependency_overrides[get_authenticated_supabase_client] = client_with(query)

    try:
        response = TestClient(app).post(
            "/fundacao/unidades",
            json={"nome": "Valparaiso", "codigo": "VAL"},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 201
    assert response.json()["id"] == UNIDADE_ID
    assert query.payload == {"nome": "Valparaiso", "codigo": "VAL"}


def test_cadastro_rejeita_nome_invalido_com_422():
    query = FakeQuery()
    app.dependency_overrides[get_authenticated_supabase_client] = client_with(query)

    try:
        response = TestClient(app).post(
            "/fundacao/unidades",
            json={"nome": "", "codigo": "VAL"},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 422
    assert query.payload is None


def test_cadastro_de_pessoa_retorna_201():
    query = FakeQuery(
        [
            {
                "id": PESSOA_ID,
                "unidade_id": UNIDADE_ID,
                "nome_completo": "Ana Silva",
                "cpf": "12345678901",
                "email": None,
                "telefone": None,
                "ativo": True,
            }
        ]
    )
    app.dependency_overrides[get_authenticated_supabase_client] = client_with(query)

    try:
        response = TestClient(app).post(
            "/fundacao/pessoas",
            json={
                "unidade_id": UNIDADE_ID,
                "nome_completo": "Ana Silva",
                "cpf": "12345678901",
            },
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 201
    assert response.json()["id"] == PESSOA_ID
    assert query.payload["unidade_id"] == UNIDADE_ID


def test_duplicidade_retorna_409():
    query = FakeQuery(error=RuntimeError("duplicate key value violates unique constraint"))
    app.dependency_overrides[get_authenticated_supabase_client] = client_with(query)

    try:
        response = TestClient(app).post(
            "/fundacao/unidades",
            json={"nome": "Valparaiso", "codigo": "VAL"},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 409
    assert response.json()["detail"] == "Ja existe um registro com os dados informados."
