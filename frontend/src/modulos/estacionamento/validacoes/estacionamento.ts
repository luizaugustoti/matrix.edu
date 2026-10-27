import { z } from 'zod';
import { placaValida, vinculos } from '../utilitarios/estacionamento';

// Validacoes Zod do estacionamento. A regra final continua no back-end.

export const TAMANHO_MAXIMO_ANEXO = 5 * 1024 * 1024;
export const TIPOS_ANEXO = ['application/pdf', 'image/jpeg', 'image/png'];

function anexo(nome: string) {
  return z
    .custom<FileList>((valor) => valor instanceof FileList && valor.length > 0, {
      message: `Anexe ${nome}.`,
    })
    .refine((lista) => TIPOS_ANEXO.includes(lista[0]?.type), {
      message: 'Use um arquivo PDF, JPG ou PNG.',
    })
    .refine((lista) => (lista[0]?.size ?? 0) <= TAMANHO_MAXIMO_ANEXO, {
      message: 'O arquivo precisa ter no máximo 5 MB.',
    });
}

export const solicitacaoSchema = z.object({
  nome_completo: z.string().trim().min(3, 'Informe o nome completo do condutor.'),
  vinculo: z.enum(vinculos as [string, ...string[]], {
    errorMap: () => ({ message: 'Escolha o vínculo com a escola.' }),
  }),
  telefone: z
    .string()
    .trim()
    .refine((valor) => !valor || /^[\d\s()+-]{10,16}$/.test(valor), 'Telefone inválido. Ex.: (61) 99999-0000')
    .optional(),
  placa: z.string().refine(placaValida, 'Placa inválida. Use o formato ABC1234 ou ABC1D23.'),
  tipo: z.enum(['carro', 'moto'], { errorMap: () => ({ message: 'Escolha o tipo do veículo.' }) }),
  modelo: z.string().trim().min(2, 'Informe o modelo do veículo.'),
  cor: z.string().trim().min(3, 'Informe a cor do veículo.'),
  cnh: anexo('a CNH do condutor'),
  crlv: anexo('o documento do veículo (CRLV)'),
  termo: anexo('o termo de uso assinado'),
  termo_confirmado: z.literal(true, {
    errorMap: () => ({ message: 'Confirme que o termo anexado está assinado.' }),
  }),
});

export type SolicitacaoFormulario = z.infer<typeof solicitacaoSchema>;

export const motivoSchema = z
  .string()
  .trim()
  .min(5, 'Explique o motivo em pelo menos 5 caracteres.')
  .max(300, 'Use no máximo 300 caracteres.');
