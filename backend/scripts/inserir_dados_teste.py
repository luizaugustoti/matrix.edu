#!/usr/bin/env python3
"""
Script para inserir dados de teste no Supabase.
Popula unidades, cursos, componentes, turmas e horários para testes.
"""

import os
import sys
from pathlib import Path
import json
import urllib.request
import urllib.error

sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SERVICE_ROLE_KEY:
    print("❌ ERRO: Variáveis de ambiente não configuradas")
    sys.exit(1)


def fazer_requisicao(metodo, rota, dados=None):
    """Faz requisição à API REST do Supabase."""
    url = f"{SUPABASE_URL}/rest/v1{rota}"
    
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    body = json.dumps(dados).encode('utf-8') if dados else None
    req = urllib.request.Request(url, data=body, headers=headers, method=metodo)
    
    try:
        with urllib.request.urlopen(req) as resposta:
            resultado = resposta.read().decode('utf-8')
            return 200, json.loads(resultado) if resultado else None
    except urllib.error.HTTPError as e:
        erro = e.read().decode('utf-8')
        try:
            return e.code, json.loads(erro)
        except:
            return e.code, {"error": erro}


def main():
    print("\n" + "=" * 70)
    print("📝 Inserindo Dados de Teste no Supabase")
    print("=" * 70 + "\n")
    
    # 1. Inserir Unidades
    print("📦 1. Criando Unidades...")
    unidade_dados = {
        "nome": "Campus Central",
        "codigo": "CAMPUS_001",
        "ativa": True
    }
    
    status, resposta = fazer_requisicao("POST", "/unidades", unidade_dados)
    if status == 201 or status == 200:
        unidade_id = resposta[0]["id"] if isinstance(resposta, list) else resposta["id"]
        print(f"   ✅ Unidade criada: {unidade_id}")
    else:
        print(f"   ⚠️  Erro ao criar unidade: {resposta}")
        unidade_id = None
    
    # 2. Atualizar usuário teste com a unidade
    if unidade_id:
        print("\n👤 2. Atribuindo Unidade ao Usuário Teste...")
        # Usar SQL via RPC não funciona, então fazer update direto na tabela
        usuario_dados = {"unidade_id": unidade_id}
        
        # Filter por email do usuário teste
        status, resposta = fazer_requisicao(
            "PATCH", 
            f'/usuarios?email=eq.teste@instituicao.edu.br',
            usuario_dados
        )
        
        if status in [200, 204]:
            print(f"   ✅ Usuário vinculado à unidade")
        else:
            print(f"   ⚠️  Erro ao vincular: {resposta}")
    
    # 3. Inserir Cursos
    if unidade_id:
        print("\n📚 3. Criando Cursos...")
        cursos = [
            {
                "unidade_id": unidade_id,
                "nome": "Técnico em Informática",
                "codigo": "TI001",
                "tipo": "tecnico",
                "duracao_dias": 360,
                "carga_horaria": 1200,
                "situacao": "ativo"
            },
            {
                "unidade_id": unidade_id,
                "nome": "Bacharel em Engenharia",
                "codigo": "ENG001",
                "tipo": "superior",
                "duracao_dias": 1440,
                "carga_horaria": 4000,
                "situacao": "ativo"
            }
        ]
        
        curso_ids = []
        for curso in cursos:
            status, resposta = fazer_requisicao("POST", "/cursos", curso)
            if status in [200, 201]:
                curso_id = resposta[0]["id"] if isinstance(resposta, list) else resposta["id"]
                curso_ids.append(curso_id)
                print(f"   ✅ Curso criado: {curso['nome']}")
            else:
                print(f"   ⚠️  Erro ao criar curso: {resposta}")
        
        # 4. Inserir Componentes Curriculares
        if curso_ids:
            print("\n📖 4. Criando Componentes Curriculares...")
            componentes_dados = [
                {
                    "curso_id": curso_ids[0],
                    "nome": "Programação em Python",
                    "codigo": "PROG001",
                    "carga_horaria": 60,
                    "competencias": ["programação", "python", "algoritmos"],
                    "ativo": True
                },
                {
                    "curso_id": curso_ids[0],
                    "nome": "Banco de Dados",
                    "codigo": "BD001",
                    "carga_horaria": 40,
                    "competencias": ["banco de dados", "SQL", "design"],
                    "ativo": True
                }
            ]
            
            for comp in componentes_dados:
                status, resposta = fazer_requisicao("POST", "/componentes_curriculares", comp)
                if status in [200, 201]:
                    print(f"   ✅ Componente criado: {comp['nome']}")
                else:
                    print(f"   ⚠️  Erro: {resposta}")
        
        # 5. Inserir Turmas
        if curso_ids:
            print("\n👥 5. Criando Turmas...")
            turma_dados = {
                "unidade_id": unidade_id,
                "curso_id": curso_ids[0],
                "nome": "Turma 2026.1",
                "periodo": "2026.1",
                "data_inicio": "2026-01-15",
                "data_fim": "2026-12-20",
                "sala": "Sala 101",
                "capacidade": 30,
                "situacao": "planejada"
            }
            
            status, resposta = fazer_requisicao("POST", "/turmas", turma_dados)
            if status in [200, 201]:
                turma_id = resposta[0]["id"] if isinstance(resposta, list) else resposta["id"]
                print(f"   ✅ Turma criada: Turma 2026.1")
                
                # 6. Inserir Horários
                print("\n⏰ 6. Criando Horários...")
                horarios = [
                    {"turma_id": turma_id, "dia_semana": 1, "hora_inicio": "09:00", "hora_fim": "10:30"},
                    {"turma_id": turma_id, "dia_semana": 3, "hora_inicio": "09:00", "hora_fim": "10:30"},
                    {"turma_id": turma_id, "dia_semana": 5, "hora_inicio": "09:00", "hora_fim": "10:30"},
                ]
                
                for horario in horarios:
                    status, resposta = fazer_requisicao("POST", "/turma_horarios", horario)
                    dias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
                    if status in [200, 201]:
                        print(f"   ✅ Horário criado: {dias[horario['dia_semana']]} {horario['hora_inicio']}")
                    else:
                        print(f"   ⚠️  Erro: {resposta}")
            else:
                print(f"   ⚠️  Erro ao criar turma: {resposta}")
    
    print("\n" + "=" * 70)
    print("✅ Dados de teste inseridos com sucesso!")
    print("=" * 70)
    
    print("\n📋 Próximos passos:")
    print("   1. Faça login novamente no frontend")
    print("   2. Vá para http://localhost:5173/fundacao")
    print("   3. Deve aparecer 'Campus Central'")
    print("   4. Teste os outros módulos (Cursos, Turmas, etc.)\n")


if __name__ == "__main__":
    main()
