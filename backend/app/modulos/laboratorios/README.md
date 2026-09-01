# Modulo Reserva de Laboratorios (Back-end)

## O que faz
Gerencia criacao e validacao de reservas.

## Problemas que resolve
- Conflitos de horario e uso de sala

## Telas relacionadas (front)
- Agenda e formulario de reserva

## Regras de negocio
- Nao permitir sobreposicao
- Validar janela de horario

## Arquivos principais
- rotas de reservas
- servicos de disponibilidade
- schemas de reserva

## Como conversa com o front
Atende requisicoes de disponibilidade e confirmacao de reserva.

## Exemplo de uso
`POST /laboratorios/reservas` valida e grava reserva.
