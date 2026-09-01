# Como criar um novo modulo

Passo a passo padrao para manter consistencia no time.

1. Criar pasta do modulo em `frontend/src/modulos/<nome-modulo>/`.
2. Criar subpastas `componentes/`, `paginas/`, `servicos/`, `tipos/`, `validacoes/`.
3. Criar/registrar rotas da interface em `frontend/src/rotas/`.
4. Criar servicos HTTP do modulo em `frontend/src/servicos/` ou dentro do modulo.
5. Criar tipos TypeScript e validacoes Zod.
6. Criar pasta correspondente em `backend/app/modulos/<nome-modulo>/`.
7. Criar rotas da API em `backend/app/rotas/` (ou router do modulo).
8. Criar regras de negocio em `backend/app/servicos/` e/ou servicos do modulo.
9. Criar schemas Pydantic em `backend/app/schemas/`.
10. Criar migrations no `banco/migrations/`.
11. Criar seeds se necessario em `banco/seeds/`.
12. Criar/atualizar politicas RLS em `banco/politicas/`.
13. Criar testes no front, back e pasta `testes/`.
14. Atualizar documentacao do modulo (README front e back).

## Checklist rapido antes do PR
- Nome do modulo esta claro?
- Rotas e permissoes foram definidas?
- Regras de negocio estao no back-end?
- Documentacao foi atualizada?
- Testes minimos foram incluidos?
