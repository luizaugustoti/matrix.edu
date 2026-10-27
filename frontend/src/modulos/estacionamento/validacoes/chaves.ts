import type { FieldErrors, FieldValues, Resolver } from 'react-hook-form';
import { z } from 'zod';

// Validacoes Zod dos formularios da guarita.
// A regra final continua no back-end; aqui a ideia e avisar cedo,
// antes de enviar.

export function horarioDeHoje(horario: string, referencia = new Date()): Date {
  const [horas, minutos] = horario.split(':').map(Number);
  const data = new Date(referencia);
  data.setHours(horas, minutos, 0, 0);
  return data;
}

export const retiradaSchema = z.object({
  pessoa_id: z.string().min(1, 'Escolha quem está retirando a chave.'),
  devolucao_prevista: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Informe o horário previsto de devolução.')
    .refine((valor) => horarioDeHoje(valor).getTime() > Date.now(), {
      message: 'A devolução prevista precisa ser depois do horário atual.',
    }),
  observacao: z.string().max(200, 'Use no máximo 200 caracteres.').optional(),
});

export type RetiradaFormulario = z.infer<typeof retiradaSchema>;

export const devolucaoSchema = z.object({
  observacao: z.string().max(200, 'Use no máximo 200 caracteres.').optional(),
});

export type DevolucaoFormulario = z.infer<typeof devolucaoSchema>;

// Adaptador Zod -> React Hook Form (substitui o pacote @hookform/resolvers,
// que nao esta nas dependencias do projeto).
export function resolverZod<T extends FieldValues>(schema: z.ZodType<T>): Resolver<T> {
  return async (valores) => {
    const resultado = schema.safeParse(valores);
    if (resultado.success) {
      return { values: resultado.data, errors: {} };
    }

    const errors: Record<string, { type: string; message: string }> = {};
    resultado.error.issues.forEach((issue) => {
      const campo = issue.path.join('.');
      if (!errors[campo]) errors[campo] = { type: issue.code, message: issue.message };
    });
    return { values: {}, errors: errors as FieldErrors<T> };
  };
}
