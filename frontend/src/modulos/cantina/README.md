# Modulo Cantina

## O que este modulo faz
Organiza pedidos e operacoes da cantina da instituicao.

## Problemas que resolve
- Falta de controle central de pedidos
- Dificuldade para acompanhar status de atendimento

## Telas esperadas
- Listagem de pedidos
- Novo pedido
- Painel de status

## Regras de negocio esperadas
- Pedido precisa de itens validos
- Status segue fluxo definido (ex: criado -> preparando -> entregue)

## Arquivos principais
- `paginas/`
- `componentes/`
- `servicos/`
- `tipos/`
- `validacoes/`

## Comunicacao com o back-end
Usa servicos HTTP do front para endpoints de cantina no FastAPI.

## Exemplo de uso
Usuario abre a tela de pedidos, cria novo pedido e acompanha status.
