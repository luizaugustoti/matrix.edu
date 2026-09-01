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
