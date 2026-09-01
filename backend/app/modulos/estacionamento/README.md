# Modulo Estacionamento / Chaves (Back-end)

## O que faz
Controla vagas e eventos de retirada/devolucao de chaves.

## Problemas que resolve
- Falta de rastreabilidade e controle

## Telas relacionadas (front)
- Painel de vagas e registro de chave

## Regras de negocio
- Exigir autorizacao para retirada
- Registrar historico de uso

## Arquivos principais
- rotas de vagas/chaves
- servicos de controle
- schemas de evento

## Como conversa com o front
Expondo endpoints para consulta e registro de eventos.

## Exemplo de uso
`POST /estacionamento/chaves/retirada`.
