export type Turma = {
  id: string;
  unidade_id: string;
  curso_id: string;
  professor_id: string | null;
  nome: string;
  periodo: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  sala: string | null;
  capacidade: number | null;
  situacao: string;
};

export type TurmaCriacao = {
  unidade_id: string;
  curso_id: string;
  nome: string;
  periodo?: string;
  data_inicio?: string;
  data_fim?: string;
  sala?: string;
  capacidade?: number;
};
