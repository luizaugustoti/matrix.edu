#!/usr/bin/env python3
"""
Criar usuário de teste via API REST do Supabase usando urllib.
"""
import json
import os
from pathlib import Path
from dotenv import load_dotenv
import urllib.request
import urllib.error

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SERVICE_ROLE = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SERVICE_ROLE:
    print("❌ Variáveis de ambiente não encontradas")
    exit(1)

print("\n" + "="*60)
print("👤 Criando Usuário de Teste")
print("="*60 + "\n")

email = "teste@instituicao.edu.br"
password = "SenhaForte123!"

# Endpoint de admin para criar usuário
url = f"{SUPABASE_URL}/auth/v1/admin/users"

headers = {
    "Authorization": f"Bearer {SERVICE_ROLE}",
    "apikey": SERVICE_ROLE,
    "Content-Type": "application/json",
}

payload = {
    "email": email,
    "password": password,
    "email_confirm": True,
    "user_metadata": {
        "nome": "Usuário Teste",
        "role": "usuario"
    }
}

try:
    print(f"📝 Enviando requisição para criar usuário: {email}")
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers=headers,
        method='POST'
    )
    
    with urllib.request.urlopen(req, timeout=10) as response:
        resposta_dados = json.loads(response.read().decode('utf-8'))
        usuario_id = resposta_dados.get("id")
        print(f"✅ Usuário criado com sucesso!")
        print(f"\n📋 Detalhes:")
        print(f"   ID:    {usuario_id}")
        print(f"   Email: {email}")
        
except urllib.error.HTTPError as e:
    if e.code == 422:
        print(f"⚠️  Usuário pode já existir")
    else:
        print(f"❌ Erro HTTP {e.code}")
        print(f"   {e.read().decode('utf-8')[:200]}")
except urllib.error.URLError as e:
    print(f"❌ Erro de conexão: {e.reason}")
except Exception as e:
    print(f"❌ Erro: {str(e)}")

print(f"\n🧪 Como Testar no Frontend:")
print(f"   1. Abra http://localhost:5173/login")
print(f"   2. Digite email:  {email}")
print(f"   3. Digite senha:  {password}")
print(f"   4. Clique em 'Entrar'")

print("\n" + "="*60 + "\n")
