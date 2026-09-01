# EFG Sistema

## 1) O que e o sistema
O **EFG Sistema** e uma plataforma academica modular para resolver operacoes comuns da instituicao, como cantina, reservas, busca ativa, conflitos de matricula e controle de estacionamento/chaves.

## 2) Qual problema ele resolve
Hoje, processos importantes costumam ficar espalhados em planilhas, mensagens e sistemas separados. Este projeto centraliza essas operacoes em um unico sistema, com regras claras e dados confiaveis.

## 3) Tecnologias usadas
- Front-end: React, TypeScript, React Router, Context API, CSS Modules, Radix Colors, React Hook Form, Zod, Axios
- Back-end: Python, FastAPI, Pydantic, API REST, OpenAPI/Swagger
- Banco e auth: Supabase, PostgreSQL, Supabase Auth, Supabase Storage (quando necessario), RLS

> Importante: este projeto **nao usa Firebase**.

## 4) Organizacao do projeto
```
efg-sistema/
├── frontend/
├── backend/
├── banco/
├── documentos/
├── testes/
├── README.md
└── .gitignore
```

## 5) Para que serve cada pasta
- `frontend/`: aplicacao React e codigo de interface.
- `backend/`: API FastAPI e regras de negocio.
- `banco/`: migrations, seeds e politicas de seguranca (RLS).
- `documentos/`: guias de arquitetura, API, instalacao e regras do projeto.
- `testes/`: testes integrados e estrategias de qualidade entre modulos.

## 6) Instalacao (resumo)
### Front-end
1. Entrar em `frontend/`
2. Instalar dependencias: `npm install`
3. Copiar `frontend/.env.example` para `frontend/.env`

### Back-end
1. Entrar em `backend/`
2. Criar ambiente virtual Python
3. Instalar dependencias: `pip install -r requirements.txt`
4. Copiar `backend/.env.example` para `backend/.env`

## 7) Execucao (resumo)
### Front-end
`npm run dev`

### Back-end
`uvicorn app.main:app --reload`

## 8) Como configurar o Supabase
1. Criar projeto no Supabase.
2. Obter URL do projeto e chaves necessarias.
3. Configurar variaveis de ambiente no front e no back.
4. Aplicar migrations da pasta `banco/migrations/`.
5. Configurar politicas RLS em `banco/politicas/`.

## 9) Variaveis de ambiente
Veja:
- `frontend/.env.example`
- `backend/.env.example`

Nunca commitar credenciais reais.

## 10) Como criar uma nova funcionalidade
1. Definir requisito funcional com o time.
2. Criar/ajustar tela no front (`paginas` e `modulos`).
3. Criar/ajustar servico HTTP no front (`servicos`).
4. Criar endpoint no back (`rotas`).
5. Implementar regra de negocio (`servicos` no back).
6. Ajustar schema Pydantic (`schemas`) e validacao Zod (`validacoes`).
7. Se necessario, criar migration em `banco/migrations`.
8. Criar/atualizar testes.
9. Atualizar documentacao.

## 11) Como criar um novo modulo
Leia o guia completo em:
- `documentos/regras-do-projeto/como-criar-modulo.md`

## 12) Como executar testes
- Front-end: `npm run test` (quando configurado)
- Back-end: `pytest`
- Testes de sistema: pasta `testes/`

## 13) Como contribuir
1. Criar branch com nome claro.
2. Fazer mudancas pequenas e objetivas.
3. Escrever/ajustar testes e documentacao.
4. Abrir PR com descricao clara.
5. Solicitar revisao de colegas.

## 14) Fluxo do sistema
```
USUARIO
  -> REACT
  -> SERVICOS DO FRONT-END
  -> API FASTAPI
  -> REGRAS DE NEGOCIO
  -> SUPABASE
  -> POSTGRESQL
```

### Onde entra o Supabase Auth
O Supabase Auth valida identidade e sessao do usuario. O front envia token; o back valida e aplica regras de permissao. Com RLS, o proprio banco tambem reforca acesso por usuario/perfil.

## 15) Decisoes arquiteturais e motivos
1. Separacao `frontend` e `backend`.
Motivo: facilita paralelismo entre equipes e reduz conflitos.

2. Pastas com nomes simples (`componentes`, `servicos`, `paginas`, `rotas`).
Motivo: onboarding rapido de estudantes.

3. Regras de negocio no back (`backend/app/servicos`).
Motivo: evitar duplicacao de regra e garantir consistencia.

4. Integracao Supabase centralizada (`backend/app/integracoes/supabase`).
Motivo: evitar codigo de conexao espalhado.

5. Estrutura por modulos no front e no back.
Motivo: escalabilidade e organizacao por dominio funcional.

6. Zod no front e Pydantic no back.
Motivo: validacao forte nos dois lados.

7. RLS no banco.
Motivo: camada extra de seguranca e controle de acesso por linha.

## 16) Como um estudante deve usar esta documentacao
Comece por:
1. Este `README.md`
2. `frontend/README.md`
3. `backend/README.md`
4. `documentos/regras-do-projeto/onde-colocar-arquivos.md`

Esses arquivos respondem diretamente:
- Onde colocar codigo
- Como criar funcionalidade
- Como os blocos se conectam