#!/usr/bin/env python3
"""
Script para testar endpoints do backend com o token autenticado.
"""

import os
import sys
from pathlib import Path
import json

sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
import urllib.request
import urllib.error

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
API_BASE = "http://localhost:8000"

def obter_token_teste():
    """Obtém um token válido para testes."""
    email = "teste@instituicao.edu.br"
    password = "SenhaForte123!"
    
    auth_url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    
    dados = json.dumps({
        "email": email,
        "password": password
    }).encode('utf-8')
    
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json",
    }
    
    req = urllib.request.Request(auth_url, data=dados, headers=headers, method='POST')
    
    try:
        with urllib.request.urlopen(req) as resposta:
            resultado = json.loads(resposta.read().decode())
            return resultado.get("access_token")
    except urllib.error.HTTPError as e:
        print(f"❌ Erro ao obter token: {e.status}")
        return None


def testar_endpoint(token, metodo, rota):
    """Testa um endpoint do backend com o token."""
    url = f"{API_BASE}{rota}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    
    req = urllib.request.Request(url, headers=headers, method=metodo)
    
    try:
        with urllib.request.urlopen(req) as resposta:
            dados = json.loads(resposta.read().decode())
            return resposta.status, dados
    except urllib.error.HTTPError as e:
        return e.code, {"error": e.reason}


def main():
    print("\n" + "=" * 70)
    print("🧪 Testando Endpoints do Backend com Token Autenticado")
    print("=" * 70 + "\n")
    
    print("📝 Obtendo token de autenticação...")
    token = obter_token_teste()
    
    if not token:
        print("❌ Falha ao obter token!")
        sys.exit(1)
    
    print(f"✅ Token obtido com sucesso!")
    print(f"   Token (primeiros 50 chars): {token[:50]}...\n")
    
    endpoints = [
        ("GET", "/health", "Health Check"),
        ("GET", "/health/supabase", "Supabase Health"),
        ("GET", "/auth/me", "Usuário Autenticado"),
        ("GET", "/fundacao/unidades", "Listar Unidades"),
        ("GET", "/administracao/perfis", "Listar Perfis"),
        ("GET", "/pedagogico/cursos", "Listar Cursos"),
    ]
    
    print("🚀 Testando endpoints:\n")
    
    sucesso_total = 0
    
    for metodo, rota, descricao in endpoints:
        print(f"   {descricao}...")
        status, dados = testar_endpoint(token, metodo, rota)
        
        if 200 <= status < 300:
            print(f"      ✅ {metodo} {rota} → Status {status}")
            sucesso_total += 1
        else:
            print(f"      ❌ {metodo} {rota} → Status {status}")
        
        if "error" in dados:
            print(f"         Erro: {dados['error']}")
        else:
            preview = json.dumps(dados)[:100]
            if len(json.dumps(dados)) > 100:
                preview += "..."
            print(f"         Resposta: {preview}")
        print()
    
    print("=" * 70)
    print(f"📊 Resultado: {sucesso_total}/{len(endpoints)} endpoints funcionando")
    print("=" * 70 + "\n")
    
    if sucesso_total >= 4:
        print("✅ Backend está pronto para o frontend!")
        return 0
    else:
        print("⚠️  Alguns endpoints falharam. Verifique a API.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
