import { api } from '../../../servicos/api';
import * as simulado from '../dados-simulados/estacionamento';
import type {
  AutorizacaoEstacionamento,
  ConsultaPlaca,
  MovimentacaoVeiculo,
  SolicitacaoAutorizacao,
} from '../tipos/estacionamento';
import { normalizarPlaca } from '../utilitarios/estacionamento';
import { usandoDadosSimulados } from './chaves';

// Servico do estacionamento (portaria e autorizacoes).
// Usa a mesma chave VITE_GUARITA_DADOS_SIMULADOS do controle de chaves:
// com "false" no frontend/.env, todas as telas da guarita passam a usar a API.
// Para mensagens de erro, use mensagemDeErroGuarita de ./chaves.

const BASE = '/guarita/estacionamento';

// ---------- Portaria ----------

export async function consultarPlaca(placa: string): Promise<ConsultaPlaca> {
  if (usandoDadosSimulados) return simulado.consultarPlaca(placa);
  const response = await api.get<ConsultaPlaca>(`${BASE}/placas/${normalizarPlaca(placa)}`);
  return response.data;
}

export async function registrarEntrada(placa: string): Promise<MovimentacaoVeiculo> {
  if (usandoDadosSimulados) return simulado.registrarEntrada(placa);
  const response = await api.post<MovimentacaoVeiculo>(`${BASE}/entradas`, { placa: normalizarPlaca(placa) });
  return response.data;
}

export async function registrarSaida(placa: string): Promise<MovimentacaoVeiculo> {
  if (usandoDadosSimulados) return simulado.registrarSaida(placa);
  const response = await api.post<MovimentacaoVeiculo>(`${BASE}/saidas`, { placa: normalizarPlaca(placa) });
  return response.data;
}

export async function listarNoPatio(): Promise<MovimentacaoVeiculo[]> {
  if (usandoDadosSimulados) return simulado.listarNoPatio();
  const response = await api.get<MovimentacaoVeiculo[]>(`${BASE}/patio`);
  return response.data;
}

export async function listarMovimentacoesVeiculos(placa?: string): Promise<MovimentacaoVeiculo[]> {
  if (usandoDadosSimulados) return simulado.listarMovimentacoesVeiculos(placa);
  const response = await api.get<MovimentacaoVeiculo[]>(`${BASE}/movimentacoes`, {
    params: placa ? { placa: normalizarPlaca(placa) } : undefined,
  });
  return response.data;
}

// ---------- Autorizacoes ----------

export async function listarAutorizacoes(): Promise<AutorizacaoEstacionamento[]> {
  if (usandoDadosSimulados) return simulado.listarAutorizacoes();
  const response = await api.get<AutorizacaoEstacionamento[]>(`${BASE}/autorizacoes`);
  if (!Array.isArray(response.data)) {
    throw new Error('A API retornou um formato invalido para autorizacoes.');
  }
  return response.data;
}

// Envia os dados e os tres anexos em multipart/form-data.
export async function solicitarAutorizacao(dados: SolicitacaoAutorizacao): Promise<AutorizacaoEstacionamento> {
  if (usandoDadosSimulados) return simulado.solicitarAutorizacao(dados);

  const formulario = new FormData();
  formulario.append('nome_completo', dados.nome_completo);
  formulario.append('vinculo', dados.vinculo);
  if (dados.telefone) formulario.append('telefone', dados.telefone);
  formulario.append('placa', normalizarPlaca(dados.placa));
  formulario.append('modelo', dados.modelo);
  formulario.append('cor', dados.cor);
  formulario.append('tipo', dados.tipo);
  if (dados.renovacao_de) formulario.append('renovacao_de', dados.renovacao_de);
  formulario.append('cnh', dados.documentos.cnh);
  formulario.append('crlv', dados.documentos.crlv);
  formulario.append('termo', dados.documentos.termo);

  const response = await api.post<AutorizacaoEstacionamento>(`${BASE}/autorizacoes`, formulario);
  return response.data;
}

export async function iniciarAnalise(id: string): Promise<AutorizacaoEstacionamento> {
  if (usandoDadosSimulados) return simulado.iniciarAnalise(id);
  const response = await api.post<AutorizacaoEstacionamento>(`${BASE}/autorizacoes/${id}/analise`);
  return response.data;
}

export async function aprovarAutorizacao(id: string): Promise<AutorizacaoEstacionamento> {
  if (usandoDadosSimulados) return simulado.aprovarAutorizacao(id);
  const response = await api.post<AutorizacaoEstacionamento>(`${BASE}/autorizacoes/${id}/aprovacao`);
  return response.data;
}

export async function rejeitarAutorizacao(id: string, motivo: string): Promise<AutorizacaoEstacionamento> {
  if (usandoDadosSimulados) return simulado.rejeitarAutorizacao(id, motivo);
  const response = await api.post<AutorizacaoEstacionamento>(`${BASE}/autorizacoes/${id}/rejeicao`, { motivo });
  return response.data;
}

export async function cancelarAutorizacao(id: string, motivo: string): Promise<AutorizacaoEstacionamento> {
  if (usandoDadosSimulados) return simulado.cancelarAutorizacao(id, motivo);
  const response = await api.post<AutorizacaoEstacionamento>(`${BASE}/autorizacoes/${id}/cancelamento`, { motivo });
  return response.data;
}
