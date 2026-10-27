import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../contextos/AuthContext';
import { mensagemDeErroGuarita, registrarDevolucao } from '../servicos/chaves';
import type { Chave } from '../tipos/chaves';
import { formatarDuracao, formatarHora, minutosDeAtraso, situacaoDaChave } from '../utilitarios/situacao';
import { devolucaoSchema, resolverZod, type DevolucaoFormulario } from '../validacoes/chaves';
import { Dialogo } from './Dialogo';
import { Icone } from './Icone';
import estilosBotao from './chaves.module.css';
import estilos from './dialogo.module.css';

type Props = {
  chave: Chave;
  agora: number;
  aoFechar: () => void;
  aoConcluir: (chave: Chave, devolvidaPor: string) => void;
};

export function DialogoDevolucao({ chave, agora, aoFechar, aoConcluir }: Props) {
  const { usuario } = useAuth();
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const retirada = chave.retirada_atual;
  const atrasada = situacaoDaChave(chave, agora) === 'atrasada';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DevolucaoFormulario>({
    resolver: resolverZod(devolucaoSchema),
    defaultValues: { observacao: '' },
  });

  async function enviar(dados: DevolucaoFormulario) {
    setErroGeral(null);
    try {
      const atualizada = await registrarDevolucao({ chave_id: chave.id, observacao: dados.observacao });
      aoConcluir(atualizada, retirada?.pessoa.nome_completo ?? '');
    } catch (error: unknown) {
      setErroGeral(mensagemDeErroGuarita(error));
    }
  }

  return (
    <Dialogo titulo={`Devolução da chave ${chave.codigo}`} subtitulo={chave.local.nome} aoFechar={aoFechar}>
      <form className={estilos.formulario} onSubmit={handleSubmit(enviar)} noValidate>
        {retirada && (
          <dl className={estilos.resumo}>
            <div>
              <dt>Com</dt>
              <dd>{retirada.pessoa.nome_completo}</dd>
            </div>
            <div>
              <dt>Retirada às</dt>
              <dd>{formatarHora(retirada.retirada_em)}</dd>
            </div>
            <div>
              <dt>Devolução prevista</dt>
              <dd>{formatarHora(retirada.devolucao_prevista)}</dd>
            </div>
          </dl>
        )}

        {atrasada && (
          <p className={estilos.avisoAtraso}>
            <Icone nome="alerta" />
            Devolução com {formatarDuracao(minutosDeAtraso(chave, agora))} de atraso. O atraso fica
            registrado no histórico.
          </p>
        )}

        <label className={estilos.campo}>
          Observação (opcional)
          <textarea
            {...register('observacao')}
            maxLength={200}
            placeholder="Ex.: chaveiro danificado, sala deixada aberta"
            aria-invalid={errors.observacao ? 'true' : 'false'}
            autoFocus
          />
          {errors.observacao && (
            <span className={estilos.erroCampo} role="alert">
              {errors.observacao.message}
            </span>
          )}
        </label>

        {erroGeral && (
          <p className={estilos.erroGeral} role="alert">
            {erroGeral}
          </p>
        )}

        <div className={estilos.rodape}>
          <span className={estilos.operador}>Registrado por {usuario?.email ?? 'usuário atual'}</span>
          <div className={estilos.botoes}>
            <button type="button" className={estilosBotao.botaoSecundario} onClick={aoFechar}>
              Cancelar
            </button>
            <button type="submit" className={estilosBotao.botao} disabled={isSubmitting}>
              <Icone nome="entrada" />
              {isSubmitting ? 'Registrando...' : 'Confirmar devolução'}
            </button>
          </div>
        </div>
      </form>
    </Dialogo>
  );
}
