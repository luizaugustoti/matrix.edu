#!/usr/bin/env python3
"""
Script para criar usuário de teste no Supabase.

Uso:
    python criar_usuario_teste.py
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
SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SERVICE_ROLE_KEY:
    print("❌ ERRO: Variáveis de ambiente não configuradas")
    sys.exit(1)

def criar_usuario_teste():
    """Cria um usuário de teste no Supabase."""
    cliente = create_client(SUPABASE_URL, SERVICE_ROLE_KEY)
    
    print("\n" + "=" * 60)
    print("👤 Criando Usuário de Teste")
    print("=" * 60 + "\n")
    
    email = "teste@instituicao.edu.br"
    senha = "SenhaForte123!"
    
    try:
        # Criar usuário via Supabase Auth
        print(f"📝 Criando usuário: {email}")
        resposta = cliente.auth.admin.create_user(
            user_metadata={"email": email},
            password=senha,
            email_confirm=True  # Marcar como confirmado
        )
        
        usuario_id = resposta.user.id if hasattr(resposta, 'user') else resposta.get('id')
        print(f"✅ Usuário criado com ID: {usuario_id}")
        
        # Agora inserir na tabela public.usuarios (se necessário)
        print(f"\n🔗 Vinculando usuário à tabela public.usuarios...")
        
        # Verificar se a tabela usuarios existe e inserir registro
        try:
            resultado = cliente.table("usuarios").insert({
                "id": usuario_id,
                "email": email,
                "nome": "Usuário Teste",
                "unidade_id": None,  # Será atribuída depois
                "ativo": True,
                "criado_em": "now()",
            }).execute()
            print(f"✅ Registro inserido na tabela usuarios")
        except Exception as e:
            if "already exists" in str(e).lower():
                print(f"⚠️  Registro já existe (é normal)")
            else:
                print(f"⚠️  Erro ao inserir registro: {str(e)[:100]}")
        
        print("\n" + "=" * 60)
        print("✅ Usuário de Teste Criado com Sucesso!")
        print("=" * 60)
        print(f"\n📋 Credenciais de Teste:")
        print(f"   Email:    {email}")
        print(f"   Senha:    {senha}")
        print(f"   ID:       {usuario_id}")
        
        print(f"\n🧪 Como Testar no Frontend:")
        print(f"   1. Abra http://localhost:5173/login")
        print(f"   2. Digite: {email}")
        print(f"   3. Digite: {senha}")
        print(f"   4. Clique em 'Entrar'")
        print(f"\n💡 Se der erro de login, pode ser que as migrations ainda não foram aplicadas.")
        print("   Nesse caso, siga o guia: documentos/GUIA_APLICAR_MIGRATIONS.md")
        print("\n" + "=" * 60 + "\n")
        
        return True
        
    except Exception as e:
        print(f"❌ ERRO ao criar usuário: {str(e)}")
        if "already exists" in str(e).lower():
            print(f"✅ Usuário já existe! Use as credenciais acima para testar.")
            return True
        return False


if __name__ == "__main__":
    sucesso = criar_usuario_teste()
    sys.exit(0 if sucesso else 1)
