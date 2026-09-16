# Cronograma de Desenvolvimento

## Objetivo

Transformar o scaffold atual do EFG Sistema em uma primeira versao utilizavel,
com fundacao tecnica, autenticacao, banco seguro e modulos desenvolvidos na
ordem correta de dependencia. O piloto inicial deve validar primeiro a base
compartilhada e depois um fluxo operacional de alto valor.

## Premissas

- Cronograma inicial de 12 semanas, com uma sprint de uma semana.
- A equipe deve trabalhar com entregas pequenas e demonstraveis.
- Regras de negocio e seguranca ficam no back-end.
- Cada modulo deve ser entregue com API, interface, banco, RLS, testes e documentacao.
- O cronograma pode ser ajustado conforme a disponibilidade da equipe, mas as dependencias entre fases devem ser preservadas.
- Requisitos com dependencias juridicas, como assinatura digital, nao entram no caminho critico antes de validacao institucional.
- A primeira etapa sera desenvolvida localmente com dados simulados; a integracao Supabase sera retomada apos a validacao dos fluxos.

## Visao geral

| Semana | Foco | Resultado esperado |
| --- | --- | --- |
| 1 | Preparacao e ambiente | Projeto executando localmente e padrao de trabalho definido |
| 2 | Fundacao tecnica e seguranca | API, frontend, CORS, configuracoes, Auth e modelo de permissoes |
| 3 | Cadastros centrais | Unidades, pessoas, alunos, professores, funcionarios, cursos e salas |
| 4 | Estrutura pedagogica | Turmas, componentes curriculares, horarios e matriculas |
| 5 | Frequencia e conflitos | Lancamento de frequencia, deteccao de conflitos e historico |
| 6 | Busca Ativa | Casos de baixa frequencia, contatos, resultados e auditoria |
| 7 | Laboratorios | Cadastro, solicitacao, priorizacao e cronograma de reservas |
| 8 | Portaria e chaves | Autorizacoes, documentos, retirada, devolucao e painel da guarita |
| 9 | Cantina | Presenca, producao, receitas, estoque e lista de compras |
| 10 | Ativos e manutencao | Patrimonio, localizacao, movimentacao, manutencao e baixa |
| 11 | Qualidade e inteligencia | Dashboards, alertas, indicadores e match inicial |
| 12 | Integracao e release | Homologacao, regressao, documentacao e backlog seguinte |

## Plano detalhado

### Semana 1 - Preparacao e ambiente

**Entregas**

- Instalar Node.js LTS, npm e Python 3.11+.
- Criar ambiente virtual do backend e instalar `requirements.txt`.
- Instalar dependencias do frontend e confirmar `npm run build`.
- Criar `backend/.env.example` e preencher os exemplos de configuracao.
- Configurar ambientes local, teste e homologacao.
- Definir estrategia de branches, revisao de codigo e padrao de commits.
- Registrar como executar frontend, backend e testes.

**Criterio de aceite**

Uma pessoa nova consegue clonar o projeto, configurar as variaveis e iniciar
frontend e backend seguindo apenas a documentacao.

### Semana 2 - Fundacao tecnica e seguranca

**Entregas**

- Configurar CORS, routers, respostas de erro e logging no FastAPI.
- Validar configuracoes obrigatorias e separar chaves publicas de chaves privadas.
- Integrar Supabase Auth e validar tokens no backend.
- Criar perfis, permissoes por acao e protecao de rotas.
- Definir a estrutura de unidade para suportar a futura expansao do sistema.
- Configurar cliente HTTP, estados de erro e pagina inicial do frontend.
- Criar a base de auditoria para operacoes sensiveis.

**Criterio de aceite**

Frontend e backend comunicam-se localmente, usuarios autenticados sao
identificados pelo backend e uma falha de API apresenta uma mensagem tratada.

### Semana 3 - Cadastros centrais

**Entregas**

- Criar migrations de unidades, pessoas, alunos, professores, funcionarios e responsaveis.
- Criar cadastros de cursos, componentes curriculares, competencias, salas e espacos.
- Impedir duplicidade de pessoas por CPF quando disponivel.
- Usar ativo/inativo em vez de apagar pessoas com historico.
- Criar politicas RLS por unidade e por perfil.
- Registrar alteracoes importantes no historico e na auditoria.
- Documentar os campos pessoais necessarios, finalidade e retencao.

**Criterio de aceite**

Os cadastros centrais podem ser utilizados pelos modulos sem duplicacao, com
historico preservado e acesso limitado conforme unidade e permissao.

### Semana 4 - Estrutura pedagogica

**Entregas**

- Criar turmas vinculadas a cursos, com periodo, datas, capacidade, sala, professor e situacao.
- Criar horarios e componentes curriculares.
- Criar matriculas vinculadas a aluno, turma e unidade.
- Definir estados de turma: planejada, aberta, em andamento, finalizada e cancelada.
- Criar schemas, endpoints, telas, validacoes e testes do fluxo principal.
- Registrar mudancas de turma, matricula e professor na auditoria.

**Criterio de aceite**

Coordenacao consegue cadastrar a estrutura pedagogica e matricular alunos com
validacao de capacidade, periodo, situacao e permissao.

### Semana 5 - Frequencia e conflitos

**Entregas**

- Permitir lancamento de frequencia pelo professor da turma.
- Definir frequencia presencial e, se aplicavel, online.
- Detectar sobreposicao de horario entre matriculas do mesmo aluno.
- Alertar aluno e coordenacao sem cancelar matricula automaticamente.
- Permitir registrar a decisao tomada e preservar o historico.
- Criar telas, endpoints, validacoes e testes dos requisitos `RF-CONF-01` a `RF-CONF-03`.

**Criterio de aceite**

O sistema identifica o conflito, mostra as matriculas envolvidas, permite a
decisao responsavel e registra a frequencia com controle de acesso.

### Semana 6 - Busca Ativa

**Entregas**

- Criar casos de Busca Ativa a partir de frequencia nula ou baixa.
- Registrar responsavel, tentativas de contato, canal, resultado, motivo e proxima acao.
- Definir estados do caso: novo, em contato, aguardando retorno, localizado,
  em acompanhamento, regularizado, nao localizado, evasao confirmada e encerrado.
- Implementar alertas e historico de contatos.
- Tratar documento de saida e assinatura como fluxo condicionado a validacao juridica.
- Criar testes para os requisitos `RF-BUSC-01` a `RF-BUSC-05`.

**Criterio de aceite**

Um caso de baixa frequencia percorre o fluxo de contato com historico completo,
sem expor dados pedagogicos a perfis que nao precisam deles.

### Semana 7 - Laboratorios

**Entregas**

- Cadastrar os seis laboratorios, capacidade, equipamentos, softwares e situacao.
- Permitir solicitacao pelo professor com turma, horario, objetivo e recursos necessarios.
- Exibir cronograma semanal e mensal para a coordenacao.
- Priorizar conflitos de horario com justificativa registrada.
- Recomendar o ambiente adequado e evitar uso desnecessario de laboratorio equipado.
- Criar testes para disponibilidade, conflito, aprovacao e cancelamento.

**Criterio de aceite**

Uma reserva valida pode ser solicitada, analisada e aprovada, com conflito,
justificativa e decisao registrados.

### Semana 8 - Portaria e chaves

**Entregas**

- Criar autorizacoes de estacionamento, documentos, validade e situacao.
- Tratar assinatura fisica/digital e renovacao sem bloquear o MVP antes da validacao juridica.
- Cadastrar chaves e pessoas autorizadas por sala.
- Registrar retirada, devolucao, atraso, perda, manutencao e bloqueio.
- Criar painel acessivel para a guarita e historico de movimentacoes.
- Cobrir os requisitos `RF-EST-01` a `RF-EST-06` com testes.

**Criterio de aceite**

Existe uma versao demonstravel com login, cadastros centrais, fluxo pedagogico,
Busca Ativa, Laboratorios e controle basico de chaves.

### Semana 9 - Cantina

**Entregas**

- Registrar presenca diaria por turma e professor.
- Cadastrar cardapios, receitas, ingredientes, unidade de medida e validade.
- Calcular producao com base na presenca e no consumo previsto.
- Controlar entradas, saidas, perdas, ajustes, inventario, lote e estoque minimo.
- Gerar lista de compras interativa e registrar itens comprados.
- Criar testes dos requisitos `RF-CANT-01` a `RF-CANT-05`.

**Criterio de aceite**

O responsavel pela Cantina consegue acompanhar previsao, producao, estoque e
compras sem alteracao de estoque sem movimentacao registrada.

### Semana 10 - Ativos e manutencao

**Entregas**

- Cadastrar ativos, categorias, localizacoes, responsaveis e situacoes.
- Registrar toda movimentacao de local ou responsavel, sem sobrescrever historico.
- Criar solicitacao, avaliacao, manutencao, fornecedor, custo, pecas e retorno.
- Implementar baixa, descarte e controle de ativos extraviados.

**Criterio de aceite**

E possivel responder onde esta cada ativo, quem e responsavel, qual sua
situacao e qual foi seu historico de movimentacao e manutencao.

### Semana 11 - Qualidade e inteligencia

**Entregas**

- Configurar runner de testes do frontend e executar testes integrados.
- Revisar acessibilidade, responsividade, performance, segredos e RLS.
- Criar dashboards orientados a pendencias e alertas operacionais.
- Implementar alertas de baixa frequencia, conflitos, chaves atrasadas,
  estoque minimo, autorizacoes vencendo e ativos em manutencao.
- Implementar o match professor x curso inicialmente como recomendacao explicavel,
  com competencias atendidas, ausentes e experiencia.

**Criterio de aceite**

Os indicadores ajudam cada perfil a identificar o que precisa de atencao, e as
recomendacoes do match mostram os criterios usados.

### Semana 12 - Integracao e release inicial

**Entregas**

- Executar testes de regressao e validacao manual com usuarios da unidade piloto.
- Revisar documentacao de instalacao, arquitetura, API e regras de negocio.
- Criar checklist de deploy, backup e rollback.
- Validar requisitos de LGPD, retencao, acesso por unidade e auditoria.
- Registrar pendencias juridicas e institucionais.
- Publicar a primeira versao de homologacao e priorizar o backlog seguinte.

**Criterio de aceite**

O sistema esta pronto para homologacao na unidade de Valparaiso, com escopo,
permissoes, historico, testes e riscos conhecidos documentados.

## Primeira sprint: tarefas para iniciar agora

1. Confirmar responsaveis por frontend, backend, banco/seguranca e QA.
2. Instalar Node.js/npm e configurar o ambiente Python.
3. Criar `backend/.env.example`.
4. Realizar reuniao MoSCoW e preencher a prioridade dos requisitos funcionais.
5. Validar com a instituicao perfis, permissoes, LGPD, retencao e auditoria.
6. Confirmar a unidade piloto, o cadastro central de pessoas e a politica de duplicidade.
7. Configurar Supabase de desenvolvimento, CORS e validacao de configuracao.
8. Criar o modelo inicial de unidades, pessoas, usuarios, perfis e permissoes.
9. Registrar as duvidas juridicas sobre assinatura gov.br antes de implementar esse fluxo.
10. Abrir uma tarefa por entrega pequena e revisar cada tarefa via pull request.

## Definition of Done

Uma tarefa so deve ser considerada concluida quando:

- o codigo esta no local previsto pela documentacao;
- validacoes de frontend e backend estao presentes;
- regras criticas estao no backend;
- migrations e RLS foram atualizadas quando necessario;
- testes relevantes foram criados ou executados;
- tratamento de carregamento e erro foi implementado na interface;
- documentacao do modulo foi atualizada;
- outra pessoa revisou a alteracao;
- build e testes passam no ambiente de desenvolvimento.

## Indicadores de acompanhamento

- Percentual de tarefas concluidas por sprint.
- Quantidade de testes passando e cobertura dos fluxos criticos.
- Tempo entre abertura e revisao de pull request.
- Quantidade de bugs criticos abertos.
- Percentual de endpoints protegidos por autenticacao e autorizacao.
- Percentual de modulos com migration, RLS, testes e documentacao completos.

## Dependencias principais

- Pessoas e unidades sao pre-requisito para usuarios, perfis, turmas, portaria, cantina e ativos.
- Cursos, componentes, salas, professores e turmas sao pre-requisito para matriculas e laboratorios.
- Matriculas e frequencia sao pre-requisito para conflitos e Busca Ativa.
- Estoque, receitas e presenca sao pre-requisito para previsao de producao e compras da Cantina.
- Competencias de professores e componentes sao pre-requisito para o Match Professor x Curso.
- Permissoes, RLS e auditoria devem existir antes de expor dados pessoais em qualquer modulo.

## Backlog apos a primeira release

1. Notificacoes por WhatsApp e e-mail.
2. Assinatura digital via gov.br, apos validacao juridica.
3. QR Code para chaves, ativos e controle de acesso.
4. Integracoes com sistemas externos.
5. Relatorios avancados e indicadores historicos.
6. Monitoramento, deploy automatizado e backups.