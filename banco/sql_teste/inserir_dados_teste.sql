-- Script: Inserir Dados de Teste no EFG Sistema
-- Executo este SQL no Supabase SQL Editor para popular o banco com dados de teste

-- 1. Inserir Unidade de Teste
INSERT INTO public.unidades (nome, codigo, ativa)
VALUES ('Campus Central', 'CAMPUS_001', true)
ON CONFLICT DO NOTHING;

-- 2. Obter ID da unidade para usar nos próximos inserts
WITH unidade_teste AS (
  SELECT id FROM public.unidades WHERE codigo = 'CAMPUS_001' LIMIT 1
)
-- 3. Atribuir unidade ao usuário teste
UPDATE public.usuarios
SET unidade_id = (SELECT id FROM unidade_teste)
WHERE email = 'teste@instituicao.edu.br'
AND unidade_id IS NULL;

-- 4. Inserir Cursos (deve executar em transação separada)
INSERT INTO public.cursos (unidade_id, nome, codigo, tipo, duracao_dias, carga_horaria, situacao)
SELECT id, 'Técnico em Informática', 'TI001', 'tecnico', 360, 1200, 'ativo'
FROM public.unidades WHERE codigo = 'CAMPUS_001'
ON CONFLICT DO NOTHING;

INSERT INTO public.cursos (unidade_id, nome, codigo, tipo, duracao_dias, carga_horaria, situacao)
SELECT id, 'Bacharel em Engenharia', 'ENG001', 'superior', 1440, 4000, 'ativo'
FROM public.unidades WHERE codigo = 'CAMPUS_001'
ON CONFLICT DO NOTHING;

-- 5. Inserir Componentes Curriculares
INSERT INTO public.componentes_curriculares (curso_id, nome, codigo, carga_horaria, competencias, ativo)
SELECT c.id, 'Programação em Python', 'PROG001', 60, ARRAY['programação', 'python', 'algoritmos'], true
FROM public.cursos c
WHERE c.codigo = 'TI001'
ON CONFLICT DO NOTHING;

INSERT INTO public.componentes_curriculares (curso_id, nome, codigo, carga_horaria, competencias, ativo)
SELECT c.id, 'Banco de Dados', 'BD001', 40, ARRAY['banco de dados', 'SQL', 'design'], true
FROM public.cursos c
WHERE c.codigo = 'TI001'
ON CONFLICT DO NOTHING;

-- 6. Inserir Turmas
INSERT INTO public.turmas (unidade_id, curso_id, nome, periodo, data_inicio, data_fim, sala, capacidade, situacao)
SELECT u.id, c.id, 'Turma 2026.1', '2026.1', '2026-01-15', '2026-12-20', 'Sala 101', 30, 'planejada'
FROM public.unidades u, public.cursos c
WHERE u.codigo = 'CAMPUS_001' AND c.codigo = 'TI001'
ON CONFLICT DO NOTHING;

-- 7. Inserir Horários (segunda, quarta, sexta 09:00-10:30)
INSERT INTO public.turma_horarios (turma_id, dia_semana, hora_inicio, hora_fim)
SELECT t.id, 1, '09:00'::time, '10:30'::time
FROM public.turmas t
WHERE t.nome = 'Turma 2026.1'
ON CONFLICT DO NOTHING;

INSERT INTO public.turma_horarios (turma_id, dia_semana, hora_inicio, hora_fim)
SELECT t.id, 3, '09:00'::time, '10:30'::time
FROM public.turmas t
WHERE t.nome = 'Turma 2026.1'
ON CONFLICT DO NOTHING;

INSERT INTO public.turma_horarios (turma_id, dia_semana, hora_inicio, hora_fim)
SELECT t.id, 5, '09:00'::time, '10:30'::time
FROM public.turmas t
WHERE t.nome = 'Turma 2026.1'
ON CONFLICT DO NOTHING;

-- Verificação: listar dados inseridos
SELECT 'Unidades' as tipo, COUNT(*) as total FROM public.unidades
UNION ALL
SELECT 'Cursos', COUNT(*) FROM public.cursos
UNION ALL
SELECT 'Componentes', COUNT(*) FROM public.componentes_curriculares
UNION ALL
SELECT 'Turmas', COUNT(*) FROM public.turmas
UNION ALL
SELECT 'Horários', COUNT(*) FROM public.turma_horarios;
