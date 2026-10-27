import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { mensagemDeErroGuarita } from '../servicos/chaves';
import { solicitarAutorizacao } from '../servicos/estacionamento';
import type { AutorizacaoEstacionamento, TipoDocumento, TipoVeiculo, Vinculo } from '../tipos/estacionamento';
import { formatarPlaca, formatarTamanho, normalizarPlaca, rotuloDocumento, vinculos } from '../utilitarios/estacionamento';
import { resolverZod } from '../validacoes/chaves';
import { solicitacaoSchema } from '../validacoes/estacionamento';
import { Dialogo } from './Dialogo';
import { Icone } from './Icone';
import estilosBotao from './chaves.module.css';
import estilos from './dialogo.module.css';
import estilosSolicitacao from './solicitacao.module.css';

// Campos do formulario como o navegador entrega (antes da validacao).
type Campos = {
  nome_completo: string;
  vinculo: Vinculo | '';
  telefone: string;
  placa: string;
  tipo: TipoVeiculo;
  modelo: string;
  cor: string;
  cnh: FileList | undefined;
  crlv: FileList | undefined;
  termo: FileList | undefined;
  termo_confirmado: boolean;
};

const anexos: TipoDocumento[] = ['cnh', 'crlv', 'termo'];

const dicaAnexo: Record<TipoDocumento, string> = {
  cnh: 'Frente e verso, legível e dentro da validade.',
  crlv: 'Do mesmo veículo informado acima.',
  termo: 'Termo de uso do estacionamento assinado à mão (foto ou PDF).',
};

type Props = {
  // Quando informada, o formulario vira uma renovacao (ou reenvio) dessa autorizacao.
  base?: AutorizacaoEstacionamento;
  renovacao?: boolean;
  aoFechar: () => void;
  aoConcluir: (autorizacao: AutorizacaoEstacionamento) => void;
};

export function DialogoSolicitacao({ base, renovacao = false, aoFechar, aoConcluir }: Props) {
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Campos>({
    resolver: resolverZod(solicitacaoSchema as unknown as z.ZodType<Campos>),
    defaultValues: {
      nome_completo: base?.solicitante.nome_completo ?? '',
      vinculo: base?.solicitante.vinculo ?? '',
      telefone: base?.solicitante.telefone ?? '',
      placa: base ? formatarPlaca(base.veiculo.placa) : '',
      tipo: base?.veiculo.tipo ?? 'carro',
      modelo: base?.veiculo.modelo ?? '',
      cor: base?.veiculo.cor ?? '',
      termo_confirmado: false,
    },
  });

  async function enviar(campos: Campos) {
    setErroGeral(null);
    try {
      const criada = await solicitarAutorizacao({
        nome_completo: campos.nome_completo,
        vinculo: campos.vinculo as Vinculo,
        telefone: campos.telefone,
        placa: normalizarPlaca(campos.placa),
        tipo: campos.tipo,
        modelo: campos.modelo,
        cor: campos.cor,
        documentos: {
          cnh: (campos.cnh as FileList)[0],
          crlv: (campos.crlv as FileList)[0],
          termo: (campos.termo as FileList)[0],
        },
        renovacao_de: renovacao ? base?.id : undefined,
      });
      aoConcluir(criada);
    } catch (error: unknown) {
      setErroGeral(mensagemDeErroGuarita(error));
    }
  }

  function erro(campo: keyof Campos) {
    const mensagem = errors[campo]?.message;
    if (!mensagem) return null;
    return (
      <span id={`solicitacao-${campo}-erro`} className={estilos.erroCampo} role="alert">
        <Icone nome="alerta" tamanho={14} />
        {String(mensagem)}
      </span>
    );
  }

  function acessibilidade(campo: keyof Campos) {
    return {
      'aria-invalid': errors[campo] ? ('true' as const) : ('false' as const),
      'aria-describedby': errors[campo] ? `solicitacao-${campo}-erro` : undefined,
    };
  }

  const titulo = renovacao ? 'Renovação da autorização' : base ? 'Reenviar solicitação' : 'Nova solicitação';
  const subtitulo = renovacao
    ? 'Envie os documentos atualizados. A nova validade começa quando a atual terminar.'
    : 'Autorização de uso do estacionamento, válida por 6 meses após a aprovação.';

  return (
    <Dialogo titulo={titulo} subtitulo={subtitulo} aoFechar={aoFechar} largura="larga">
      <form className={estilos.formulario} onSubmit={handleSubmit(enviar)} noValidate>
        <fieldset className={estilosSolicitacao.grupo}>
          <legend>Condutor</legend>
          <label className={estilos.campo}>
            Nome completo
            <input {...register('nome_completo')} autoComplete="off" {...acessibilidade('nome_completo')} autoFocus />
            {erro('nome_completo')}
          </label>
          <div className={estilosSolicitacao.duasColunas}>
            <label className={estilos.campo}>
              Vínculo com a escola
              <select {...register('vinculo')} {...acessibilidade('vinculo')}>
                <option value="">Selecione</option>
                {vinculos.map((vinculo) => (
                  <option key={vinculo} value={vinculo}>
                    {vinculo}
                  </option>
                ))}
              </select>
              {erro('vinculo')}
            </label>
            <label className={estilos.campo}>
              Telefone (opcional)
              <input {...register('telefone')} inputMode="tel" placeholder="(61) 99999-0000" {...acessibilidade('telefone')} />
              {erro('telefone')}
            </label>
          </div>
        </fieldset>

        <fieldset className={estilosSolicitacao.grupo}>
          <legend>Veículo</legend>
          <div className={estilosSolicitacao.duasColunas}>
            <label className={estilos.campo}>
              Placa
              <input
                {...register('placa', { setValueAs: (valor: string) => valor.toUpperCase() })}
                placeholder="ABC1D23"
                maxLength={8}
                autoCapitalize="characters"
                readOnly={renovacao}
                className={estilosSolicitacao.placa}
                {...acessibilidade('placa')}
              />
              {renovacao && <span className={estilos.dica}>Na renovação a placa não muda.</span>}
              {erro('placa')}
            </label>
            <div className={estilos.campo} role="radiogroup" aria-label="Tipo do veículo">
              Tipo
              <div className={estilosSolicitacao.opcoes}>
                <label className={estilosSolicitacao.opcao}>
                  <input type="radio" value="carro" {...register('tipo')} /> Carro
                </label>
                <label className={estilosSolicitacao.opcao}>
                  <input type="radio" value="moto" {...register('tipo')} /> Moto
                </label>
              </div>
              {erro('tipo')}
            </div>
          </div>
          <div className={estilosSolicitacao.duasColunas}>
            <label className={estilos.campo}>
              Modelo
              <input {...register('modelo')} placeholder="Ex.: Fiat Argo" {...acessibilidade('modelo')} />
              {erro('modelo')}
            </label>
            <label className={estilos.campo}>
              Cor
              <input {...register('cor')} placeholder="Ex.: Prata" {...acessibilidade('cor')} />
              {erro('cor')}
            </label>
          </div>
        </fieldset>

        <fieldset className={estilosSolicitacao.grupo}>
          <legend>Documentos (PDF, JPG ou PNG, até 5 MB cada)</legend>
          {anexos.map((tipo) => {
            const arquivo = watch(tipo)?.[0];
            return (
              <label key={tipo} className={`${estilos.campo} ${estilosSolicitacao.anexo}`} data-preenchido={Boolean(arquivo)}>
                <span className={estilosSolicitacao.anexoTitulo}>
                  <Icone nome={arquivo ? 'check' : 'anexo'} />
                  {rotuloDocumento[tipo]}
                </span>
                <span className={estilos.dica}>{dicaAnexo[tipo]}</span>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" {...register(tipo)} {...acessibilidade(tipo)} />
                {arquivo && (
                  <span className={estilos.dica}>
                    {arquivo.name} · {formatarTamanho(arquivo.size)}
                  </span>
                )}
                {erro(tipo)}
              </label>
            );
          })}
          <label className={estilosSolicitacao.confirmacao}>
            <input type="checkbox" {...register('termo_confirmado')} {...acessibilidade('termo_confirmado')} />
            Confirmo que o termo anexado está assinado pelo condutor.
          </label>
          {erro('termo_confirmado')}
        </fieldset>

        {erroGeral && (
          <p className={estilos.erroGeral} role="alert">
            {erroGeral}
          </p>
        )}

        <div className={estilos.rodape}>
          <span className={estilos.operador}>A coordenação analisa os documentos antes de liberar.</span>
          <div className={estilos.botoes}>
            <button type="button" className={estilosBotao.botaoSecundario} onClick={aoFechar}>
              Cancelar
            </button>
            <button type="submit" className={estilosBotao.botao} disabled={isSubmitting}>
              <Icone nome="documento" />
              {isSubmitting ? 'Enviando...' : 'Enviar solicitação'}
            </button>
          </div>
        </div>
      </form>
    </Dialogo>
  );
}
