#!/usr/bin/env python3
"""
Aplica as migrations das tabelas de cursos e turmas via Supabase REST API
"""

import json
import urllib.request
import os
from pathlib import Path

# Carregar variáveis de ambiente
env_file = Path(__file__).parent.parent / '.env'
env_vars = {}

if env_file.exists():
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                key, value = line.split('=', 1)
                env_vars[key] = value.strip('"\'')

SUPABASE_URL = env_vars.get('SUPABASE_URL', os.getenv('SUPABASE_URL', ''))
SERVICE_ROLE_KEY = env_vars.get('SUPABASE_SERVICE_ROLE_KEY', os.getenv('SUPABASE_SERVICE_ROLE_KEY', ''))

print("=" * 60)
print("APLICANDO MIGRATIONS MANUALMENTE")
print("=" * 60)

print(f"\n📋 Você precisa copiar e colar o SQL abaixo no Supabase SQL Editor")
print(f"   Acesse: https://app.supabase.com/project/xgwnqjokdutagfqfynfz/sql/editor")
print("\n" + "=" * 60)

# Ler migration 002
with open(Path(__file__).parent.parent.parent / 'banco' / 'migrations' / '002_cursos.sql', 'r') as f:
    migration_002 = f.read()

print("\n--- MIGRATION 002: CURSOS E COMPONENTES ---\n")
print(migration_002)

# Ler migration 003
with open(Path(__file__).parent.parent.parent / 'banco' / 'migrations' / '003_turmas.sql', 'r') as f:
    migration_003 = f.read()

print("\n--- MIGRATION 003: TURMAS E HORÁRIOS ---\n")
print(migration_003)

print("\n" + "=" * 60)
print("✋ AÇÃO NECESSÁRIA:")
print("=" * 60)
print("1. Copie o SQL acima")
print("2. Acesse o Supabase SQL Editor")
print("3. Cole o SQL e clique em 'Executar'")
print("4. Volte aqui e execute: python inserir_dados_simples.py")
print("=" * 60)
