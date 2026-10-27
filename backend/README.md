# Back-end (FastAPI + Pydantic)

Este diretorio contem a API REST e as regras de negocio do sistema.

## Finalidade
Centralizar logica critica, validacoes do servidor, autenticacao e integracao com Supabase/PostgreSQL.

## O que deve ficar aqui
- Endpoints da API
- Regras de negocio
- Schemas Pydantic
- Configuracoes da aplicacao
- Autenticacao e autorizacao
- Integracao com Supabase

## O que nao deve ficar aqui
- Codigo de interface (React)
- Credenciais reais
- Regras de negocio escondidas apenas no front-end

## Estrutura
```
backend/
├── app/
│   ├── rotas/
│   ├── servicos/
│   ├── modelos/
│   ├── schemas/
│   ├── configuracoes/
│   ├── autenticacao/
│   ├── modulos/
│   ├── integracoes/supabase/
│   └── main.py
├── testes/
├── .env.example
└── requirements.txt
```

## Explicacao das pastas obrigatorias

### app/rotas/
Define endpoints da API.

Exemplos:
- `GET /usuarios`
- `POST /usuarios`
- `GET /reservas`
- `POST /reservas`

### app/servicos/
Regras de negocio centrais.

Exemplos:
- `verificar_conflito_matricula.py`
- `realizar_match_professor_curso.py`
- `verificar_disponibilidade_laboratorio.py`

### app/modelos/
Representacao interna das entidades usadas no sistema.

### app/schemas/
Contratos de entrada e saida da API com Pydantic.

### app/configuracoes/
Configuracoes gerais da aplicacao.

Exemplo:
- `config.py`

### app/autenticacao/
Validacao de sessao/token e verificacao de permissoes.

### app/integracoes/supabase/
Comunicacao do back-end com Supabase.

Regra: nao espalhar conexao Supabase em varias pastas.

## Quem normalmente trabalha aqui
- Estudantes focados em API, regras de negocio e dados.

## Como conecta com o restante
Recebe requisicoes do front-end, processa regras e persiste dados no Supabase/PostgreSQL.

## Configuracao do Supabase

1. Copie `.env.example` para `.env`.
2. Preencha `SUPABASE_URL` com a URL do projeto.
3. Preencha `SUPABASE_ANON_KEY` com a chave anon/publica.
4. Preencha `SUPABASE_SERVICE_ROLE_KEY` somente no backend.
5. Aplique migrations, seeds e politicas na ordem descrita em `banco/README.md`.
6. Valide `GET /health/supabase`: `configured` deve retornar `true`.

Dados nao sensiveis informados para o projeto atual:

- Host PostgreSQL: `db.xgwnqjokdutagfqfynfz.supabase.co`
- Porta: `5432`
- Banco: `postgres`
- Usuario: `postgres`
- URL Supabase: `https://xgwnqjokdutagfqfynfz.supabase.co`

A senha PostgreSQL nao deve ser commitada nem enviada pelo chat. Se uma
connection string for usada em uma ferramenta local, caracteres especiais da
senha devem ser percent-encoded. A aplicacao FastAPI continua usando o cliente
Supabase; a connection string direta e destinada a migrations ou ferramentas de
administracao.

Nunca envie `SUPABASE_SERVICE_ROLE_KEY` para o frontend, para o Git ou para
mensagens de suporte. O arquivo `.env` e ignorado pelo repositorio.

## Status da integracao

A integracao esta preparada no codigo, mas aguarda o preenchimento do `.env`
local e a aplicacao das migrations no projeto Supabase de desenvolvimento.
