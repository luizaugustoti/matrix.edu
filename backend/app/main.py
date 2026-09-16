"""Arquivo principal da API FastAPI.

Funcao:
- Inicializar a aplicacao.
- Registrar rotas basicas e endpoint de saude.

Quando alterar:
- Ao adicionar configuracoes globais da API (middleware, eventos, routers).

Quem usa:
- Equipe de back-end e infraestrutura local.

Dependencias:
- Pode importar routers de `app/rotas/` e configuracoes de `app/configuracoes/`.
"""

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.autenticacao.dependencias import get_current_user
from app.configuracoes.config import settings
from app.rotas.administracao import router as administracao_router
from app.rotas.fundacao import router as fundacao_router
from app.rotas.pedagogico import router as pedagogico_router
from app.rotas.turmas import router as turmas_router


app = FastAPI(
    title=settings.app_name,
    description="API do projeto EFG com integracao Supabase/PostgreSQL.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(fundacao_router)
app.include_router(administracao_router)
app.include_router(pedagogico_router)
app.include_router(turmas_router)


@app.get("/health", tags=["infra"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health/supabase", tags=["infra"])
def supabase_health_check() -> dict[str, bool | str]:
    return {
        "configured": settings.supabase_configured,
        "provider": "supabase",
        "database": "postgresql",
    }


@app.get("/auth/me", tags=["autenticacao"])
def current_user(user: dict = Depends(get_current_user)) -> dict:
    return user
