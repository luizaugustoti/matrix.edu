import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../../../estilos/tokens.css';
import { AbasGuarita } from '../componentes/AbasGuarita';
import estilosBotao from '../componentes/chaves.module.css';
import { DialogoAnalise } from '../componentes/DialogoAnalise';
import { DialogoSolicitacao } from '../componentes/DialogoSolicitacao';
import estilosComponentes from '../componentes/estacionamento.module.css';
import { Icone } from '../componentes/Icone';
import { Placa } from '../componentes/Placa';
import { SeloAutorizacao } from '../componentes/SeloAutorizacao';
import { useAgora } from '../hooks/useAgora';
import { mensagemDeErroGuarita, usandoDadosSimulados } from '../servicos/chaves';
import { listarAutorizacoes } from '../servicos/estacionamento';
import type { AutorizacaoEstacionamento } from '../tipos/estacionamento';
import {
  diasParaVencer,
  estaVencendo,
  formatarData,
  formatarPlaca,
  normalizarPlaca,
  situacaoEfetiva,
  textoVencimento,
} from '../utilitarios/estacionamento';
import { formatarHora } from '../utilitarios/situacao';
import estilosPainel from './ControleChaves.module.css';
import estilos from './Autorizacoes.module.css';

type Filtro = 'todas' | 'analise' | 'vencendo' | 'aprovadas' | 'expiradas' | 'rejeitadas' | 'canceladas';

const filtros: Array<{ valor: Filtro; rotulo: string }> = [
  { valor: 'todas', rotulo: 'Todas' },
  { valor: 'analise', rotulo: 'Aguardando análise' },
  { valor: 'vencendo', rotulo: 'Vencendo' },
  { valor: 'aprovadas', rotulo: 'Aprovadas' },
  { valor: 'expiradas', rotulo: 'Expiradas' },
  { valor: 'rejeitadas', rotulo: 'Rejeitadas' },
  { valor: 'canceladas', rotulo: 'Canceladas' },
];

function passaNoFiltro(autorizacao: AutorizacaoEstacionamento, filtro: Filtro, agora: number): boolean {
  const situacao = situacaoEfetiva(autorizacao, agora);
  switch (filtro) {
    case 'analise':
      return situacao === 'pendente' || situacao === 'em_analise';
    case 'vencendo':
      return estaVencendo(autorizacao, agora);
    case 'aprovadas':
      return situacao === 'aprovada';
    case 'expiradas':
      return situacao === 'expirada';
    case 'rejeitadas':
      return situacao === 'rejeitada';
    case 'canceladas':
      return situacao === 'cancelada';
    default:
      return true;
  }
}

// Ordem de prioridade na lista: o que precisa de acao vem primeiro.
function prioridade(autorizacao: AutorizacaoEstacionamento, agora: number): number {
  const situacao = situacaoEfetiva(autorizacao, agora);
  if (situacao === 'pendente' || situacao === 'em_analise') return 0;
  if (estaVencendo(autorizacao, agora)) return 1;
  if (situacao === 'expirada') return 2;
  if (situacao === 'aprovada') return 3;
  return 4;
}

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

type Janela =
  | { tipo: 'nova' }
  | { tipo: 'renovar'; base: AutorizacaoEstacionamento }
  | { tipo: 'reenviar'; base: AutorizacaoEstacionamento }
  | { tipo: 'analise'; autorizacao: AutorizacaoEstacionamento }
  | null;

export function Autorizacoes() {
  const agora = useAgora();
  const [parametros, setParametros] = useSearchParams();
  const filtroDaUrl = parametros.get('filtro') as Filtro | null;
  const filtro: Filtro = filtros.some((item) => item.valor === filtroDaUrl) ? (filtroDaUrl as Filtro) : 'todas';

  const [autorizacoes, setAutorizacoes] = useState<AutorizacaoEstacionamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [janela, setJanela] = useState<Janela>(null);
  const [confirmacao, setConfirmacao] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setAutorizacoes(await listarAutorizacoes());
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

  function escolherFiltro(valor: Filtro) {
    setParametros(valor === 'todas' ? {} : { filtro: valor }, { replace: true });
  }

  const contagem = useMemo(() => {
    const total = {} as Record<Filtro, number>;
    filtros.forEach(({ valor }) => {
      total[valor] = autorizacoes.filter((item) => passaNoFiltro(item, valor, agora)).length;
    });
    return total;
  }, [autorizacoes, agora]);

  const visiveis = useMemo(() => {
    const termo = normalizar(busca.trim());
    const termoPlaca = normalizarPlaca(busca);
    return autorizacoes
      .filter((item) => passaNoFiltro(item, filtro, agora))
      .filter((item) => {
        if (!termo) return true;
        return (
          normalizar(item.solicitante.nome_completo).includes(termo) ||
          (termoPlaca.length > 0 && item.veiculo.placa.includes(termoPlaca))
        );
      })
      .sort(
        (a, b) =>
          prioridade(a, agora) - prioridade(b, agora) ||
          new Date(b.solicitada_em).getTime() - new Date(a.solicitada_em).getTime(),
      );
  }, [autorizacoes, filtro, busca, agora]);

  function concluir(mensagem: string) {
    setJanela(null);
    setConfirmacao(mensagem);
    void carregar();
  }

  function acoesDa(autorizacao: AutorizacaoEstacionamento) {
    const situacao = situacaoEfetiva(autorizacao, agora);
    const placa = formatarPlaca(autorizacao.veiculo.placa);
    const jaRenovando = autorizacoes.some(
      (item) =>
        item.renovacao_de === autorizacao.id && (item.situacao === 'pendente' || item.situacao === 'em_analise'),
    );

    if (situacao === 'pendente' || situacao === 'em_analise') {
      return (
        <button
          type="button"
          className={estilosBotao.botao}
          onClick={() => setJanela({ tipo: 'analise', autorizacao })}
          aria-label={`Analisar solicitação da placa ${placa}`}
        >
          <Icone nome="busca" />
          Analisar
        </button>
      );
    }

    const detalhes = (
      <button
        type="button"
        className={estilosBotao.botaoSecundario}
        onClick={() => setJanela({ tipo: 'analise', autorizacao })}
        aria-label={`Ver detalhes da autorização da placa ${placa}`}
      >
        Detalhes
      </button>
    );

    if ((situacao === 'expirada' || estaVencendo(autorizacao, agora)) && !jaRenovando) {
      return (
        <>
          <button
            type="button"
            className={estilosBotao.botao}
            onClick={() => setJanela({ tipo: 'renovar', base: autorizacao })}
            aria-label={`Renovar autorização da placa ${placa}`}
          >
            <Icone nome="historico" />
            Renovar
          </button>
          {detalhes}
        </>
      );
    }

    if (situacao === 'rejeitada') {
      return (
        <>
          <button
            type="button"
            className={estilosBotao.botao}
            onClick={() => setJanela({ tipo: 'reenviar', base: autorizacao })}
            aria-label={`Reenviar solicitação da placa ${placa}`}
          >
            <Icone nome="documento" />
            Reenviar
          </button>
          {detalhes}
        </>
      );
    }

    return detalhes;
  }

  return (
    <main className="shell">
      <AbasGuarita />

      <header className="page-header">
        <div>
          <p className="eyebrow">Guarita · Coordenação</p>
          <h1>Autorizações</h1>
          <p className="page-description">
            Solicitações de uso do estacionamento, análise dos documentos e renovação a cada 6 meses.
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

      <section className="content-panel" aria-labelledby="autorizacoes-titulo">
        <div className={estilos.topo}>
          <h2 id="autorizacoes-titulo">Solicitações e autorizações</h2>
          <button type="button" className={estilosBotao.botao} onClick={() => setJanela({ tipo: 'nova' })}>
            <Icone nome="documento" />
            Nova solicitação
          </button>
        </div>

        <div className={estilos.filtros} role="group" aria-label="Filtrar por situação">
          {filtros.map((item) => (
            <button
              key={item.valor}
              type="button"
              className={estilos.filtro}
              aria-pressed={filtro === item.valor}
              onClick={() => escolherFiltro(item.valor)}
            >
              {item.rotulo}
              <span className={estilos.contador}>{contagem[item.valor] ?? 0}</span>
            </button>
          ))}
        </div>

        <label className={`${estilosPainel.campo} ${estilos.busca}`}>
          Buscar por nome ou placa
          <input
            type="search"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Ex.: Juliana, SDF1A90"
          />
        </label>

        {carregando && <p className="feedback">Carregando autorizações...</p>}
        {erro && (
          <p className="feedback feedback-error" role="alert">
            {erro}
          </p>
        )}

        {!carregando && !erro && (
          <>
            <p className={estilosPainel.contagem} aria-live="polite">
              {visiveis.length === 1 ? '1 resultado' : `${visiveis.length} resultados`}
            </p>
            {visiveis.length === 0 ? (
              <p className={estilosPainel.vazio}>Nenhuma autorização corresponde aos filtros.</p>
            ) : (
              <ul className={estilos.lista}>
                {visiveis.map((autorizacao) => {
                  const situacao = situacaoEfetiva(autorizacao, agora);
                  const dias = diasParaVencer(autorizacao, agora);
                  const vencendo = estaVencendo(autorizacao, agora);
                  return (
                    <li key={autorizacao.id}>
                      <article
                        className={estilos.item}
                        data-situacao={situacao}
                        aria-label={`Autorização da placa ${formatarPlaca(autorizacao.veiculo.placa)}`}
                      >
                        <Placa placa={autorizacao.veiculo.placa} />
                        <div className={estilos.itemTexto}>
                          <strong>{autorizacao.solicitante.nome_completo}</strong>
                          <span className={estilos.secundario}>
                            {autorizacao.solicitante.vinculo} · {autorizacao.veiculo.modelo} · {autorizacao.veiculo.cor}
                          </span>
                          {autorizacao.motivo && (situacao === 'rejeitada' || situacao === 'cancelada') && (
                            <span className={estilos.motivo}>Motivo: {autorizacao.motivo}</span>
                          )}
                        </div>
                        <div className={estilos.itemSituacao}>
                          <SeloAutorizacao situacao={situacao} />
                          {vencendo && dias !== null && (
                            <span className={estilosComponentes.vencendo}>
                              <Icone nome="alerta" tamanho={12} />
                              {textoVencimento(dias)}
                            </span>
                          )}
                          <span className={estilos.secundario}>
                            {autorizacao.valida_ate && (situacao === 'aprovada' || situacao === 'expirada')
                              ? `Válida até ${formatarData(autorizacao.valida_ate)}`
                              : `Solicitada em ${formatarData(autorizacao.solicitada_em)}`}
                          </span>
                          {autorizacao.renovacao_de && <span className={estilos.secundario}>Renovação</span>}
                        </div>
                        <div className={estilos.itemAcoes}>{acoesDa(autorizacao)}</div>
                      </article>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </section>

      {janela?.tipo === 'nova' && (
        <DialogoSolicitacao
          aoFechar={() => setJanela(null)}
          aoConcluir={(criada) =>
            concluir(`Solicitação da placa ${formatarPlaca(criada.veiculo.placa)} enviada para análise.`)
          }
        />
      )}

      {(janela?.tipo === 'renovar' || janela?.tipo === 'reenviar') && (
        <DialogoSolicitacao
          base={janela.base}
          renovacao={janela.tipo === 'renovar'}
          aoFechar={() => setJanela(null)}
          aoConcluir={(criada) =>
            concluir(
              janela.tipo === 'renovar'
                ? `Pedido de renovação da placa ${formatarPlaca(criada.veiculo.placa)} enviado para análise.`
                : `Solicitação da placa ${formatarPlaca(criada.veiculo.placa)} reenviada para análise.`,
            )
          }
        />
      )}

      {janela?.tipo === 'analise' && (
        <DialogoAnalise
          autorizacao={janela.autorizacao}
          autorizacaoAnterior={autorizacoes.find((item) => item.id === janela.autorizacao.renovacao_de)}
          agora={agora}
          aoFechar={() => setJanela(null)}
          aoAtualizar={(_atualizada, mensagem) => concluir(mensagem)}
        />
      )}
    </main>
  );
}
