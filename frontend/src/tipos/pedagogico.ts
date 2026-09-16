export type Curso = {
  id: string;
  unidade_id: string;
  nome: string;
  codigo: string;
  tipo: string;
  duracao_dias: number | null;
  carga_horaria: number | null;
  situacao: string;
};

export type CursoCriacao = {
  unidade_id: string;
  nome: string;
  codigo: string;
  tipo: string;
  duracao_dias?: number;
  carga_horaria?: number;
};
