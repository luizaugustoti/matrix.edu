import type {
  AutorizacaoEstacionamento,
  SituacaoAutorizacao,
  TipoDocumento,
  Vinculo,
} from '../tipos/estacionamento';

// Funcoes puras de apoio ao estacionamento.

const DIA_MS = 24 * 60 * 60 * 1000;

// Autorizacoes que vencem dentro deste prazo aparecem como "vencendo".
export const DIAS_AVISO_VENCIMENTO = 30;

// Validade de uma autorizacao aprovada (renovacao obrigatoria a cada 6 meses).
export const MESES_VALIDADE = 6;

export const vinculos: Vinculo[] = [
  'Professor(a)',
  'Funcionário(a)',
  'Coordenação',
  'Aluno(a)',
  'Prestador(a) de serviço',
];

// Remove espaco e hifen e deixa em maiusculas: "abc-1234" -> "ABC1234".
export function normalizarPlaca(valor: string): string {
  return valor.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// Aceita o padrao antigo (ABC1234) e o Mercosul (ABC1D23).
export function placaValida(valor: string): boolean {
  return /^[A-Z]{3}\d[A-Z0-9]\d{2}$/.test(normalizarPlaca(valor));
}

// Padrao antigo ganha hifen (ABC-1234); Mercosul fica sem (ABC1D23).
export function formatarPlaca(valor: string): string {
  const placa = normalizarPlaca(valor);
  return /^[A-Z]{3}\d{4}$/.test(placa) ? `${placa.slice(0, 3)}-${placa.slice(3)}` : placa;
}

export function adicionarMeses(data: Date, meses: number): Date {
  const resultado = new Date(data);
  resultado.setMonth(resultado.getMonth() + meses);
  return resultado;
}

export function situacaoEfetiva(autorizacao: AutorizacaoEstacionamento, agora: number): SituacaoAutorizacao {
  if (
    autorizacao.situacao === 'aprovada' &&
    autorizacao.valida_ate &&
    new Date(autorizacao.valida_ate).getTime() < agora
  ) {
    return 'expirada';
  }
  return autorizacao.situacao;
}

// Dias inteiros ate o vencimento (negativo se ja venceu).
export function diasParaVencer(autorizacao: AutorizacaoEstacionamento, agora: number): number | null {
  if (!autorizacao.valida_ate) return null;
  return Math.ceil((new Date(autorizacao.valida_ate).getTime() - agora) / DIA_MS);
}

export function estaVencendo(autorizacao: AutorizacaoEstacionamento, agora: number): boolean {
  if (situacaoEfetiva(autorizacao, agora) !== 'aprovada') return false;
  const dias = diasParaVencer(autorizacao, agora);
  return dias !== null && dias <= DIAS_AVISO_VENCIMENTO;
}

export const rotuloSituacaoAutorizacao: Record<SituacaoAutorizacao, string> = {
  pendente: 'Pendente',
  em_analise: 'Em análise',
  aprovada: 'Aprovada',
  rejeitada: 'Rejeitada',
  expirada: 'Expirada',
  cancelada: 'Cancelada',
};

export const rotuloDocumento: Record<TipoDocumento, string> = {
  cnh: 'CNH do condutor',
  crlv: 'Documento do veículo (CRLV)',
  termo: 'Termo de uso assinado',
};

export function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

export function textoVencimento(dias: number): string {
  if (dias < 0) return `venceu há ${Math.abs(dias)} ${Math.abs(dias) === 1 ? 'dia' : 'dias'}`;
  if (dias === 0) return 'vence hoje';
  return `vence em ${dias} ${dias === 1 ? 'dia' : 'dias'}`;
}
