# Modulo Reserva de Laboratorios

## O que este modulo faz
Gerencia reservas de laboratorios e disponibilidade.

## Problemas que resolve
- Conflitos de horario
- Falta de visibilidade sobre ocupacao

## Telas esperadas
- Calendario/lista de reservas
- Formulario de reserva

## Regras de negocio esperadas
- Nao permitir sobreposicao de reservas no mesmo laboratorio
- Validar horario e periodo

## Arquivos principais
- `paginas/`, `componentes/`, `servicos/`, `tipos/`, `validacoes/`

## Comunicacao com o back-end
Consome endpoints de reservas e disponibilidade.

## Exemplo de uso
Professor solicita horario e sistema valida conflito antes de confirmar.
