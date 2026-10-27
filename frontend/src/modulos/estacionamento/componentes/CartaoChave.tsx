import type { ReactNode } from 'react';
import type { Chave } from '../tipos/chaves';
import {
  formatarDuracao,
  formatarHora,
  minutosDeAtraso,
  rotuloTipoLocal,
  situacaoDaChave,
} from '../utilitarios/situacao';
import { SeloSituacao } from './SeloSituacao';
import estilos from './chaves.module.css';

type Props = {
  chave: Chave;
  agora: number;
  acoes?: ReactNode;
};

export function CartaoChave({ chave, agora, acoes }: Props) {
  const situacao = situacaoDaChave(chave, agora);
  const retirada = chave.retirada_atual;
  const tituloId = `chave-${chave.id}-titulo`;

  return (
    <article className={estilos.cartao} data-situacao={situacao} aria-labelledby={tituloId}>
      <div className={estilos.topoCartao}>
        <div>
          <h3 id={tituloId} className={estilos.codigo}>
            {chave.codigo}
          </h3>
          <p className={estilos.local}>
            {chave.local.nome}
            <span className={estilos.tipoLocal}>{rotuloTipoLocal[chave.local.tipo]}</span>
          </p>
        </div>
        <SeloSituacao situacao={situacao} />
      </div>

      {retirada && (
        <dl className={estilos.detalhes}>
          <div>
            <dt>Com</dt>
            <dd>
              {retirada.pessoa.nome_completo}
              <span className={estilos.papel}> ({retirada.pessoa.papel})</span>
            </dd>
          </div>
          <div>
            <dt>Retirada</dt>
            <dd>{formatarHora(retirada.retirada_em)}</dd>
          </div>
          <div>
            <dt>Devolver até</dt>
            <dd>{formatarHora(retirada.devolucao_prevista)}</dd>
          </div>
        </dl>
      )}

      {situacao === 'atrasada' && (
        <p className={estilos.atraso}>Atrasada há {formatarDuracao(minutosDeAtraso(chave, agora))}</p>
      )}

      {chave.observacao && !retirada && <p className={estilos.observacao}>{chave.observacao}</p>}

      {acoes && <div className={estilos.acoes}>{acoes}</div>}
    </article>
  );
}
