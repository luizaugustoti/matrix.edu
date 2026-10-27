import { useEffect, useMemo, useState } from 'react';
import { mensagemDeErroGuarita } from '../servicos/chaves';
import { listarMovimentacoesVeiculos } from '../servicos/estacionamento';
import type { MovimentacaoVeiculo } from '../tipos/estacionamento';
import { normalizarPlaca } from '../utilitarios/estacionamento';
import { formatarDataHora, formatarDuracao } from '../utilitarios/situacao';
import estilosBotao from './chaves.module.css';
import { Placa } from './Placa';
import estilos from './historico.module.css';

const TAMANHO_PAGINA = 15;
const DIA = 24 * 60 * 60 * 1000;

type Periodo = 'hoje' | '7dias' | '30dias' | 'tudo';

const periodos: Array<{ valor: Periodo; rotulo: string }> = [
  { valor: 'hoje', rotulo: 'Hoje' },
  { valor: '7dias', rotulo: 'Últimos 7 dias' },
  { valor: '30dias', rotulo: 'Últimos 30 dias' },
  { valor: 'tudo', rotulo: 'Todo o período' },
];

function inicioDoPeriodo(periodo: Periodo, agora: number): number {
  const hoje = new Date(agora);
  hoje.setHours(0, 0, 0, 0);
  if (periodo === 'hoje') return hoje.getTime();
  if (periodo === '7dias') return hoje.getTime() - 6 * DIA;
  if (periodo === '30dias') return hoje.getTime() - 29 * DIA;
  return 0;
}

type Props = {
  agora: number;
  versao: number;
};

export function HistoricoVeiculos({ agora, versao }: Props) {
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoVeiculo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [placa, setPlaca] = useState('');
  const [periodo, setPeriodo] = useState<Periodo>('7dias');
  const [limite, setLimite] = useState(TAMANHO_PAGINA);

  useEffect(() => {
    let ativo = true;
    listarMovimentacoesVeiculos()
      .then((dados) => ativo && setMovimentacoes(dados))
      .catch((error: unknown) => ativo && setErro(mensagemDeErroGuarita(error)))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [versao]);

  useEffect(() => setLimite(TAMANHO_PAGINA), [placa, periodo]);

  const filtradas = useMemo(() => {
    const termo = normalizarPlaca(placa);
    const inicio = inicioDoPeriodo(periodo, agora);
    return movimentacoes.filter(
      (item) =>
        new Date(item.entrada_em).getTime() >= inicio && (!termo || item.veiculo.placa.includes(termo)),
    );
  }, [movimentacoes, placa, periodo, agora]);

  const visiveis = filtradas.slice(0, limite);

  return (
    <section className={`content-panel ${estilos.painel}`} aria-labelledby="historico-veiculos-titulo">
      <div className={estilos.cabecalho}>
        <div>
          <p className="eyebrow">Auditoria</p>
          <h2 id="historico-veiculos-titulo">Histórico de entradas e saídas</h2>
        </div>
        <div className={estilos.filtrosLinha}>
          <label className={estilos.campo}>
            Placa
            <input
              type="search"
              value={placa}
              onChange={(event) => setPlaca(event.target.value.toUpperCase())}
              placeholder="Ex.: RTA2B45"
              maxLength={8}
            />
          </label>
          <label className={estilos.campo}>
            Período
            <select value={periodo} onChange={(event) => setPeriodo(event.target.value as Periodo)}>
              {periodos.map((item) => (
                <option key={item.valor} value={item.valor}>
                  {item.rotulo}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {carregando && <p className="feedback">Carregando histórico...</p>}
      {erro && (
        <p className="feedback feedback-error" role="alert">
          {erro}
        </p>
      )}
      {!carregando && !erro && filtradas.length === 0 && (
        <p className="feedback">Nenhuma entrada registrada com esses filtros.</p>
      )}

      {!carregando && !erro && filtradas.length > 0 && (
        <>
          <div className={estilos.rolagem} role="region" aria-labelledby="historico-veiculos-titulo" tabIndex={0}>
            <table className={estilos.tabela}>
              <caption className={estilos.legenda}>
                {filtradas.length === 1
                  ? '1 registro, do mais recente para o mais antigo'
                  : `${filtradas.length} registros, do mais recente para o mais antigo`}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Placa</th>
                  <th scope="col">Condutor</th>
                  <th scope="col">Entrada</th>
                  <th scope="col">Saída</th>
                  <th scope="col">Permanência</th>
                  <th scope="col">Registrado por</th>
                </tr>
              </thead>
              <tbody>
                {visiveis.map((item) => {
                  const fim = item.saida_em ? new Date(item.saida_em).getTime() : agora;
                  const minutos = Math.max(0, Math.floor((fim - new Date(item.entrada_em).getTime()) / 60000));
                  return (
                    <tr key={item.id}>
                      <th scope="row">
                        <Placa placa={item.veiculo.placa} />
                      </th>
                      <td>
                        {item.condutor.nome_completo}
                        <span className={estilos.secundario}>
                          {item.veiculo.modelo} · {item.condutor.vinculo}
                        </span>
                      </td>
                      <td className={estilos.numero}>{formatarDataHora(item.entrada_em)}</td>
                      <td className={estilos.numero}>
                        {item.saida_em ? (
                          formatarDataHora(item.saida_em)
                        ) : (
                          <span className={estilos.situacao} data-tipo="aberta">
                            No pátio
                          </span>
                        )}
                      </td>
                      <td className={estilos.numero}>{formatarDuracao(minutos)}</td>
                      <td>
                        <span className={estilos.secundario}>Entrada: {item.entrada_registrada_por}</span>
                        {item.saida_registrada_por && (
                          <span className={estilos.secundario}>Saída: {item.saida_registrada_por}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtradas.length > limite && (
            <button
              type="button"
              className={`${estilosBotao.botaoSecundario} ${estilos.mais}`}
              onClick={() => setLimite((atual) => atual + TAMANHO_PAGINA)}
            >
              Mostrar mais ({filtradas.length - limite} restantes)
            </button>
          )}
        </>
      )}
    </section>
  );
}
