# Modulo Estacionamento / Chaves

## O que este modulo faz
Controla vagas, emprestimo e devolucao de chaves.

## Problemas que resolve
- Falta de rastreabilidade de chaves
- Dificuldade de controle de vagas

## Telas esperadas
- Painel de vagas
- Registro de retirada/devolucao

## Regras de negocio esperadas
- Nao permitir retirada sem autorizacao
- Registrar historico de uso

## Arquivos principais
- `paginas/`, `componentes/`, `servicos/`, `tipos/`, `validacoes/`

## Comunicacao com o back-end
Integra com endpoints de controle de chaves e ocupacao.

## Exemplo de uso
Usuario autorizado retira chave e sistema registra evento.

---

## Controle de chaves (guarita)

Primeira parte do modulo ja implementada no front-end. Requisitos atendidos:
RF-EST-03 (gestao digital de chaves), RF-EST-04 (retirada so por pessoas
autorizadas), RF-EST-05 (historico de retirada e devolucao) e RF-EST-06
(painel visual e acessivel para a guarita).

### Onde acessar
Rota `/guarita/chaves` (link "Guarita" no menu superior).

### O que a tela faz
- Mostra todas as chaves com a situacao atual: Disponivel, Reservada, Retirada,
  Atrasada, Perdida, Em manutencao ou Bloqueada.
- Uma chave retirada vira "Atrasada" sozinha quando passa da devolucao prevista
  (a tela recalcula a cada 30 segundos) e aparece no alerta do topo.
- Resumo por situacao, que tambem funciona como filtro, busca por chave, local
  ou pessoa, e filtro por tipo de local.
- Registro de retirada: lista so as pessoas autorizadas para aquela chave e
  sugere o fim do 1o horario (20:20) ou do 2o horario (22:00) como devolucao.
- Registro de devolucao: mostra quem esta com a chave e destaca o atraso.
- Historico de movimentacoes com quem registrou cada operacao (auditoria).

### Estrutura de pastas
```
modulos/estacionamento/
├── paginas/ControleChaves.tsx        # tela da rota /guarita/chaves
├── componentes/                      # cartao, selo, dialogos, historico, icones
├── servicos/chaves.ts                # unico ponto de acesso aos dados
├── dados-simulados/chaves.ts         # dados de exemplo enquanto nao ha API
├── tipos/chaves.ts                   # tipos TypeScript (formato da API)
├── validacoes/chaves.ts              # schemas Zod dos formularios
├── utilitarios/situacao.ts           # regras de exibicao (atrasada, rotulos)
└── hooks/useAgora.ts                 # relogio da tela
```

Os estilos usam CSS Modules e as cores de `src/estilos/tokens.css`.

### Dados simulados x API real
Enquanto o back-end nao tiver as rotas da guarita, o servico usa dados
simulados (nomes ficticios). O selo "Dados simulados" aparece no topo da tela.
Os dados simulados ficam so na memoria: recarregar a pagina volta ao exemplo.

Para usar a API real, adicione no `frontend/.env`:

```
VITE_GUARITA_DADOS_SIMULADOS=false
```

### Contrato esperado da API
Campos em snake_case, datas em ISO 8601. Os tipos completos estao em
`tipos/chaves.ts`.

| Metodo | Rota | Corpo | Resposta |
| --- | --- | --- | --- |
| GET | `/guarita/chaves` | - | `Chave[]` |
| GET | `/guarita/chaves/{chave_id}/autorizados` | - | `PessoaAutorizada[]` |
| POST | `/guarita/chaves/retiradas` | `{ chave_id, pessoa_id, devolucao_prevista, observacao? }` | `Chave` atualizada |
| POST | `/guarita/chaves/devolucoes` | `{ chave_id, observacao? }` | `Chave` atualizada |
| GET | `/guarita/chaves/movimentacoes?chave_id=` | - | `Movimentacao[]` (mais recente primeiro) |

Regras que o back-end deve garantir (o front so antecipa os avisos):
- so pessoas autorizadas para a chave podem retira-la;
- so chaves `disponivel` ou `reservada` podem ser retiradas;
- so chaves `retirada` podem ser devolvidas;
- `devolucao_prevista` precisa ser depois do horario atual;
- quem registrou a operacao vem do token do usuario logado
  (`retirada_registrada_por` / `devolucao_registrada_por`);
- erros de regra devem voltar com `detail` em texto, que a tela exibe direto.

O status "atrasada" nao e gravado: o front calcula a partir de
`retirada_atual.devolucao_prevista`.

### Proximos passos sugeridos
- Cadastro de chaves e de autorizacoes por chave (coordenacao).
- Reserva de chave vinculada a reserva de laboratorio.

---

## Estacionamento (guarita e coordenacao)

Requisitos atendidos: RF-EST-01 (envio digital dos documentos) e RF-EST-02
(termo assinado com renovacao a cada 6 meses). O estacionamento e livre, sem
vagas numeradas: a guarita controla quem pode entrar, quem esta no patio e o
historico de entradas e saidas.

Enquanto a assinatura digital via gov.br nao tiver validacao juridica, o termo
e assinado no papel e enviado como foto ou PDF junto com a solicitacao.

### Onde acessar
As telas da guarita tem abas no topo: **Chaves**, **Estacionamento** e
**Autorizacoes**. As abas usam navegacao interna (NavLink), sem recarregar a
pagina.

- `/guarita/estacionamento`: portaria.
- `/guarita/autorizacoes`: solicitacoes e autorizacoes. Aceita
  `?filtro=analise`, `?filtro=vencendo`, `?filtro=aprovadas`, `?filtro=expiradas`,
  `?filtro=rejeitadas` e `?filtro=canceladas`.

### Portaria
- Consulta de placa no padrao antigo (ABC1234) ou Mercosul (ABC1D23).
- Mostra condutor, veiculo, situacao e validade da autorizacao.
- So libera a entrada com autorizacao aprovada e dentro da validade; nos outros
  casos mostra o motivo do bloqueio (sem cadastro, em analise, rejeitada,
  vencida, cancelada ou veiculo ja no patio).
- Lista dos veiculos no patio com saida em um clique.
- Indicadores: no patio agora, entradas hoje, autorizacoes vencendo em 30 dias
  e solicitacoes aguardando analise.
- Historico de entradas e saidas com filtro por placa e periodo.

Por LGPD, a portaria ve so nome, vinculo, veiculo e validade. Os documentos
anexados aparecem apenas na tela de autorizacoes (coordenacao). O back-end
precisa reforcar isso nas permissoes.

### Autorizacoes
Ciclo de uma autorizacao:

```
pendente -> em_analise -> aprovada (6 meses) -> expirada
                       \-> rejeitada (com motivo)
aprovada -> cancelada (com motivo)
```

- A solicitacao exige CNH, documento do veiculo (CRLV) e termo assinado,
  em PDF, JPG ou PNG de ate 5 MB cada.
- "Vencendo" = aprovada com 30 dias ou menos de validade.
- A renovacao cria uma nova solicitacao ligada a anterior (`renovacao_de`). Ao
  ser aprovada, a nova validade comeca quando a anterior terminar.
- Uma solicitacao rejeitada pode ser reenviada com os dados preenchidos.

### Arquivos principais
```
modulos/estacionamento/
├── paginas/Portaria.tsx                    # /guarita/estacionamento
├── paginas/Autorizacoes.tsx                # /guarita/autorizacoes
├── componentes/AbasGuarita.tsx             # abas entre as telas da guarita
├── componentes/Placa.tsx                   # placa no estilo Mercosul
├── componentes/DialogoSolicitacao.tsx      # nova solicitacao / renovacao
├── componentes/DialogoAnalise.tsx          # analise, aprovacao, rejeicao, cancelamento
├── componentes/HistoricoVeiculos.tsx       # entradas e saidas
├── servicos/estacionamento.ts              # unico ponto de acesso aos dados
├── dados-simulados/estacionamento.ts       # dados de exemplo enquanto nao ha API
├── tipos/estacionamento.ts
├── validacoes/estacionamento.ts            # schemas Zod
└── utilitarios/estacionamento.ts           # placa, validade, rotulos
```

Usa a mesma variavel `VITE_GUARITA_DADOS_SIMULADOS` do controle de chaves.

### Contrato esperado da API
Campos em snake_case, datas em ISO 8601, placa sempre normalizada (maiusculas,
sem hifen). Tipos completos em `tipos/estacionamento.ts`.

| Metodo | Rota | Corpo | Resposta |
| --- | --- | --- | --- |
| GET | `/guarita/estacionamento/placas/{placa}` | - | `ConsultaPlaca` |
| POST | `/guarita/estacionamento/entradas` | `{ placa }` | `MovimentacaoVeiculo` |
| POST | `/guarita/estacionamento/saidas` | `{ placa }` | `MovimentacaoVeiculo` |
| GET | `/guarita/estacionamento/patio` | - | `MovimentacaoVeiculo[]` (sem saida) |
| GET | `/guarita/estacionamento/movimentacoes?placa=` | - | `MovimentacaoVeiculo[]` (mais recente primeiro) |
| GET | `/guarita/estacionamento/autorizacoes` | - | `AutorizacaoEstacionamento[]` |
| POST | `/guarita/estacionamento/autorizacoes` | multipart: `nome_completo`, `vinculo`, `telefone?`, `placa`, `modelo`, `cor`, `tipo`, `renovacao_de?`, arquivos `cnh`, `crlv`, `termo` | `AutorizacaoEstacionamento` |
| POST | `/guarita/estacionamento/autorizacoes/{id}/analise` | - | `AutorizacaoEstacionamento` |
| POST | `/guarita/estacionamento/autorizacoes/{id}/aprovacao` | - | `AutorizacaoEstacionamento` |
| POST | `/guarita/estacionamento/autorizacoes/{id}/rejeicao` | `{ motivo }` | `AutorizacaoEstacionamento` |
| POST | `/guarita/estacionamento/autorizacoes/{id}/cancelamento` | `{ motivo }` | `AutorizacaoEstacionamento` |

Regras que o back-end deve garantir:
- entrada so com autorizacao `aprovada` e `valida_ate` no futuro;
- o mesmo veiculo nao entra de novo sem registrar a saida;
- solicitacao so com os tres anexos; arquivos guardados no Supabase Storage,
  com `url` assinada e temporaria na resposta;
- so uma solicitacao em analise por placa; placa com autorizacao valida so pode
  pedir renovacao;
- aprovacao vale 6 meses, a partir do fim da anterior quando for renovacao;
- rejeicao e cancelamento exigem motivo;
- quem registrou cada operacao vem do token (`analisada_por`,
  `entrada_registrada_por`, `saida_registrada_por`);
- erros de regra voltam com `detail` em texto.

O status "expirada" pode ser gravado por uma rotina diaria, mas o front tambem
calcula a partir de `valida_ate`.
