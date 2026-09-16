# 📋 Guia: Aplicar Migrations 002 e 003 no Supabase

## ✅ Status Atual
- ✅ Migrations criadas localmente: `banco/migrations/002_cursos.sql` e `003_turmas.sql`
- ✅ RLS Policies criadas: `banco/politicas/002_cursos_rls.sql` e `003_turmas_rls.sql`
- ❌ Tabelas ainda não existem no Supabase (precisa aplicar as migrations)

---

## 📝 Passo a Passo para Aplicar as Migrations

### Opção 1: Via Supabase UI (Recomendado - 5 min)

1. **Acessar o SQL Editor:**
   - URL: https://app.supabase.com/project/xgwnqjokdutagfqfynfz/sql/new
   - Projeto: `xgwnqjokdutagfqfynfz`

2. **Executar Migration 002 (Cursos e Componentes):**
   - Cole o conteúdo de: `banco/migrations/002_cursos.sql`
   - Clique em "Executar" ou pressione `Ctrl+Enter`
   - Confirme quando "Query bem-sucedida" aparecer

3. **Executar Migration 003 (Turmas e Horários):**
   - Cole o conteúdo de: `banco/migrations/003_turmas.sql`
   - Clique em "Executar" ou pressione `Ctrl+Enter`
   - Confirme quando "Query bem-sucedida" aparecer

4. **Ativar RLS para Cursos (Policy 002):**
   - Cole o conteúdo de: `banco/politicas/002_cursos_rls.sql`
   - Clique em "Executar"
   - Confirme sucesso

5. **Ativar RLS para Turmas (Policy 003):**
   - Cole o conteúdo de: `banco/politicas/003_turmas_rls.sql`
   - Clique em "Executar"
   - Confirme sucesso

---

### Opção 2: Via Supabase CLI (Terminal)

Se tiver `supabase` CLI instalado:

```bash
# Navegar para o projeto
cd c:\Users\luizx\matrix.edu\matrix.edu

# Executar migrations
supabase db push --db-url postgresql://postgres:password@host/database < banco/migrations/002_cursos.sql
supabase db push --db-url postgresql://postgres:password@host/database < banco/migrations/003_turmas.sql
```

---

### Opção 3: Python Script (Automático)

```python
from supabase import create_client
import os

cliente = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

# Verificar se tabelas existem
tabelas = ["cursos", "componentes_curriculares", "turmas", "turma_horarios"]
for tabela in tabelas:
    try:
        cliente.table(tabela).select("*").limit(1).execute()
        print(f"✅ {tabela} existe")
    except:
        print(f"❌ {tabela} não existe - execute as migrations")
```

---

## ✅ Como Verificar se Funcionou

Depois de aplicar as migrations, abra o SQL Editor e execute:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Você deve ver:
- ✅ `cursos`
- ✅ `componentes_curriculares`
- ✅ `turmas`
- ✅ `turma_horarios`

---

## 🔗 Links Úteis

- SQL Editor: https://app.supabase.com/project/xgwnqjokdutagfqfynfz/sql/new
- Admin Panel: https://app.supabase.com/project/xgwnqjokdutagfqfynfz/editor
- Docs: https://supabase.com/docs/guides/database/overview

---

## 📊 Próximas Etapas (Após Aplicar Migrations)

1. ✅ Criar usuário de teste no Supabase Auth
2. ✅ Testar login real no frontend
3. ✅ Validar endpoints com token autenticado
4. ✅ Expandir para módulos de negócio
