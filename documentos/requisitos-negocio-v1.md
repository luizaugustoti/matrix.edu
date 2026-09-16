# Requisitos de Negocio - Sistema EFG

## Fonte e status

Este documento consolida a especificacao de requisitos v1.0, de 21 de agosto de 2026,
e a proposta de estruturacao das regras de negocio recebida pela equipe. Ele serve como
ponte entre a necessidade institucional, o backlog e a implementacao.

As prioridades ainda precisam ser validadas com a equipe e a coordenacao usando MoSCoW:
Must have, Should have, Could have e Won't have.

## Principios transversais

- O piloto inicia na unidade de Valparaiso de Goias, mas todas as entidades devem permitir futura expansao para outras unidades.
- Pessoas sao cadastradas uma unica vez e podem assumir papeis de aluno, professor, funcionario ou responsavel.
- Pessoa, usuario do sistema, perfil e permissao sao conceitos diferentes.
- Registros com historico nao devem ser apagados; devem possuir situacao ativa/inativa ou equivalente.
- Toda alteracao critica deve registrar autor, data, valor anterior e valor novo.
- Regras de negocio e seguranca devem ser aplicadas no backend e reforcadas por RLS.
- Cada perfil deve acessar somente os dados necessarios para sua funcao.
- Interfaces devem atender acessibilidade, responsividade, performance e navegacao por teclado.

## Fases e dependencias

### Fase 1 - Fundacao

Unidades, pessoas, alunos, professores, funcionarios, responsaveis, usuarios, perfis,
permissoes, cursos, componentes curriculares, competencias, salas e espacos.

### Fase 2 - Pedagogico

Turmas, horarios, matriculas, frequencia, conflitos de matricula e Busca Ativa.

### Fase 3 - Operacional

Laboratorios, portaria, visitantes, autorizacoes, chaves, estacionamento e ocorrencias.

### Fase 4 - Administrativo

Ativos, localizacoes, responsaveis, movimentacoes, manutencao, baixa, Cantina, estoque e compras.

### Fase 5 - Inteligencia

Match Professor x Curso, dashboards, alertas e indicadores.

## Requisitos funcionais rastreaveis

### Cantina

- `RF-CANT-01`: calcular a producao diaria com base na presenca real dos alunos e configuracoes do curso.
- `RF-CANT-02`: permitir que o professor registre a presenca da turma e receber lembrete quando faltar o envio.
- `RF-CANT-03`: cadastrar, editar, consultar e inativar receitas.
- `RF-CANT-04`: controlar entradas, saidas, perdas, ajustes, inventario, lote, validade, unidade e estoque minimo.
- `RF-CANT-05`: gerar lista de compras com base no estoque e no consumo previsto, permitindo marcar itens comprados.

Regra essencial: toda alteracao de estoque deve gerar uma movimentacao identificavel.

### Laboratorios

- `RF-LAB-01`: cadastrar laboratorios, capacidade, equipamentos, softwares, recursos, localizacao e situacao.
- `RF-LAB-02`: permitir solicitacao de reserva com professor, turma, horario, justificativa e objetivo da aula.
- `RF-LAB-03`: exibir cronograma semanal e mensal para a coordenacao.
- `RF-LAB-04`: permitir priorizacao da coordenacao em conflito de horario, registrando a decisao.
- `RF-LAB-05`: orientar o uso do ambiente mais adequado aos recursos necessarios, evitando reserva desnecessaria.

### Busca Ativa

- `RF-BUSC-01`: disponibilizar os dados basicos de alunos matriculados para localizacao e contato.
- `RF-BUSC-02`: identificar alunos com frequencia nula ou muito baixa, presencial ou online.
- `RF-BUSC-03`: registrar tentativas de contato, canal, resultado, motivo e proxima acao.
- `RF-BUSC-04`: gerar documento de saida da lista de chamada quando o processo institucional for concluido.
- `RF-BUSC-05`: permitir assinatura digital somente apos validacao juridica e de LGPD.

Estados sugeridos: novo, em contato, aguardando retorno, aluno localizado, em acompanhamento,
regularizado, nao localizado, evasao confirmada e encerrado.

### Match Professor x Curso

- `RF-MATCH-01`: cadastrar cursos, componentes e competencias exigidas.
- `RF-MATCH-02`: cadastrar professores e suas competencias, experiencia e evidencias permitidas.
- `RF-MATCH-03`: calcular compatibilidade entre exigencias e competencias.
- `RF-MATCH-04`: exibir recomendacoes explicaveis, incluindo competencias atendidas, ausentes e experiencia.

O resultado deve apoiar a decisao da coordenacao; nao deve substituir automaticamente uma decisao humana.

### Conflito de Matricula

- `RF-CONF-01`: detectar sobreposicao de horario entre matriculas do mesmo aluno.
- `RF-CONF-02`: alertar o aluno e/ou a coordenacao sobre o conflito.
- `RF-CONF-03`: apresentar as opcoes e registrar a decisao responsavel, sem cancelar matricula automaticamente.

### Estacionamento e chaves

- `RF-EST-01`: digitalizar o envio e controle dos documentos do estacionamento.
- `RF-EST-02`: controlar assinatura fisica ou digital e renovacao semestral, condicionado a validacao juridica.
- `RF-EST-03`: registrar retirada e devolucao de chaves em tempo real.
- `RF-EST-04`: permitir retirada apenas por pessoa autorizada para a sala ou chave.
- `RF-EST-05`: preservar historico de movimentacoes por longo periodo para auditoria.
- `RF-EST-06`: oferecer painel visual e acessivel para a guarita.

Estados de chave sugeridos: disponivel, reservada, retirada, atrasada, perdida, em manutencao e bloqueada.

## Modelo conceitual compartilhado

- `Unidade` possui pessoas, cursos, turmas, salas, laboratorios, ativos e operacoes.
- `Pessoa` pode ter papeis de aluno, professor, funcionario ou responsavel.
- `Pessoa` pode possuir ou nao um `Usuario` do sistema.
- `Usuario` recebe um ou mais `Perfis`.
- `Perfil` possui `Permissoes` por acao e recurso.
- `Curso` possui componentes, competencias e turmas.
- `Turma` possui alunos matriculados, professor, sala, horario e situacao.
- `Matricula` conecta aluno e turma e participa da deteccao de conflitos.
- `Frequencia` alimenta a Busca Ativa e a previsao da Cantina.
- `Historico` e `Auditoria` preservam alteracoes e decisoes importantes.

## Pontos que precisam de decisao institucional

1. Prioridade MoSCoW de cada requisito.
2. Perfis reais e permissoes por acao: coordenacao, professor, guarita, cantina, patrimonio, administracao e aluno.
3. Base legal, finalidade, retencao e descarte de dados conforme LGPD.
4. Quem pode visualizar contatos, frequencia, documentos, competencias e historico.
5. Regra exata para considerar frequencia baixa e iniciar Busca Ativa.
6. Regras para cursos de capacitacao de 10 dias e qualificacao de 1,5 anos sem valores fixos no codigo.
7. Validade, aprovacao e renovacao de autorizacoes de estacionamento.
8. Validade juridica de assinatura gov.br e assinatura digital nos documentos.
9. Nome definitivo do sistema e do mascote.
10. Relatorios obrigatorios para a primeira homologacao.

## Criterios de aceite transversal

- O fluxo possui validacao no frontend e no backend.
- O backend impede acesso sem autenticacao e sem permissao adequada.
- O banco aplica RLS compatível com unidade e perfil.
- Alteracoes criticas geram auditoria e nao destroem historico.
- A interface possui estados de carregamento, vazio, erro e sucesso.
- O fluxo funciona em desktop, tablet e celular e pode ser operado por teclado.
- Ha testes para o caminho principal e para as excecoes relevantes.
- A documentacao do modulo esta atualizada antes da entrega.
