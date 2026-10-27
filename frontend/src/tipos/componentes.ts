export type ComponenteCurricular = {
  id: string;
  curso_id: string;
  nome: string;
  codigo: string;
  carga_horaria: number | null;
  competencias: string[];
  ativo: boolean;
};

export type ComponenteCriacao = {
  curso_id: string;
  nome: string;
  codigo: string;
  carga_horaria?: number;
  competencias: string[];
};
