# Modulo Conflito de Matricula (Back-end)

## O que faz
Detecta e auxilia resolucao de conflitos de matricula.

## Problemas que resolve
- Choques de horario e inconsistencias de matricula

## Telas relacionadas (front)
- Lista de conflitos e tela de resolucao

## Regras de negocio
- Validar sobreposicao de disciplinas
- Aplicar regras institucionais de prioridade

## Arquivos principais
- rotas de conflitos
- servicos de analise
- schemas de resolucao

## Como conversa com o front
Fornece API para listar e resolver conflitos.

## Exemplo de uso
`POST /conflito-matricula/resolver`.
