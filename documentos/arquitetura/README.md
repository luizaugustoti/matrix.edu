# Arquitetura

Documenta decisoes estruturais do sistema e como as partes se conectam.

## Fluxo principal
USUARIO -> REACT -> SERVICOS FRONT-END -> FASTAPI -> SERVICOS BACK-END -> SUPABASE -> POSTGRESQL

## Onde entra o Supabase Auth
O usuario autentica pelo Supabase Auth. O token de sessao e enviado pelo front, validado no back e reforcado por politicas RLS no banco.
