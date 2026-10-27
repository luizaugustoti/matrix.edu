# Status do Desenvolvimento

Atualizado em: 07/09/2026

## Objetivo atual

Concluir a primeira sprint da fundacao tecnica do Sistema EFG, preparando o
projeto para autenticacao, cadastros centrais, permissoes e desenvolvimento dos
modulos conforme o cronograma.

## Concluido

- Estrutura inicial de frontend, backend, banco, documentos e testes criada.
- Frontend React/TypeScript com Vite e rotas dos modulos provisoriamente registradas.
- Backend FastAPI com endpoint `GET /health`.
- Cliente HTTP Axios centralizado no frontend.
- Cronograma de 12 semanas alinhado aos requisitos e dependencias do negocio.
- Sintese dos requisitos funcionais e regras transversais documentada.
- CORS adicionado ao FastAPI, configurado por `FRONTEND_URL` e `CORS_ORIGINS`.
- Nome da aplicacao do backend passou a usar `APP_NAME`.
- Ambiente virtual `backend/.venv` criado e dependencias do backend instaladas.
- API importada com sucesso a partir do diretorio `backend`.
- Rotas OpenAPI e `GET /health` confirmados.
- Dependencia compartilhada de autenticacao criada em `backend/app/autenticacao/`.
- Endpoint protegido `GET /auth/me` criado.
- Requisicao sem token para `/auth/me` validada com resposta `401`.
- Migration inicial da fundacao criada em `banco/migrations/001_fundacao.sql`.
- Seed de permissoes criado em `banco/seeds/001_permissoes_fundacao.sql`.
- Politicas RLS iniciais criadas em `banco/politicas/001_fundacao_rls.sql`.
- Schemas Pydantic da fundacao criados em `backend/app/schemas/fundacao.py`.
- Servicos de unidades e pessoas criados em `backend/app/servicos/fundacao.py`.
- Rotas autenticadas da fundacao criadas em `backend/app/rotas/fundacao.py`.
- Endpoints sem token validados com resposta `401`.
- Testes unitarios dos servicos criados em `backend/testes/test_servicos_fundacao.py`.
- Verificacao direta dos servicos com cliente simulado concluida com sucesso.
- Suite pytest executada formalmente: 5 testes passaram em 3,40 segundos.
- Testes HTTP da fundacao criados em `backend/testes/test_rotas_fundacao.py`.
- Suite completa da fundacao executada: 10 testes passaram em 3,76 segundos.
- Tipos TypeScript da fundacao criados em `frontend/src/tipos/fundacao.ts`.
- Servico HTTP da fundacao criado em `frontend/src/servicos/fundacao.ts`.
- Tela inicial funcional de cadastros criada em `frontend/src/paginas/Fundacao.tsx`.
- Cliente HTTP preparado para enviar `efg_access_token` como Bearer token.
- Rota `/fundacao` registrada e definida como entrada provisoria da aplicacao.
- Modulo de Administracao criado em `frontend/src/paginas/Administracao.tsx`.
- Diagnostico de conexao Supabase disponivel na rota frontend `/administracao`.
- O painel nao exibe nem salva credenciais; a substituicao ocorre no `backend/.env`.
- Contratos administrativos criados em `backend/app/schemas/administracao.py`.
- Consultas de perfis e permissoes criadas em `backend/app/servicos/administracao.py`.
- Rotas protegidas `/administracao/perfis` e `/administracao/permissoes` registradas.
- Rotas administrativas sem token validadas com resposta `401`.
- Migration `002_cursos.sql` criada para cursos e componentes curriculares.
- RLS de cursos criada em `banco/politicas/002_cursos_rls.sql`.
- Schemas, servicos e rotas pedagogicas de cursos e componentes implementados.
- As quatro rotas pedagogicas foram validadas sem token com resposta `401`.
- Migration `003_turmas.sql` criada para turmas e horarios.
- RLS de turmas criada em `banco/politicas/003_turmas_rls.sql`.
- Schemas, servicos e rotas de turmas e horarios implementados.
- As quatro rotas de turmas foram validadas sem token com resposta `401`.
- Dependencia `require_permission` criada para autorização por recurso e ação.
- Operacoes de leitura e cadastro passaram a declarar a permissao exigida.
- Seed `002_permissoes_pedagogico.sql` criado.
- Policies de escrita criadas em `banco/politicas/004_escrita_rls.sql`.
- Cliente Supabase simulado dos testes atualizado para cobrir a checagem de permissao.
- Tipos e servico frontend de cursos criados em `frontend/src/tipos/pedagogico.ts` e `frontend/src/servicos/pedagogico.ts`.
- Tela de cursos com selecao de unidade, listagem e cadastro criada em `frontend/src/paginas/Cursos.tsx`.
- Rota frontend `/cursos` registrada.
- Tipos de componentes curriculares criados em `frontend/src/tipos/componentes.ts`.
- Servicos de listagem e cadastro de componentes adicionados ao serviço pedagógico.
- Tela de componentes com selecao de unidade/curso, listagem e cadastro criada em `frontend/src/paginas/Componentes.tsx`.
- Rota frontend `/componentes` registrada.
- Tipos e servicos frontend de turmas criados em `frontend/src/tipos/turmas.ts` e `frontend/src/servicos/pedagogico.ts`.
- Tela de turmas com selecao de unidade/curso, listagem e cadastro criada em `frontend/src/paginas/Turmas.tsx`.
- Rota frontend `/turmas` registrada.
- Tipos e servicos frontend de horarios criados em `frontend/src/tipos/horarios.ts` e `frontend/src/servicos/pedagogico.ts`.
- Tela de horarios com selecao de unidade/curso/turma e cadastro criada em `frontend/src/paginas/Horarios.tsx`.
- Rota frontend `/horarios` registrada.
- `frontend/index.html` criado como entrada do Vite.
- Dependencias frontend instaladas com npm.
- Build de producao gerado em `frontend/dist`.
- `frontend/.env` configurado com `VITE_API_BASE_URL=http://localhost:8000`.
- Tela branca corrigida com validacao do formato retornado pela API.
- Frontend e backend validados juntos no navegador; a API respondeu `401` sem login.
- Arquivo local `backend/.env` criado com a URL do projeto e placeholders de chaves.
- `backend/.env` confirmado como ignorado pelo Git.
- Credenciais locais do projeto Supabase preenchidas e reconhecidas pelo backend.
- `settings.supabase_configured` validado como `True` sem expor valores secretos.
- Carregamento do `backend/.env` corrigido para funcionar a partir de qualquer diretório.
- API REST do Supabase respondeu, confirmando rede e credenciais válidas.
- As oito tabelas da fundacao foram confirmadas via API REST com resposta `200`.
- Procedimento de aplicação e verificação das migrations documentado em `banco/README.md`.
- Arquivos Python compilam sem erros de sintaxe.

## Em andamento

- Instalacao e padronizacao do ambiente Node.js.
- Configuracao do projeto Supabase de desenvolvimento.
- URL e host nao sensiveis do projeto Supabase registrados nos exemplos de ambiente.
- Desenvolvimento das funcionalidades sem aplicar novas migrations no Supabase.
- Validacao de token real e leitura/escrita com RLS ativo.
- Validacao das rotas administrativas com token de usuario real e RLS.
- Testes de permissao `403` e `502` com cliente Supabase simulado.
- Revisao do warning de deprecacao do pacote externo `gotrue`.
- Revisao do warning de deprecacao do alias `anyio.BlockingPortal` usado pelo TestClient.
- Definicao final de perfis, permissoes por acao, unidades e regras de acesso.
- Configuracao do runner de testes frontend.
- Revisao de 4 vulnerabilidades reportadas pelo `npm audit`.
- Protecao da rota de Administracao por perfil administrativo.
- Aplicacao controlada das migrations pendentes no Supabase.
- Aplicacao do seed `002` e da policy `004` no Supabase.
- O build frontend ja foi gerado; o npm informou 4 vulnerabilidades (3 moderadas e 1 alta).
- Validacao do login real com usuario do Supabase e fluxos de autenticacao do browser.
- Ajuste final da navegacao protegida depois da autenticao real.

## Bloqueios conhecidos

- O comando `npm` precisa estar disponivel para executar o build do frontend.
- As migrations da fundacao foram aplicadas e as tabelas estao acessiveis.
- Perfis, permissoes por acao e regras de autorizacao por recurso ainda precisam ser finalizados.
- As prioridades MoSCoW e as regras detalhadas de permissao precisam ser validadas com a instituicao.
- Assinatura digital via gov.br depende de validacao juridica e nao deve bloquear o MVP.

## Proxima entrega

1. Continuar o desenvolvimento do backend e frontend.
2. Registrar novas migrations em `documentos/migrations-pendentes.md`.
3. Aplicar todas as migrations pendentes somente na etapa final de sincronizacao.
4. Validar tabelas, RLS e endpoints depois da aplicacao.

## Regra de atualizacao

Toda entrega deve atualizar este arquivo com a data e mover os itens entre
**Concluido**, **Em andamento** e **Bloqueios conhecidos**. Alteracoes de
requisitos devem ser registradas em `requisitos-negocio-v1.md` e refletidas no
cronograma quando afetarem dependencias ou prazo.
