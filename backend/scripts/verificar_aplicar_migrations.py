#!/usr/bin/env python3
"""
Aplicar migrations diretamente via Python + Supabase SDK.
"""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
from supabase import create_client

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SERVICE_ROLE = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SERVICE_ROLE:
    print("❌ ERRO: Credenciais não encontradas")
    sys.exit(1)

cliente = create_client(SUPABASE_URL, SERVICE_ROLE)

print("\n" + "="*70)
print("🚀 APLICANDO MIGRATIONS NO SUPABASE")
print("="*70 + "\n")

# Tentar verificar se tabelas existem
tabelas = ["cursos", "componentes_curriculares", "turmas", "turma_horarios"]
faltam_tabelas = []

for tabela in tabelas:
    try:
        cliente.table(tabela).select("id").limit(0).execute()
        print(f"✅ Tabela '{tabela}' já existe")
    except Exception as e:
        if "does not exist" in str(e).lower() or "not found" in str(e).lower():
            print(f"❌ Tabela '{tabela}' não existe")
            faltam_tabelas.append(tabela)
        else:
            print(f"⚠️  Tabela '{tabela}' - Erro: {str(e)[:60]}")

if faltam_tabelas:
    print(f"\n⚠️  AÇÃO NECESSÁRIA: Aplicar migrations manualmente")
    print("\n📋 COMO APLICAR (Opção 1: Supabase UI):")
    print("   1. Acesse: https://app.supabase.com/project/xgwnqjokdutagfqfynfz/sql/new")
    print("   2. Execute 4 scripts SQL em sequência:")
    print("      - banco/migrations/002_cursos.sql")
    print("      - banco/migrations/003_turmas.sql")
    print("      - banco/politicas/002_cursos_rls.sql")
    print("      - banco/politicas/003_turmas_rls.sql")
    print("\n📋 COMO APLICAR (Opção 2: psql no terminal):")
    print("   $ PGPASSWORD=... psql -h db.xgwnqjokdutagfqfynfz.supabase.co \\")
    print("     -U postgres -d postgres -f banco/migrations/002_cursos.sql")
else:
    print(f"\n✅ Todas as tabelas já existem!")

print("\n" + "="*70 + "\n")
