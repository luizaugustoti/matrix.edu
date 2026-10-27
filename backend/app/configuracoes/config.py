"""Configuracoes centrais da API.

Este arquivo deve concentrar leitura de variaveis de ambiente para
evitar configuracoes espalhadas em varios pontos do sistema.
"""

from pydantic import BaseModel
from dotenv import load_dotenv
import os
from pathlib import Path

load_dotenv(Path(__file__).resolve().parents[2] / ".env")


class Settings(BaseModel):
    app_env: str = os.getenv("APP_ENV", "development")
    app_name: str = os.getenv("APP_NAME", "EFG Sistema API")
    app_port: int = int(os.getenv("APP_PORT", "8000"))
    frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    cors_origins: str = os.getenv("CORS_ORIGINS", "")
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_anon_key: str = os.getenv("SUPABASE_ANON_KEY", "")
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

    @property
    def allowed_origins(self) -> list[str]:
        origins = [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]
        return origins or [self.frontend_url]

    @property
    def supabase_configured(self) -> bool:
        return bool(
            self.supabase_url
            and self.supabase_anon_key
            and self.supabase_service_role_key
        )


settings = Settings()
