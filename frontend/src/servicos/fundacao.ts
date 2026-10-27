import { api } from './api';
import type { Pessoa, Unidade, UnidadeCriacao } from '../tipos/fundacao';

export async function listarUnidades(): Promise<Unidade[]> {
  const response = await api.get<Unidade[]>('/fundacao/unidades');

  if (!Array.isArray(response.data)) {
    throw new Error('A API retornou um formato invalido para unidades.');
  }

  return response.data;
}

export async function criarUnidade(dados: UnidadeCriacao): Promise<Unidade> {
  const response = await api.post<Unidade>('/fundacao/unidades', dados);
  return response.data;
}

export async function listarPessoas(unidadeId: string): Promise<Pessoa[]> {
  const response = await api.get<Pessoa[]>(`/fundacao/unidades/${unidadeId}/pessoas`);
  return response.data;
}