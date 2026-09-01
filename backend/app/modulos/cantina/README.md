# Modulo Cantina (Back-end)

## O que faz
Implementa regras e endpoints para operacao da cantina.

## Problemas que resolve
- Controle de pedidos e status

## Telas relacionadas (front)
- Listagem e cadastro de pedidos

## Regras de negocio
- Validacao de itens
- Fluxo de status de pedido

## Arquivos principais
- rotas do modulo
- servicos de pedido
- schemas de entrada/saida

## Como conversa com o front
Expondo endpoints REST consumidos por `frontend/src/servicos/`.

## Exemplo de uso
Receber `POST /cantina/pedidos` e registrar pedido no Supabase.
