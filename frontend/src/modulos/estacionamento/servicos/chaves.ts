import axios from 'axios';
import { api } from '../../../servicos/api';
import * as simulado from '../dados-simulados/chaves';
import type {
  Chave,
  DevolucaoCriacao,
  Movimentacao,
  PessoaAutorizada,
  RetiradaCriacao,
} from '../tipos/chaves';

// Servico do controle de chaves.
// Enquanto o back-end nao tiver as rotas da guarita, o front usa dados
// simulados. Para usar a API real, defina no frontend/.env:
//   VITE_GUARITA_DADOS_SIMULADOS=false
// As paginas nao mudam: elas so conhecem as funcoes deste arquivo.

export const usandoDadosSimulados = import.meta.env.VITE_GUARITA_DADOS_SIMULADOS !== 'false';

export async function listarChaves(): Promise<Chave[]> {
  if (usandoDadosSimulados) return simulado.listarChaves();

  const response = await api.get<Chave[]>('/guarita/chaves');
  if (!Array.isArray(response.data)) {
    throw new Error('A API retornou um formato invalido para chaves.');
  }
  return response.data;
}

export async function listarAutorizados(chaveId: string): Promise<PessoaAutorizada[]> {
  if (usandoDadosSimulados) return simulado.listarAutorizados(chaveId);

  const response = await api.get<PessoaAutorizada[]>(`/guarita/chaves/${chaveId}/autorizados`);
  return response.data;
}

export async function registrarRetirada(dados: RetiradaCriacao): Promise<Chave> {
  if (usandoDadosSimulados) return simulado.registrarRetirada(dados);

  const response = await api.post<Chave>('/guarita/chaves/retiradas', dados);
  return response.data;
}

export async function registrarDevolucao(dados: DevolucaoCriacao): Promise<Chave> {
  if (usandoDadosSimulados) return simulado.registrarDevolucao(dados);

  const response = await api.post<Chave>('/guarita/chaves/devolucoes', dados);
  return response.data;
}

export async function listarMovimentacoes(chaveId?: string): Promise<Movimentacao[]> {
  if (usandoDadosSimulados) return simulado.listarMovimentacoes(chaveId);

  const response = await api.get<Movimentacao[]>('/guarita/chaves/movimentacoes', {
    params: chaveId ? { chave_id: chaveId } : undefined,
  });
  return response.data;
}

// Converte qualquer erro em uma mensagem que a guarita entende.
export function mensagemDeErroGuarita(error: unknown): string {
  if (error instanceof simulado.ErroGuarita) return error.message;

  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) return 'Sua sessão expirou. Entre novamente no sistema.';
    if (error.response?.status === 403) return 'Seu perfil não tem permissão para esta operação.';
    const detalhe = (error.response?.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detalhe === 'string') return detalhe;
  }

  return 'Não foi possível concluir a operação. Tente novamente.';
}
