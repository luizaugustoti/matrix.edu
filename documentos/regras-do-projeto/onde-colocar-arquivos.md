# Onde colocar meu arquivo?

Manual rapido para estudantes.

## Perguntas comuns

### Criei um botao. Onde coloco?
`frontend/src/componentes/`

### Criei uma tela nova. Onde coloco?
`frontend/src/paginas/`

### Criei uma chamada para a API. Onde coloco?
`frontend/src/servicos/`

### Criei uma regra de negocio. Onde coloco?
`backend/app/servicos/`

### Preciso alterar uma tabela do banco. Onde coloco?
`banco/migrations/`

### Criei schema de validacao no front. Onde coloco?
`frontend/src/validacoes/`

### Criei schema de entrada/saida da API. Onde coloco?
`backend/app/schemas/`

### Criei autenticacao/permissao. Onde coloco?
`backend/app/autenticacao/`

### Criei integracao com Supabase no back. Onde coloco?
`backend/app/integracoes/supabase/`

### Criei utilitario de formatacao. Onde coloco?
`frontend/src/utilitarios/`

## Regra de ouro
Se o arquivo for visual/reutilizavel de tela -> front-end.
Se for regra de negocio/seguranca -> back-end.
Se for estrutura de dados -> banco.
