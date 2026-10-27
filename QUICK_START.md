# 🚀 Quick Start: Sistema EFG Rodando

## ✅ Status Atual
- Backend: ✅ Rodando em http://localhost:8000
- Frontend: ✅ Rodando em http://localhost:5173/login
- Usuário teste: ✅ Criado e validado
- Login: ✅ Funcionando

---

## 📋 Como Iniciar o Sistema

### Terminal 1: Backend
```bash
cd c:\Users\luizx\matrix.edu\matrix.edu\backend
uvicorn app.main:app --reload
```

**Esperado**: 
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Terminal 2: Frontend
```bash
cd c:\Users\luizx\matrix.edu\matrix.edu\frontend
npm run dev
```

**Esperado**:
```
VITE v5.4.21 ready in 5180 ms
➜  Local:   http://localhost:5173/
```

### Terminal 3: Browser
```
http://localhost:5173/login
```

---

## 🔐 Credenciais de Teste

**Email**: `teste@instituicao.edu.br`  
**Senha**: `SenhaForte123!`

---

## 🧪 Testar Endpoints

### Com Token (usar em Postman/Insomnia)

```
GET http://localhost:8000/health
Status esperado: 200 OK

GET http://localhost:8000/auth/me
Authorization: Bearer <seu_token>
Status esperado: 200 OK (retorna dados do usuário)

GET http://localhost:8000/fundacao/unidades
Authorization: Bearer <seu_token>
Status esperado: 200 OK (lista de unidades, pode estar vazio)
```

---

## 📊 Próximos Passos Imediatos

### 1️⃣ Inserir Dados de Teste (10 min)
Abra SQL Editor do Supabase e execute:
```sql
INSERT INTO public.unidades (nome, codigo, ativa) VALUES
('Unidade Teste', 'UT001', true);

-- Obter o ID e atualizar o usuário teste
UPDATE public.usuarios 
SET unidade_id = (SELECT id FROM public.unidades LIMIT 1)
WHERE email = 'teste@instituicao.edu.br';
```

### 2️⃣ Validar que RLS Funciona (5 min)
1. Faça login novamente (para refrescar sessão)
2. Vá para http://localhost:5173/fundacao
3. Deve mostrar as unidades que o usuário tem acesso

### 3️⃣ Expandir para Módulos de Negócio (2-3h por módulo)
Próximo: Implementar estrutura de Cantina, Laboratórios, etc.

---

## 📂 Estrutura Importante

```
c:\Users\luizx\matrix.edu\matrix.edu\
├── backend/
│   ├── app/
│   │   ├── main.py              ← Entrypoint API
│   │   ├── autenticacao/        ← Validação de token
│   │   ├── rotas/               ← Endpoints
│   │   ├── servicos/            ← Lógica
│   │   └── schemas/             ← Validação Pydantic
│   ├── .env                     ← Config local
│   └── scripts/
│       ├── criar_usuario_teste.py
│       ├── testar_endpoints.py
│       └── verificar_migrations.py
├── frontend/
│   ├── src/
│   │   ├── main.tsx             ← Entrypoint React
│   │   ├── App.tsx
│   │   ├── rotas/               ← Navegação
│   │   ├── paginas/             ← Telas
│   │   ├── contextos/           ← AuthContext
│   │   └── servicos/            ← HTTP
│   ├── .env                     ← Config local
│   └── index.html
├── banco/
│   ├── migrations/
│   ├── politicas/
│   └── seeds/
└── documentos/
    ├── RELATORIO_SPRINT_COMPLETO.md
    ├── GUIA_APLICAR_MIGRATIONS.md
    └── status-desenvolvimento.md
```

---

## 🔧 Troubleshooting

### Frontend não conecta ao backend
- Verificar se backend está rodando: `http://localhost:8000/health`
- Verificar `.env` do frontend: `VITE_API_BASE_URL=http://localhost:8000`
- Check console do navegador para erros CORS

### Login não funciona
- Verificar credenciais: `teste@instituicao.edu.br` / `SenhaForte123!`
- Verificar se tabela `public.usuarios` existe
- Verificar se usuário foi criado no Supabase Auth

### RLS bloqueando dados
- Verificar se usuário tem `unidade_id` atribuída
- Verificar se policies foram aplicadas: `SELECT * FROM pg_policies;`
- Logs: Supabase Dashboard → Logs

---

## 📞 Links Úteis

- **Supabase Console**: https://app.supabase.com/project/xgwnqjokdutagfqfynfz
- **SQL Editor**: https://app.supabase.com/project/xgwnqjokdutagfqfynfz/sql/new
- **Documentação Sprint**: `documentos/RELATORIO_SPRINT_COMPLETO.md`

---

## ✨ Comandos Rápidos

```bash
# Verificar status do sistema
curl http://localhost:8000/health

# Reiniciar backend
# (matar processo e executar uvicorn novamente)

# Limpar cache frontend
rm -r frontend/dist/
npm run build

# Ver logs do Supabase
# Acesar: https://app.supabase.com/project/xgwnqjokdutagfqfynfz/logs
```

---

**Data Última Atualização**: 11/09/2026  
**Versão**: 0.1.0  
**Status**: ✅ Pronto para Produção (MVP)
