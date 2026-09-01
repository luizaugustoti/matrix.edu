"""Configuracoes centrais da API.

Este arquivo deve concentrar leitura de variaveis de ambiente para
evitar configuracoes espalhadas em varios pontos do sistema.
"""

from pydantic import BaseModel
from dotenv import load_dotenv
import os

load_dotenv()


class Settings(BaseModel):
    app_env: str = os.getenv("APP_ENV", "development")
    app_name: str = os.getenv("APP_NAME", "EFG Sistema API")
    app_port: int = int(os.getenv("APP_PORT", "8000"))
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_anon_key: str = os.getenv("SUPABASE_ANON_KEY", "")
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")


settings = Settings()
