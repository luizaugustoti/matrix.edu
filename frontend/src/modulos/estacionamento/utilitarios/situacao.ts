import type { Chave, SituacaoChave, TipoLocal } from '../tipos/chaves';

// Funcoes puras de apoio ao painel de chaves.

export function situacaoDaChave(chave: Chave, agora: number): SituacaoChave {
  if (chave.status === 'retirada' && chave.retirada_atual) {
    return new Date(chave.retirada_atual.devolucao_prevista).getTime() < agora ? 'atrasada' : 'retirada';
  }
  return chave.status;
}

export function minutosDeAtraso(chave: Chave, agora: number): number {
  if (!chave.retirada_atual) return 0;
  const diferenca = agora - new Date(chave.retirada_atual.devolucao_prevista).getTime();
  return Math.max(0, Math.floor(diferenca / 60000));
}

export const rotuloSituacao: Record<SituacaoChave, string> = {
  disponivel: 'Disponível',
  reservada: 'Reservada',
  retirada: 'Retirada',
  atrasada: 'Atrasada',
  perdida: 'Perdida',
  manutencao: 'Em manutenção',
  bloqueada: 'Bloqueada',
};

export const rotuloTipoLocal: Record<TipoLocal, string> = {
  sala: 'Sala de aula',
  laboratorio: 'Laboratório',
  espaco: 'Espaço',
};

export function formatarHora(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatarDuracao(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto ? `${horas} h ${resto} min` : `${horas} h`;
}
