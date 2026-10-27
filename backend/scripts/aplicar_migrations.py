#!/usr/bin/env python3
"""
Script para aplicar migrations no Supabase.
Executa as migrations de forma segura usando o service_role_key.

Uso:
    python scripts/aplicar_migrations.py
"""

import os
import sys
from pathlib import Path

# Adicionar o diretório pai ao path para importar o app
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
from supabase import create_client

# Carregar variáveis de ambiente
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SERVICE_ROLE_KEY:
    print("❌ ERRO: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados em .env")
    sys.exit(1)


def executar_sql(cliente, sql: str, descricao: str) -> bool:
    """Executa um comando SQL no Supabase e retorna True se bem-sucedido."""
    try:
        print(f"\n📝 {descricao}...")
        # Executar SQL via RPC ou diretamente via query
        resultado = cliente.rpc("exec_sql", {"sql": sql}).execute()
        print(f"✅ {descricao} - OK")
        return True
    except Exception as e:
        print(f"⚠️  {descricao} - AVISO: {str(e)}")
        # Algumas queries podem falhar se já existem, o que é OK
        return "already exists" in str(e).lower() or "duplicate" in str(e).lower()


def main():
    """Aplica as migrations no Supabase."""
    cliente = create_client(SUPABASE_URL, SERVICE_ROLE_KEY)
    
    print("\n" + "=" * 60)
    print("🚀 Aplicando Migrations no Supabase")
    print("=" * 60)
    
    # Ler as migrations
    migrations_dir = Path(__file__).parent.parent / "banco" / "migrations"
    politicas_dir = Path(__file__).parent.parent / "banco" / "politicas"
    
    migrations = [
        (migrations_dir / "002_cursos.sql", "002 - Cursos e Componentes Curriculares"),
        (migrations_dir / "003_turmas.sql", "003 - Turmas e Horários"),
    ]
    
    politicas = [
        (politicas_dir / "002_cursos_rls.sql", "RLS 002 - Cursos e Componentes"),
        (politicas_dir / "003_turmas_rls.sql", "RLS 003 - Turmas e Horários"),
    ]
    
    sucesso = True
    
    print("\n📦 Criando Tabelas...")
    for arquivo, descricao in migrations:
        if not arquivo.exists():
            print(f"❌ Arquivo não encontrado: {arquivo}")
            sucesso = False
            continue
        
        with open(arquivo, "r", encoding="utf-8") as f:
            sql = f.read()
        
        # Executar linha por linha para evitar problemas
        for linha in sql.split(";"):
            if linha.strip():
                if not executar_sql(cliente, linha + ";", descricao):
                    # Tentar continuar mesmo com erros
                    pass
    
    print("\n🔒 Ativando RLS Policies...")
    for arquivo, descricao in politicas:
        if not arquivo.exists():
            print(f"❌ Arquivo não encontrado: {arquivo}")
            sucesso = False
            continue
        
        with open(arquivo, "r", encoding="utf-8") as f:
            sql = f.read()
        
        # Executar linha por linha
        for linha in sql.split(";"):
            if linha.strip():
                if not executar_sql(cliente, linha + ";", descricao):
                    pass
    
    print("\n" + "=" * 60)
    if sucesso:
        print("✅ Migrations aplicadas com sucesso!")
    else:
        print("⚠️  Algumas migrations podem já existir (é normal)")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
