export type Horario = {
  id: string;
  turma_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
};

export type HorarioCriacao = {
  turma_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
};
