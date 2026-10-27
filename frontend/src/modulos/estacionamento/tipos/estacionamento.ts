// Tipos do estacionamento (portaria e autorizacoes).
// Campos em snake_case, no mesmo formato esperado da API.
// O estacionamento e livre (sem vagas numeradas): a guarita controla
// quem pode entrar, quem esta no patio e o historico de entradas e saidas.

// Situacao gravada no banco. "expirada" tambem pode ser calculada no front
// quando uma autorizacao aprovada passa da data de validade.
export type SituacaoAutorizacao =
  | 'pendente'
  | 'em_analise'
  | 'aprovada'
  | 'rejeitada'
  | 'expirada'
  | 'cancelada';

export type TipoDocumento = 'cnh' | 'crlv' | 'termo';

export type TipoVeiculo = 'carro' | 'moto';

export type Vinculo =
  | 'Professor(a)'
  | 'Funcionário(a)'
  | 'Coordenação'
  | 'Aluno(a)'
  | 'Prestador(a) de serviço';

export type DocumentoAutorizacao = {
  id: string;
  tipo: TipoDocumento;
  nome_arquivo: string;
  tamanho_bytes: number;
  url: string | null;
  enviado_em: string;
};

export type Veiculo = {
  placa: string;
  modelo: string;
  cor: string;
  tipo: TipoVeiculo;
};

export type Solicitante = {
  id: string;
  nome_completo: string;
  vinculo: Vinculo;
  telefone: string | null;
};

export type AutorizacaoEstacionamento = {
  id: string;
  solicitante: Solicitante;
  veiculo: Veiculo;
  situacao: SituacaoAutorizacao;
  solicitada_em: string;
  analisada_em: string | null;
  analisada_por: string | null;
  valida_de: string | null;
  valida_ate: string | null;
  motivo: string | null;
  documentos: DocumentoAutorizacao[];
  renovacao_de: string | null;
};

export type MovimentacaoVeiculo = {
  id: string;
  autorizacao_id: string;
  veiculo: Veiculo;
  condutor: Solicitante;
  entrada_em: string;
  saida_em: string | null;
  entrada_registrada_por: string;
  saida_registrada_por: string | null;
};

// Resposta da consulta de placa feita pela guarita.
export type ConsultaPlaca = {
  placa: string;
  autorizacao: AutorizacaoEstacionamento | null;
  no_patio: MovimentacaoVeiculo | null;
  pode_entrar: boolean;
  motivo_bloqueio: string | null;
};

export type SolicitacaoAutorizacao = {
  nome_completo: string;
  vinculo: Vinculo;
  telefone?: string;
  placa: string;
  modelo: string;
  cor: string;
  tipo: TipoVeiculo;
  documentos: Record<TipoDocumento, File>;
  renovacao_de?: string;
};
