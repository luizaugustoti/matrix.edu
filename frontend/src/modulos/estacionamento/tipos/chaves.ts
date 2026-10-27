// Tipos do controle de chaves da guarita.
// Os campos seguem o padrao snake_case da API (mesmo formato do back-end),
// para que trocar os dados simulados pela API real nao exija conversao.

export type TipoLocal = 'sala' | 'laboratorio' | 'espaco';

// Status gravado no banco.
export type StatusChave =
  | 'disponivel'
  | 'reservada'
  | 'retirada'
  | 'perdida'
  | 'manutencao'
  | 'bloqueada';

// Situacao exibida na tela: igual ao status, mas uma chave "retirada"
// vira "atrasada" quando passa da hora prevista de devolucao.
export type SituacaoChave = StatusChave | 'atrasada';

export type LocalChave = {
  id: string;
  nome: string;
  tipo: TipoLocal;
};

export type PessoaAutorizada = {
  id: string;
  nome_completo: string;
  papel: string;
};

export type RetiradaAtual = {
  movimentacao_id: string;
  pessoa: PessoaAutorizada;
  retirada_em: string;
  devolucao_prevista: string;
};

export type Chave = {
  id: string;
  codigo: string;
  local: LocalChave;
  status: StatusChave;
  observacao: string | null;
  retirada_atual: RetiradaAtual | null;
};

export type Movimentacao = {
  id: string;
  chave_id: string;
  chave_codigo: string;
  local_nome: string;
  pessoa: PessoaAutorizada;
  retirada_em: string;
  devolucao_prevista: string;
  devolvida_em: string | null;
  retirada_registrada_por: string;
  devolucao_registrada_por: string | null;
  observacao_retirada: string | null;
  observacao_devolucao: string | null;
};

export type RetiradaCriacao = {
  chave_id: string;
  pessoa_id: string;
  devolucao_prevista: string;
  observacao?: string;
};

export type DevolucaoCriacao = {
  chave_id: string;
  observacao?: string;
};
