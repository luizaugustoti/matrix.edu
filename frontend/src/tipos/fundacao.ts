export type Unidade = {
  id: string;
  nome: string;
  codigo: string;
  ativo: boolean;
};

export type Pessoa = {
  id: string;
  unidade_id: string;
  nome_completo: string;
  cpf: string | null;
  email: string | null;
  telefone: string | null;
  ativo: boolean;
};

export type UnidadeCriacao = {
  nome: string;
  codigo: string;
};
