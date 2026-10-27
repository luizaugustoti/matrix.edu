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
- Painel de vagas do estacionamento.
