import type { SituacaoAutorizacao } from '../tipos/estacionamento';
import { rotuloSituacaoAutorizacao } from '../utilitarios/estacionamento';
import { Icone, type NomeIcone } from './Icone';
import estilos from './estacionamento.module.css';

const icone: Record<SituacaoAutorizacao, NomeIcone> = {
  pendente: 'relogio',
  em_analise: 'busca',
  aprovada: 'check',
  rejeitada: 'fechar',
  expirada: 'alerta',
  cancelada: 'cadeado',
};

// Selo da situacao da autorizacao: cor + icone + texto.
export function SeloAutorizacao({ situacao }: { situacao: SituacaoAutorizacao }) {
  return (
    <span className={estilos.selo} data-situacao={situacao}>
      <Icone nome={icone[situacao]} tamanho={13} />
      {rotuloSituacaoAutorizacao[situacao]}
    </span>
  );
}
