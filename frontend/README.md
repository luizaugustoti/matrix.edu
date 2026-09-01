# Front-end (React + TypeScript)

Este diretorio contem a aplicacao web usada pelos usuarios do sistema.

## Objetivo desta pasta
Implementar interface, navegacao, validacao no cliente e consumo da API.

## O que deve ficar aqui
- Componentes visuais reutilizaveis
- Paginas
- Rotas
- Servicos HTTP
- Contextos globais
- Hooks customizados
- Tipos TypeScript e validacoes Zod
- Organizacao por modulos de negocio

## O que nao deve ficar aqui
- Regra de negocio critica que precisa de seguranca (deve ficar no back-end)
- Credenciais reais
- Codigo de banco de dados direto

## Estrutura e explicacao

### public/
Arquivos estaticos (favicon, imagens publicas, manifestos).

### src/componentes/
Componentes visuais reutilizaveis em varias telas.

Exemplos:
- `Botao.tsx`
- `Tabela.tsx`
- `Modal.tsx`
- `CampoTexto.tsx`
- `Card.tsx`

Nao colocar regras especificas de um modulo aqui.

### src/paginas/
Telas acessadas por rota.

Exemplos:
- `Login.tsx`
- `Dashboard.tsx`
- `Cantina.tsx`
- `ReservaLaboratorio.tsx`

### src/rotas/
Define mapeamento URL -> pagina e protege rotas autenticadas.

### src/servicos/
Camada de comunicacao com API.

Exemplos:
- `usuarioService.ts`
- `cantinaService.ts`
- `laboratorioService.ts`

Paginas/componentes nao devem fazer HTTP direto quando ja existe servico.

### src/contextos/
Estado global (usuario logado, sessao, permissoes).

Exemplo:
- `AuthContext.tsx`

### src/hooks/
Hooks customizados.

Exemplos:
- `useAuth.ts`
- `useModal.ts`
- `useUsuario.ts`

### src/formularios/
Blocos reutilizaveis de formularios (campos compostos, adaptadores).

### src/tipos/
Tipos e interfaces TypeScript.

Exemplos:
- `Usuario.ts`
- `Curso.ts`
- `Professor.ts`
- `Reserva.ts`

### src/validacoes/
Schemas de validacao com Zod.

Exemplos:
- `usuarioSchema.ts`
- `reservaSchema.ts`
- `cursoSchema.ts`

### src/utilitarios/
Funcoes auxiliares puras e compartilhadas.

Exemplos:
- `formatarData.ts`
- `formatarCpf.ts`
- `formatarTelefone.ts`

### src/estilos/
Estilos globais e tokens visuais.

Com CSS Modules, estilo especifico de componente deve ficar perto do componente.

### src/modulos/
Organizacao por dominio funcional:
- cantina
- laboratorios
- busca-ativa
- match-professor-curso
- conflito-matricula
- estacionamento

Cada modulo tem seu proprio README e subpastas para crescer com independencia.

## Quem normalmente trabalha aqui
- Estudantes focados em interface e experiencia do usuario.
- Integrantes que implementam fluxo de telas e validacoes de formulario.

## Como conecta com o resto do sistema
Front-end chama o back-end por `src/servicos/`. O back-end aplica regras e conversa com Supabase/PostgreSQL.
