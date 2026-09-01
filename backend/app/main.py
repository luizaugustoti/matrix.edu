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

from fastapi import FastAPI


app = FastAPI(
    title="EFG Sistema API",
    description="API do projeto EFG com integracao Supabase/PostgreSQL.",
    version="0.1.0",
)


@app.get("/health", tags=["infra"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}
