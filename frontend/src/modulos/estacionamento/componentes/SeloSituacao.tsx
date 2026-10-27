import type { SituacaoChave } from '../tipos/chaves';
import { rotuloSituacao } from '../utilitarios/situacao';
import { Icone, type NomeIcone } from './Icone';
import estilos from './chaves.module.css';

const iconePorSituacao: Record<SituacaoChave, NomeIcone> = {
  disponivel: 'check',
  reservada: 'relogio',
  retirada: 'saida',
  atrasada: 'alerta',
  perdida: 'interrogacao',
  manutencao: 'ferramenta',
  bloqueada: 'cadeado',
};

// Selo de situacao: cor + icone + texto, para nao depender so da cor.
export function SeloSituacao({ situacao }: { situacao: SituacaoChave }) {
  return (
    <span className={estilos.selo} data-situacao={situacao}>
      <Icone nome={iconePorSituacao[situacao]} tamanho={13} />
      {rotuloSituacao[situacao]}
    </span>
  );
}
