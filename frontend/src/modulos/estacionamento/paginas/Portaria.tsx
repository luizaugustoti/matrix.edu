import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../../estilos/tokens.css';
import { AbasGuarita } from '../componentes/AbasGuarita';
import { HistoricoVeiculos } from '../componentes/HistoricoVeiculos';
import estilosBotao from '../componentes/chaves.module.css';
import { Icone } from '../componentes/Icone';
import { Placa } from '../componentes/Placa';
import { SeloAutorizacao } from '../componentes/SeloAutorizacao';
import { useAgora } from '../hooks/useAgora';
import { mensagemDeErroGuarita, usandoDadosSimulados } from '../servicos/chaves';
import {
  consultarPlaca,
  listarAutorizacoes,
  listarMovimentacoesVeiculos,
  listarNoPatio,
  registrarEntrada,
  registrarSaida,
} from '../servicos/estacionamento';
import type { AutorizacaoEstacionamento, ConsultaPlaca, MovimentacaoVeiculo } from '../tipos/estacionamento';
import {
  diasParaVencer,
  estaVencendo,
  formatarData,
  formatarPlaca,
  normalizarPlaca,
  placaValida,
  situacaoEfetiva,
  textoVencimento,
} from '../utilitarios/estacionamento';
import { formatarDuracao, formatarHora } from '../utilitarios/situacao';
import estilosPainel from './ControleChaves.module.css';
import estilos from './Portaria.module.css';

function minutosDesde(iso: string, agora: number): number {
  return Math.max(0, Math.floor((agora - new Date(iso).getTime()) / 60000));
}

function inicioDoDia(agora: number): number {
  const data = new Date(agora);
  data.setHours(0, 0, 0, 0);
  return data.getTime();
}

export function Portaria() {
  const agora = useAgora();
  const campoPlacaRef = useRef<HTMLInputElement>(null);

  const [placaDigitada, setPlacaDigitada] = useState('');
  const [erroPlaca, setErroPlaca] = useState<string | null>(null);
  const [consulta, setConsulta] = useState<ConsultaPlaca | null>(null);
  const [consultando, setConsultando] = useState(false);
  const [registrando, setRegistrando] = useState<string | null>(null);

  const [noPatio, setNoPatio] = useState<MovimentacaoVeiculo[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoVeiculo[]>([]);
  const [autorizacoes, setAutorizacoes] = useState<AutorizacaoEstacionamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmacao, setConfirmacao] = useState<string | null>(null);
  const [versaoHistorico, setVersaoHistorico] = useState(0);

  const carregar = useCallback(async () => {
    try {
      const [patio, historico, lista] = await Promise.all([
        listarNoPatio(),
        listarMovimentacoesVeiculos(),
        listarAutorizacoes(),
      ]);
      setNoPatio(patio);
      setMovimentacoes(historico);
      setAutorizacoes(lista);
      setVersaoHistorico((atual) => atual + 1);
      setErro(null);
    } catch (error: unknown) {
      setErro(mensagemDeErroGuarita(error));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  useEffect(() => {
    if (!confirmacao) return undefined;
    const id = window.setTimeout(() => setConfirmacao(null), 6000);
    return () => window.clearTimeout(id);
  }, [confirmacao]);

  async function consultar(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!placaValida(placaDigitada)) {
      setErroPlaca('Digite uma placa válida, no formato ABC1234 ou ABC1D23.');
      setConsulta(null);
      return;
    }
    setErroPlaca(null);
    setConsultando(true);
    try {
      setConsulta(await consultarPlaca(placaDigitada));
    } catch (error: unknown) {
      setErroPlaca(mensagemDeErroGuarita(error));
      setConsulta(null);
    } finally {
      setConsultando(false);
    }
  }

  async function entrada(placa: string) {
    setRegistrando(placa);
    try {
      const movimentacao = await registrarEntrada(placa);
      setConfirmacao(
        `Entrada de ${formatarPlaca(placa)} registrada às ${formatarHora(movimentacao.entrada_em)} (${movimentacao.condutor.nome_completo}).`,
      );
      setConsulta(await consultarPlaca(placa));
      await carregar();
    } catch (error: unknown) {
      setErroPlaca(mensagemDeErroGuarita(error));
    } finally {
      setRegistrando(null);
    }
  }

  async function saida(placa: string) {
    setRegistrando(placa);
    try {
      const movimentacao = await registrarSaida(placa);
      setConfirmacao(
        `Saída de ${formatarPlaca(placa)} registrada às ${formatarHora(movimentacao.saida_em ?? new Date().toISOString())}.`,
      );
      if (consulta?.placa === normalizarPlaca(placa)) setConsulta(await consultarPlaca(placa));
      await carregar();
    } catch (error: unknown) {
      setErro(mensagemDeErroGuarita(error));
    } finally {
      setRegistrando(null);
    }
  }

  const entradasHoje = movimentacoes.filter((item) => new Date(item.entrada_em).getTime() >= inicioDoDia(agora)).length;
  const vencendo = autorizacoes.filter((item) => estaVencendo(item, agora)).length;
  const pendentes = autorizacoes.filter((item) => item.situacao === 'pendente' || item.situacao === 'em_analise').length;

  return (
    <main className="shell">
      <AbasGuarita />

      <header className="page-header">
        <div>
          <p className="eyebrow">Guarita</p>
          <h1>Estacionamento</h1>
          <p className="page-description">
            Consulte a placa, confira a autorização e registre a entrada e a saída dos veículos.
          </p>
        </div>
        <div className={estilosPainel.cabecalhoLateral}>
          {usandoDadosSimulados && <span className="status-chip status-warning">Dados simulados</span>}
          <span className={estilosPainel.relogio}>
            <Icone nome="relogio" tamanho={14} />
            Atualizado às {formatarHora(new Date(agora).toISOString())}
          </span>
        </div>
      </header>

      <div aria-live="polite">
        {confirmacao && (
          <p className={estilosPainel.confirmacao}>
            <Icone nome="check" tamanho={18} />
            {confirmacao}
          </p>
        )}
      </div>

      {erro && (
        <p className="feedback feedback-error" role="alert">
          {erro}
        </p>
      )}

      <ul className={estilos.indicadores} aria-label="Resumo do estacionamento">
        <li>
          <div className={estilos.indicador} data-tipo="patio">
            <span className={estilos.indicadorRotulo}>No pátio agora</span>
            <span className={estilos.indicadorNumero}>{carregando ? '–' : noPatio.length}</span>
          </div>
        </li>
        <li>
          <div className={estilos.indicador} data-tipo="entradas">
            <span className={estilos.indicadorRotulo}>Entradas hoje</span>
            <span className={estilos.indicadorNumero}>{carregando ? '–' : entradasHoje}</span>
          </div>
        </li>
        <li>
          <Link to="/guarita/autorizacoes?filtro=vencendo" className={estilos.indicador} data-tipo="vencendo">
            <span className={estilos.indicadorRotulo}>Autorizações vencendo</span>
            <span className={estilos.indicadorNumero}>{carregando ? '–' : vencendo}</span>
            <span className={estilos.indicadorDica}>nos próximos 30 dias</span>
          </Link>
        </li>
        <li>
          <Link to="/guarita/autorizacoes?filtro=analise" className={estilos.indicador} data-tipo="pendentes">
            <span className={estilos.indicadorRotulo}>Aguardando análise</span>
            <span className={estilos.indicadorNumero}>{carregando ? '–' : pendentes}</span>
            <span className={estilos.indicadorDica}>solicitações da coordenação</span>
          </Link>
        </li>
      </ul>

      <div className={estilos.grade}>
        <section className={`content-panel ${estilos.consulta}`} aria-labelledby="consulta-titulo">
          <h2 id="consulta-titulo">Consultar placa</h2>
          <p className={estilos.subtitulo}>Digite a placa do veículo que chegou ao portão.</p>

          <form className={estilos.formConsulta} onSubmit={consultar} noValidate>
            <label className={estilos.campoPlaca}>
              Placa do veículo
              <input
                ref={campoPlacaRef}
                value={placaDigitada}
                onChange={(event) => setPlacaDigitada(event.target.value.toUpperCase())}
                placeholder="ABC1D23"
                maxLength={8}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                aria-invalid={erroPlaca ? 'true' : 'false'}
                aria-describedby={erroPlaca ? 'placa-erro' : undefined}
              />
            </label>
            <button type="submit" className={`${estilosBotao.botao} ${estilos.botaoConsultar}`} disabled={consultando}>
              <Icone nome="busca" />
              {consultando ? 'Consultando...' : 'Consultar'}
            </button>
          </form>
          {erroPlaca && (
            <p id="placa-erro" className={estilos.erroCampo} role="alert">
              {erroPlaca}
            </p>
          )}

          <div aria-live="polite">
            {consulta && (
              <ResultadoConsulta
                consulta={consulta}
                agora={agora}
                registrando={registrando === consulta.placa}
                aoRegistrarEntrada={() => void entrada(consulta.placa)}
                aoRegistrarSaida={() => void saida(consulta.placa)}
              />
            )}
          </div>
        </section>

        <section className={`content-panel ${estilos.patio}`} aria-labelledby="patio-titulo">
          <h2 id="patio-titulo">Veículos no pátio</h2>
          <p className={estilos.subtitulo}>
            {noPatio.length === 1 ? '1 veículo dentro da escola' : `${noPatio.length} veículos dentro da escola`}
          </p>

          {carregando && <p className="feedback">Carregando...</p>}
          {!carregando && noPatio.length === 0 && (
            <p className={estilosPainel.vazio}>Nenhum veículo no pátio agora.</p>
          )}
          {!carregando && noPatio.length > 0 && (
            <ul className={estilos.listaPatio}>
              {noPatio.map((item) => {
                const autorizacao = autorizacoes.find((a) => a.id === item.autorizacao_id);
                const vencida = autorizacao ? situacaoEfetiva(autorizacao, agora) !== 'aprovada' : false;
                return (
                  <li key={item.id} className={estilos.itemPatio} data-vencida={vencida}>
                    <Placa placa={item.veiculo.placa} />
                    <span className={estilos.itemTexto}>
                      <strong>{item.condutor.nome_completo}</strong>
                      <span className={estilos.secundario}>
                        {item.veiculo.modelo} · {item.veiculo.cor} · {item.condutor.vinculo}
                      </span>
                      <span className={estilos.tempo}>
                        Entrou às {formatarHora(item.entrada_em)} · há {formatarDuracao(minutosDesde(item.entrada_em, agora))}
                      </span>
                      {vencida && <span className={estilos.secundario}>Autorização não está mais válida.</span>}
                    </span>
                    <button
                      type="button"
                      className={estilosBotao.botaoSecundario}
                      onClick={() => void saida(item.veiculo.placa)}
                      disabled={registrando === item.veiculo.placa}
                      aria-label={`Registrar saída do veículo ${formatarPlaca(item.veiculo.placa)}`}
                    >
                      <Icone nome="saida" />
                      {registrando === item.veiculo.placa ? 'Registrando...' : 'Registrar saída'}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <HistoricoVeiculos agora={agora} versao={versaoHistorico} />
    </main>
  );
}

type PropsResultado = {
  consulta: ConsultaPlaca;
  agora: number;
  registrando: boolean;
  aoRegistrarEntrada: () => void;
  aoRegistrarSaida: () => void;
};

function ResultadoConsulta({ consulta, agora, registrando, aoRegistrarEntrada, aoRegistrarSaida }: PropsResultado) {
  const { autorizacao, no_patio: noPatio } = consulta;
  const situacao = autorizacao ? situacaoEfetiva(autorizacao, agora) : null;
  const dias = autorizacao ? diasParaVencer(autorizacao, agora) : null;
  const estado = noPatio ? 'no_patio' : consulta.pode_entrar ? 'liberado' : 'bloqueado';

  return (
    <article className={estilos.resultado} data-estado={estado} aria-label={`Resultado da placa ${formatarPlaca(consulta.placa)}`}>
      <div className={estilos.resultadoTopo}>
        <Placa placa={consulta.placa} tamanho="grande" />
        {situacao ? <SeloAutorizacao situacao={situacao} /> : <span className={estilos.secundario}>Sem autorização</span>}
      </div>

      {autorizacao && (
        <dl className={estilos.dados}>
          <div>
            <dt>Condutor</dt>
            <dd>
              {autorizacao.solicitante.nome_completo}
              <span className={estilos.secundario}> · {autorizacao.solicitante.vinculo}</span>
            </dd>
          </div>
          <div>
            <dt>Veículo</dt>
            <dd>
              {autorizacao.veiculo.modelo} · {autorizacao.veiculo.cor}
            </dd>
          </div>
          {autorizacao.valida_ate && (situacao === 'aprovada' || situacao === 'expirada') && (
            <div>
              <dt>Válida até</dt>
              <dd>
                {formatarData(autorizacao.valida_ate)}
                {dias !== null && dias <= 30 && (
                  <>
                    {' '}
                    <span className={estilos.secundario}>({textoVencimento(dias)})</span>
                  </>
                )}
              </dd>
            </div>
          )}
        </dl>
      )}

      {noPatio && (
        <>
          <p className={estilos.liberado}>
            <Icone nome="carro" />
            No pátio desde {formatarHora(noPatio.entrada_em)} (há{' '}
            {formatarDuracao(minutosDesde(noPatio.entrada_em, agora))})
          </p>
          <button
            type="button"
            className={`${estilosBotao.botao} ${estilos.acaoGrande}`}
            onClick={aoRegistrarSaida}
            disabled={registrando}
          >
            <Icone nome="saida" />
            {registrando ? 'Registrando...' : 'Registrar saída'}
          </button>
        </>
      )}

      {!noPatio && consulta.pode_entrar && (
        <>
          <p className={estilos.liberado}>
            <Icone nome="check" />
            Entrada liberada
          </p>
          {autorizacao && estaVencendo(autorizacao, agora) && dias !== null && (
            <p className={estilos.aviso}>
              A autorização {textoVencimento(dias)}. Lembre o condutor de pedir a renovação na coordenação.
            </p>
          )}
          <button
            type="button"
            className={`${estilosBotao.botao} ${estilos.acaoGrande}`}
            onClick={aoRegistrarEntrada}
            disabled={registrando}
          >
            <Icone nome="entrada" />
            {registrando ? 'Registrando...' : 'Registrar entrada'}
          </button>
        </>
      )}

      {!noPatio && !consulta.pode_entrar && (
        <p className={estilos.bloqueio} role="alert">
          <Icone nome="alerta" tamanho={18} />
          <span>Entrada não permitida. {consulta.motivo_bloqueio}</span>
        </p>
      )}
    </article>
  );
}
