import { useState } from 'react';
import { useAuth } from '../../../contextos/AuthContext';
import { mensagemDeErroGuarita } from '../servicos/chaves';
import {
  aprovarAutorizacao,
  cancelarAutorizacao,
  iniciarAnalise,
  rejeitarAutorizacao,
} from '../servicos/estacionamento';
import type { AutorizacaoEstacionamento } from '../tipos/estacionamento';
import {
  MESES_VALIDADE,
  adicionarMeses,
  diasParaVencer,
  formatarData,
  formatarPlaca,
  formatarTamanho,
  rotuloDocumento,
  situacaoEfetiva,
  textoVencimento,
} from '../utilitarios/estacionamento';
import { formatarDataHora } from '../utilitarios/situacao';
import { motivoSchema } from '../validacoes/estacionamento';
import { Dialogo } from './Dialogo';
import { Icone } from './Icone';
import { Placa } from './Placa';
import { SeloAutorizacao } from './SeloAutorizacao';
import estilosBotao from './chaves.module.css';
import estilos from './dialogo.module.css';
import estilosAnalise from './analise.module.css';

type Modo = 'ver' | 'rejeitar' | 'cancelar';

type Props = {
  autorizacao: AutorizacaoEstacionamento;
  autorizacaoAnterior?: AutorizacaoEstacionamento;
  agora: number;
  aoFechar: () => void;
  aoAtualizar: (autorizacao: AutorizacaoEstacionamento, mensagem: string) => void;
};

export function DialogoAnalise({ autorizacao, autorizacaoAnterior, agora, aoFechar, aoAtualizar }: Props) {
  const { usuario } = useAuth();
  const [modo, setModo] = useState<Modo>('ver');
  const [motivo, setMotivo] = useState('');
  const [erroMotivo, setErroMotivo] = useState<string | null>(null);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const situacao = situacaoEfetiva(autorizacao, agora);
  const emAnalise = situacao === 'pendente' || situacao === 'em_analise';
  const placa = formatarPlaca(autorizacao.veiculo.placa);

  // Previsao da validade se aprovar agora (renovacao comeca no fim da anterior).
  const anteriorAindaValida =
    autorizacaoAnterior?.valida_ate && new Date(autorizacaoAnterior.valida_ate).getTime() > agora;
  const inicioPrevisto = anteriorAindaValida ? new Date(autorizacaoAnterior.valida_ate as string) : new Date(agora);
  const fimPrevisto = adicionarMeses(inicioPrevisto, MESES_VALIDADE);

  async function executar(acao: () => Promise<AutorizacaoEstacionamento>, mensagem: string) {
    setErroGeral(null);
    setEnviando(true);
    try {
      aoAtualizar(await acao(), mensagem);
    } catch (error: unknown) {
      setErroGeral(mensagemDeErroGuarita(error));
    } finally {
      setEnviando(false);
    }
  }

  function confirmarComMotivo() {
    const resultado = motivoSchema.safeParse(motivo);
    if (!resultado.success) {
      setErroMotivo(resultado.error.issues[0]?.message ?? 'Motivo inválido.');
      return;
    }
    setErroMotivo(null);
    if (modo === 'rejeitar') {
      void executar(() => rejeitarAutorizacao(autorizacao.id, resultado.data), `Solicitação da placa ${placa} rejeitada.`);
    } else {
      void executar(() => cancelarAutorizacao(autorizacao.id, resultado.data), `Autorização da placa ${placa} cancelada.`);
    }
  }

  const dias = diasParaVencer(autorizacao, agora);

  return (
    <Dialogo
      titulo={emAnalise ? 'Análise da solicitação' : 'Detalhes da autorização'}
      subtitulo={`${autorizacao.solicitante.nome_completo} · ${autorizacao.solicitante.vinculo}`}
      aoFechar={aoFechar}
      largura="larga"
    >
      <div className={estilos.formulario}>
        <div className={estilosAnalise.topo}>
          <Placa placa={autorizacao.veiculo.placa} tamanho="grande" />
          <div className={estilosAnalise.topoTexto}>
            <SeloAutorizacao situacao={situacao} />
            {autorizacao.renovacao_de && <span className={estilos.dica}>Pedido de renovação</span>}
          </div>
        </div>

        <dl className={estilos.resumo}>
          <div>
            <dt>Veículo</dt>
            <dd>
              {autorizacao.veiculo.modelo} · {autorizacao.veiculo.cor} ·{' '}
              {autorizacao.veiculo.tipo === 'moto' ? 'Moto' : 'Carro'}
            </dd>
          </div>
          <div>
            <dt>Telefone</dt>
            <dd>{autorizacao.solicitante.telefone ?? 'Não informado'}</dd>
          </div>
          <div>
            <dt>Solicitada em</dt>
            <dd>{formatarDataHora(autorizacao.solicitada_em)}</dd>
          </div>
          {autorizacao.valida_de && autorizacao.valida_ate && (
            <div>
              <dt>Validade</dt>
              <dd>
                {formatarData(autorizacao.valida_de)} a {formatarData(autorizacao.valida_ate)}
                {dias !== null && dias <= 30 && ` (${textoVencimento(dias)})`}
              </dd>
            </div>
          )}
          {autorizacao.analisada_em && (
            <div>
              <dt>{situacao === 'cancelada' ? 'Cancelada por' : 'Analisada por'}</dt>
              <dd>
                {autorizacao.analisada_por} em {formatarDataHora(autorizacao.analisada_em)}
              </dd>
            </div>
          )}
        </dl>

        {autorizacao.motivo && (
          <p className={estilos.aviso}>
            <strong>Motivo:</strong> {autorizacao.motivo}
          </p>
        )}

        <section aria-labelledby="documentos-titulo">
          <h3 id="documentos-titulo" className={estilosAnalise.subtitulo}>
            Documentos enviados
          </h3>
          <ul className={estilosAnalise.documentos}>
            {autorizacao.documentos.map((documento) => (
              <li key={documento.id} className={estilosAnalise.documento}>
                <Icone nome="documento" tamanho={20} />
                <span className={estilosAnalise.documentoTexto}>
                  <strong>{rotuloDocumento[documento.tipo]}</strong>
                  <span className={estilos.dica}>
                    {documento.nome_arquivo} · {formatarTamanho(documento.tamanho_bytes)}
                  </span>
                </span>
                {documento.url ? (
                  <a
                    className={estilosBotao.botaoSecundario}
                    href={documento.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Abrir ${rotuloDocumento[documento.tipo]} em nova aba`}
                  >
                    Abrir
                  </a>
                ) : (
                  <span className={estilos.dica}>Arquivo de exemplo</span>
                )}
              </li>
            ))}
          </ul>
          {emAnalise && (
            <p className={estilos.dica}>
              Confira: CNH legível e válida, CRLV do mesmo veículo e da mesma placa, e termo assinado pelo condutor.
            </p>
          )}
        </section>

        {(modo === 'rejeitar' || modo === 'cancelar') && (
          <label className={estilos.campo}>
            {modo === 'rejeitar' ? 'Motivo da rejeição (o solicitante verá este texto)' : 'Motivo do cancelamento'}
            <textarea
              value={motivo}
              onChange={(event) => setMotivo(event.target.value)}
              maxLength={300}
              placeholder={
                modo === 'rejeitar'
                  ? 'Ex.: foto da CNH ilegível, envie uma nova imagem.'
                  : 'Ex.: servidor desligado da escola.'
              }
              aria-invalid={erroMotivo ? 'true' : 'false'}
              aria-describedby={erroMotivo ? 'motivo-erro' : undefined}
              autoFocus
            />
            {erroMotivo && (
              <span id="motivo-erro" className={estilos.erroCampo} role="alert">
                <Icone nome="alerta" tamanho={14} />
                {erroMotivo}
              </span>
            )}
          </label>
        )}

        {emAnalise && modo === 'ver' && (
          <p className={estilos.aviso}>
            Se aprovar agora, a autorização vale de <strong>{formatarData(inicioPrevisto.toISOString())}</strong> a{' '}
            <strong>{formatarData(fimPrevisto.toISOString())}</strong>.
          </p>
        )}

        {erroGeral && (
          <p className={estilos.erroGeral} role="alert">
            {erroGeral}
          </p>
        )}

        <div className={estilos.rodape}>
          <span className={estilos.operador}>Registrado por {usuario?.email ?? 'usuário atual'}</span>
          <div className={`${estilos.botoes} ${estilosAnalise.botoes}`}>
            {modo === 'ver' && emAnalise && (
              <>
                {situacao === 'pendente' && (
                  <button
                    type="button"
                    className={estilosBotao.botaoSecundario}
                    disabled={enviando}
                    onClick={() =>
                      void executar(() => iniciarAnalise(autorizacao.id), `Solicitação da placa ${placa} marcada como em análise.`)
                    }
                  >
                    Marcar em análise
                  </button>
                )}
                <button type="button" className={estilosBotao.botaoSecundario} onClick={() => setModo('rejeitar')}>
                  <Icone nome="fechar" />
                  Rejeitar
                </button>
                <button
                  type="button"
                  className={estilosBotao.botao}
                  disabled={enviando}
                  onClick={() =>
                    void executar(
                      () => aprovarAutorizacao(autorizacao.id),
                      `Autorização da placa ${placa} aprovada até ${formatarData(fimPrevisto.toISOString())}.`,
                    )
                  }
                >
                  <Icone nome="check" />
                  {enviando ? 'Aprovando...' : `Aprovar por ${MESES_VALIDADE} meses`}
                </button>
              </>
            )}

            {modo === 'ver' && situacao === 'aprovada' && (
              <button type="button" className={estilosBotao.botaoSecundario} onClick={() => setModo('cancelar')}>
                <Icone nome="cadeado" />
                Cancelar autorização
              </button>
            )}

            {modo === 'ver' && !emAnalise && (
              <button type="button" className={estilosBotao.botao} onClick={aoFechar}>
                Fechar
              </button>
            )}

            {modo !== 'ver' && (
              <>
                <button
                  type="button"
                  className={estilosBotao.botaoSecundario}
                  onClick={() => {
                    setModo('ver');
                    setErroMotivo(null);
                  }}
                >
                  Voltar
                </button>
                <button type="button" className={estilosBotao.botao} disabled={enviando} onClick={confirmarComMotivo}>
                  {enviando ? 'Salvando...' : modo === 'rejeitar' ? 'Confirmar rejeição' : 'Confirmar cancelamento'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </Dialogo>
  );
}
