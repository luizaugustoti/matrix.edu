#!/usr/bin/env python3
"""
Script simples para inserir dados de teste no Supabase via REST API
Sem dependências externas além do stdlib
"""

import json
import urllib.request
import os
from pathlib import Path

# Carregar variáveis de ambiente manualmente
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

print(f"✓ SUPABASE_URL: {SUPABASE_URL}")
print(f"✓ SERVICE_ROLE_KEY: {SERVICE_ROLE_KEY[:20]}...")

def fazer_requisicao(metodo, rota, dados=None):
    """Faz requisição para Supabase REST API"""
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
        with urllib.request.urlopen(req) as response:
            status = response.status
            response_data = json.loads(response.read().decode('utf-8'))
            return status, response_data
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f"✗ Erro {e.code}: {error_body}")
        return e.code, None

print("\n=== 1. INSERINDO UNIDADE ===")
unidade_data = {
    "nome": "Campus Central",
    "codigo": "CAMPUS_001",
    "ativo": True
}
status, result = fazer_requisicao("POST", "/unidades", unidade_data)
print(f"Status: {status}")
if result:
    print(f"Unidade criada: {json.dumps(result, indent=2, ensure_ascii=False)}")
    unidade_id = result[0].get('id') if isinstance(result, list) else result.get('id')
else:
    print("Erro ao criar unidade")

print("\n=== 2. ATUALIZANDO USUÁRIO TESTE COM UNIDADE ===")
# Atualizar usuário teste com unidade
usuario_update = {
    "unidade_id": unidade_id
}
status, result = fazer_requisicao("PATCH", "/usuarios?email=eq.teste@instituicao.edu.br", usuario_update)
print(f"Status: {status}")
if result:
    print(f"Usuário atualizado: {json.dumps(result, indent=2, ensure_ascii=False)}")

print("\n=== 3. INSERINDO CURSOS ===")
curso1 = {
    "unidade_id": unidade_id,
    "nome": "Técnico em Informática",
    "codigo": "TI001",
    "tipo": "tecnico",
    "duracao_dias": 360,
    "carga_horaria": 1200,
    "situacao": "ativo"
}
status, result = fazer_requisicao("POST", "/cursos", curso1)
print(f"Curso 1 - Status: {status}")
if result:
    curso1_id = result[0].get('id') if isinstance(result, list) else result.get('id')
    print(f"✓ Técnico em Informática criado (ID: {curso1_id})")

print("\n=== 4. INSERINDO COMPONENTES CURRICULARES ===")
comp1 = {
    "curso_id": curso1_id,
    "nome": "Programação em Python",
    "codigo": "PROG001",
    "carga_horaria": 60,
    "competencias": ["programação", "python", "algoritmos"],
    "ativo": True
}
status, result = fazer_requisicao("POST", "/componentes_curriculares", comp1)
print(f"Componente 1 - Status: {status}")
if result:
    print(f"✓ Programação em Python criada")

comp2 = {
    "curso_id": curso1_id,
    "nome": "Banco de Dados",
    "codigo": "BD001",
    "carga_horaria": 40,
    "competencias": ["banco de dados", "SQL", "design"],
    "ativo": True
}
status, result = fazer_requisicao("POST", "/componentes_curriculares", comp2)
print(f"Componente 2 - Status: {status}")
if result:
    print(f"✓ Banco de Dados criado")

print("\n=== 5. INSERINDO TURMAS ===")
turma = {
    "unidade_id": unidade_id,
    "curso_id": curso1_id,
    "nome": "Turma 2026.1",
    "periodo": "2026.1",
    "data_inicio": "2026-01-15",
    "data_fim": "2026-12-20",
    "sala": "Sala 101",
    "capacidade": 30,
    "situacao": "planejada"
}
status, result = fazer_requisicao("POST", "/turmas", turma)
print(f"Turma - Status: {status}")
if result:
    turma_id = result[0].get('id') if isinstance(result, list) else result.get('id')
    print(f"✓ Turma 2026.1 criada (ID: {turma_id})")

print("\n=== 6. INSERINDO HORÁRIOS ===")
# Segunda (dia_semana = 1)
horario1 = {
    "turma_id": turma_id,
    "dia_semana": 1,
    "hora_inicio": "09:00:00",
    "hora_fim": "10:30:00"
}
status, result = fazer_requisicao("POST", "/turma_horarios", horario1)
print(f"Horário 1 (Seg) - Status: {status}")

# Quarta (dia_semana = 3)
horario2 = {
    "turma_id": turma_id,
    "dia_semana": 3,
    "hora_inicio": "09:00:00",
    "hora_fim": "10:30:00"
}
status, result = fazer_requisicao("POST", "/turma_horarios", horario2)
print(f"Horário 2 (Qua) - Status: {status}")

# Sexta (dia_semana = 5)
horario3 = {
    "turma_id": turma_id,
    "dia_semana": 5,
    "hora_inicio": "09:00:00",
    "hora_fim": "10:30:00"
}
status, result = fazer_requisicao("POST", "/turma_horarios", horario3)
print(f"Horário 3 (Sex) - Status: {status}")
if result:
    print(f"✓ 3 horários inseridos com sucesso")

print("\n" + "="*50)
print("✅ Dados de teste inseridos com sucesso!")
print("="*50)
print("\n📋 Próximos passos:")
print("1. Acesse http://localhost:5173 no navegador")
print("2. Faça login com: teste@instituicao.edu.br / SenhaForte123!")
print("3. Você deve ver 'Campus Central' na página de Fundação")
print("4. Teste os links para Cursos, Horários e outras páginas")
print("5. As páginas devem mostrar dados sem erro 403 (RLS funcionando!)")
