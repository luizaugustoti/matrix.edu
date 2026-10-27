import { forwardRef, useEffect, useState } from 'react';
import { listarMovimentacoes, mensagemDeErroGuarita } from '../servicos/chaves';
import type { Chave, Movimentacao } from '../tipos/chaves';
import { formatarDataHora, formatarDuracao } from '../utilitarios/situacao';
import estilosBotao from './chaves.module.css';
import estilos from './historico.module.css';

const TAMANHO_PAGINA = 12;

type Props = {
  chaves: Chave[];
  chaveId: string;
  aoMudarChave: (chaveId: string) => void;
  agora: number;
  versao: number;
};

type SituacaoMovimentacao = { rotulo: string; tipo: 'aberta' | 'atrasada' | 'prazo' | 'atraso' };

function situacaoDa(movimentacao: Movimentacao, agora: number): SituacaoMovimentacao {
  const prevista = new Date(movimentacao.devolucao_prevista).getTime();

  if (!movimentacao.devolvida_em) {
    return prevista < agora ? { rotulo: 'Atrasada', tipo: 'atrasada' } : { rotulo: 'Em aberto', tipo: 'aberta' };
  }

  const atraso = Math.floor((new Date(movimentacao.devolvida_em).getTime() - prevista) / 60000);
  return atraso > 0
    ? { rotulo: `Devolvida com ${formatarDuracao(atraso)} de atraso`, tipo: 'atraso' }
    : { rotulo: 'Devolvida no prazo', tipo: 'prazo' };
}

export const HistoricoMovimentacoes = forwardRef<HTMLHeadingElement, Props>(function HistoricoMovimentacoes(
  { chaves, chaveId, aoMudarChave, agora, versao },
  tituloRef,
) {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [limite, setLimite] = useState(TAMANHO_PAGINA);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(null);
    listarMovimentacoes(chaveId || undefined)
      .then((dados) => ativo && setMovimentacoes(dados))
      .catch((error: unknown) => ativo && setErro(mensagemDeErroGuarita(error)))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [chaveId, versao]);

  useEffect(() => setLimite(TAMANHO_PAGINA), [chaveId]);

  const chavesOrdenadas = [...chaves].sort((a, b) => a.codigo.localeCompare(b.codigo, 'pt-BR', { numeric: true }));
  const visiveis = movimentacoes.slice(0, limite);

  return (
    <section className={`content-panel ${estilos.painel}`} aria-labelledby="historico-titulo">
      <div className={estilos.cabecalho}>
        <div>
          <p className="eyebrow">Auditoria</p>
          <h2 id="historico-titulo" ref={tituloRef} tabIndex={-1}>
            Histórico de movimentações
          </h2>
        </div>
        <label className={estilos.campo}>
          Chave
          <select value={chaveId} onChange={(event) => aoMudarChave(event.target.value)}>
            <option value="">Todas as chaves</option>
            {chavesOrdenadas.map((chave) => (
              <option key={chave.id} value={chave.id}>
                {chave.codigo} · {chave.local.nome}
              </option>
            ))}
          </select>
        </label>
      </div>

      {carregando && <p className="feedback">Carregando histórico...</p>}
      {erro && (
        <p className="feedback feedback-error" role="alert">
          {erro}
        </p>
      )}
      {!carregando && !erro && movimentacoes.length === 0 && (
        <p className="feedback">Nenhuma movimentação registrada para esta chave.</p>
      )}

      {!carregando && !erro && movimentacoes.length > 0 && (
        <>
          <div className={estilos.rolagem} role="region" aria-labelledby="historico-titulo" tabIndex={0}>
            <table className={estilos.tabela}>
              <caption className={estilos.legenda}>
                {movimentacoes.length === 1
                  ? '1 movimentação, da mais recente para a mais antiga'
                  : `${movimentacoes.length} movimentações, da mais recente para a mais antiga`}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Chave</th>
                  <th scope="col">Pessoa</th>
                  <th scope="col">Retirada</th>
                  <th scope="col">Devolução prevista</th>
                  <th scope="col">Devolvida</th>
                  <th scope="col">Situação</th>
                  <th scope="col">Registrado por</th>
                </tr>
              </thead>
              <tbody>
                {visiveis.map((movimentacao) => {
                  const situacao = situacaoDa(movimentacao, agora);
                  const observacoes = [movimentacao.observacao_retirada, movimentacao.observacao_devolucao].filter(
                    Boolean,
                  );
                  return (
                    <tr key={movimentacao.id}>
                      <th scope="row">
                        <span className={estilos.codigo}>{movimentacao.chave_codigo}</span>
                        <span className={estilos.secundario}>{movimentacao.local_nome}</span>
                      </th>
                      <td>
                        {movimentacao.pessoa.nome_completo}
                        <span className={estilos.secundario}>{movimentacao.pessoa.papel}</span>
                      </td>
                      <td className={estilos.numero}>{formatarDataHora(movimentacao.retirada_em)}</td>
                      <td className={estilos.numero}>{formatarDataHora(movimentacao.devolucao_prevista)}</td>
                      <td className={estilos.numero}>
                        {movimentacao.devolvida_em ? formatarDataHora(movimentacao.devolvida_em) : '—'}
                      </td>
                      <td>
                        <span className={estilos.situacao} data-tipo={situacao.tipo}>
                          {situacao.rotulo}
                        </span>
                        {observacoes.map((texto) => (
                          <span key={texto} className={estilos.observacao}>
                            {texto}
                          </span>
                        ))}
                      </td>
                      <td>
                        <span className={estilos.secundario}>Retirada: {movimentacao.retirada_registrada_por}</span>
                        {movimentacao.devolucao_registrada_por && (
                          <span className={estilos.secundario}>
                            Devolução: {movimentacao.devolucao_registrada_por}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {movimentacoes.length > limite && (
            <button
              type="button"
              className={`${estilosBotao.botaoSecundario} ${estilos.mais}`}
              onClick={() => setLimite((atual) => atual + TAMANHO_PAGINA)}
            >
              Mostrar mais ({movimentacoes.length - limite} restantes)
            </button>
          )}
        </>
      )}
    </section>
  );
});
