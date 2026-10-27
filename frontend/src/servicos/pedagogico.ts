import { api } from './api';
import type { Curso, CursoCriacao } from '../tipos/pedagogico';
import type { ComponenteCriacao, ComponenteCurricular } from '../tipos/componentes';
import type { Turma, TurmaCriacao } from '../tipos/turmas';
import type { Horario, HorarioCriacao } from '../tipos/horarios';

export async function listarCursos(unidadeId: string): Promise<Curso[]> {
  const response = await api.get<Curso[]>(`/pedagogico/unidades/${unidadeId}/cursos`);
  return response.data;
}

export async function criarCurso(dados: CursoCriacao): Promise<Curso> {
  const response = await api.post<Curso>('/pedagogico/cursos', dados);
  return response.data;
}

export async function listarComponentes(cursoId: string): Promise<ComponenteCurricular[]> {
  const response = await api.get<ComponenteCurricular[]>(`/pedagogico/cursos/${cursoId}/componentes`);
  return response.data;
}

export async function criarComponente(dados: ComponenteCriacao): Promise<ComponenteCurricular> {
  const response = await api.post<ComponenteCurricular>('/pedagogico/componentes', dados);
  return response.data;
}

export async function listarTurmas(unidadeId: string): Promise<Turma[]> {
  const response = await api.get<Turma[]>(`/pedagogico/unidades/${unidadeId}/turmas`);
  return response.data;
}

export async function criarTurma(dados: TurmaCriacao): Promise<Turma> {
  const response = await api.post<Turma>('/pedagogico/turmas', dados);
  return response.data;
}

export async function listarHorarios(turmaId: string): Promise<Horario[]> {
  const response = await api.get<Horario[]>(`/pedagogico/turmas/${turmaId}/horarios`);
  return response.data;
}

export async function criarHorario(dados: HorarioCriacao): Promise<Horario> {
  const response = await api.post<Horario>('/pedagogico/horarios', dados);
  return response.data;
}
