import { useCallback, useEffect, useMemo, useState } from 'react';
import '../../../estilos/tokens.css';
import { CartaoChave } from '../componentes/CartaoChave';
import estilosChave from '../componentes/chaves.module.css';
import { DialogoDevolucao } from '../componentes/DialogoDevolucao';
import { DialogoRetirada } from '../componentes/DialogoRetirada';
import { Icone } from '../componentes/Icone';
import { useAgora } from '../hooks/useAgora';
import { listarChaves, mensagemDeErroGuarita, usandoDadosSimulados } from '../servicos/chaves';
import type { Chave, SituacaoChave, TipoLocal } from '../tipos/chaves';
import { formatarDuracao, formatarHora, minutosDeAtraso, situacaoDaChave } from '../utilitarios/situacao';
import estilos from './ControleChaves.module.css';

type DialogoAberto = { tipo: 'retirada' | 'devolucao'; chave: Chave } | null;

type Grupo = 'disponivel' | 'em_uso' | 'atrasada' | 'indisponivel';
type Filtro = 'todas' | Grupo;

function grupoDa(situacao: SituacaoChave): Grupo {
  if (situacao === 'disponivel' || situacao === 'reservada') return 'disponivel';
  if (situacao === 'retirada') return 'em_uso';
  if (situacao === 'atrasada') return 'atrasada';
  return 'indisponivel';
}

const ordemDosGrupos: Record<Grupo, number> = { atrasada: 0, em_uso: 1, disponivel: 2, indisponivel: 3 };

const filtrosDoResumo: Array<{ valor: Filtro; rotulo: string }> = [
  { valor: 'todas', rotulo: 'Todas as chaves' },
  { valor: 'disponivel', rotulo: 'Disponíveis' },
  { valor: 'em_uso', rotulo: 'Em uso' },
  { valor: 'atrasada', rotulo: 'Atrasadas' },
  { valor: 'indisponivel', rotulo: 'Indisponíveis' },
];

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function ControleChaves() {
  const agora = useAgora();
  const [chaves, setChaves] = useState<Chave[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [busca, setBusca] = useState('');
  const [tipo, setTipo] = useState<'' | TipoLocal>('');
  const [dialogo, setDialogo] = useState<DialogoAberto>(null);
  const [confirmacao, setConfirmacao] = useState<string | null>(null);

  useEffect(() => {
    if (!confirmacao) return undefined;
    const id = window.setTimeout(() => setConfirmacao(null), 6000);
    return () => window.clearTimeout(id);
  }, [confirmacao]);

  function substituirChave(atualizada: Chave) {
    setChaves((atuais) => atuais.map((chave) => (chave.id === atualizada.id ? atualizada : chave)));
  }

  function acoesDa(chave: Chave, situacao: SituacaoChave) {
    if (situacao === 'disponivel' || situacao === 'reservada') {
      return (
        <button
          type="button"
          className={estilosChave.botao}
          onClick={() => setDialogo({ tipo: 'retirada', chave })}
          aria-label={`Registrar retirada da chave ${chave.codigo}`}
        >
          <Icone nome="saida" />
          Registrar retirada
        </button>
      );
    }
    if (situacao === 'retirada' || situacao === 'atrasada') {
      return (
        <button
          type="button"
          className={estilosChave.botao}
          onClick={() => setDialogo({ tipo: 'devolucao', chave })}
          aria-label={`Registrar devolução da chave ${chave.codigo}`}
        >
          <Icone nome="entrada" />
          Registrar devolução
        </button>
      );
    }
    return null;
  }

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      setChaves(await listarChaves());
    } catch (error: unknown) {
      setErro(mensagemDeErroGuarita(error));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const comSituacao = useMemo(
    () => chaves.map((chave) => ({ chave, situacao: situacaoDaChave(chave, agora) })),
    [chaves, agora],
  );

  const contagem = useMemo(() => {
    const total: Record<Filtro, number> = { todas: 0, disponivel: 0, em_uso: 0, atrasada: 0, indisponivel: 0 };
    comSituacao.forEach(({ situacao }) => {
      total.todas += 1;
      total[grupoDa(situacao)] += 1;
    });
    return total;
  }, [comSituacao]);

  const atrasadas = comSituacao.filter(({ situacao }) => situacao === 'atrasada').map(({ chave }) => chave);

  const visiveis = useMemo(() => {
    const termo = normalizar(busca.trim());
    return comSituacao
      .filter(({ situacao }) => filtro === 'todas' || grupoDa(situacao) === filtro)
      .filter(({ chave }) => !tipo || chave.local.tipo === tipo)
      .filter(({ chave }) => {
        if (!termo) return true;
        const alvo = [chave.codigo, chave.local.nome, chave.retirada_atual?.pessoa.nome_completo ?? ''].join(' ');
        return normalizar(alvo).includes(termo);
      })
      .sort(
        (a, b) =>
          ordemDosGrupos[grupoDa(a.situacao)] - ordemDosGrupos[grupoDa(b.situacao)] ||
          a.chave.codigo.localeCompare(b.chave.codigo, 'pt-BR', { numeric: true }),
      );
  }, [comSituacao, filtro, tipo, busca]);

  return (
    <main className="shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Guarita</p>
          <h1>Controle de chaves</h1>
          <p className="page-description">
            Veja em tempo real quem está com cada chave, registre retiradas e devoluções e acompanhe as
            chaves fora do prazo.
          </p>
        </div>
        <div className={estilos.cabecalhoLateral}>
          {usandoDadosSimulados && <span className="status-chip status-warning">Dados simulados</span>}
          <span className={estilos.relogio}>
            <Icone nome="relogio" tamanho={14} />
            Atualizado às {formatarHora(new Date(agora).toISOString())}
          </span>
        </div>
      </header>

      {carregando && <p className="feedback">Carregando chaves...</p>}
      {erro && (
        <p className="feedback feedback-error" role="alert">
          {erro}
        </p>
      )}

      {!carregando && !erro && (
        <>
          <div aria-live="polite">
            {confirmacao && (
              <p className={estilos.confirmacao}>
                <Icone nome="check" tamanho={18} />
                {confirmacao}
              </p>
            )}
          </div>

          <div aria-live="polite">
            {atrasadas.length > 0 && (
              <section className={estilos.alerta} aria-labelledby="alerta-atrasadas">
                <Icone nome="alerta" tamanho={22} />
                <div>
                  <strong id="alerta-atrasadas">
                    {atrasadas.length === 1
                      ? '1 chave com devolução atrasada'
                      : `${atrasadas.length} chaves com devolução atrasada`}
                  </strong>
                  <ul className={estilos.listaAlerta}>
                    {atrasadas.map((chave) => (
                      <li key={chave.id}>
                        <b>{chave.codigo}</b> ({chave.local.nome}) com {chave.retirada_atual?.pessoa.nome_completo},
                        atrasada há {formatarDuracao(minutosDeAtraso(chave, agora))}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}
          </div>

          <section className="content-panel" aria-labelledby="painel-chaves-titulo">
            <h2 id="painel-chaves-titulo" className={estilos.somenteLeitor}>
              Painel de chaves
            </h2>

            <ul className={estilos.resumo} aria-label="Resumo por situação. Selecione para filtrar.">
              {filtrosDoResumo.map((item) => (
                <li key={item.valor}>
                  <button
                    type="button"
                    className={estilos.filtroResumo}
                    data-grupo={item.valor}
                    aria-pressed={filtro === item.valor}
                    onClick={() => setFiltro(filtro === item.valor && item.valor !== 'todas' ? 'todas' : item.valor)}
                  >
                    <span className={estilos.rotuloResumo}>{item.rotulo}</span>
                    <span className={estilos.numeroResumo}>{contagem[item.valor]}</span>
                  </button>
                </li>
              ))}
            </ul>

            <div className={estilos.ferramentas}>
              <label className={`${estilos.campo} ${estilos.campoBusca}`}>
                Buscar por chave, local ou pessoa
                <input
                  type="search"
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                  placeholder="Ex.: LAB-INF, Sala 3, Ana"
                />
              </label>
              <label className={estilos.campo}>
                Tipo de local
                <select value={tipo} onChange={(event) => setTipo(event.target.value as '' | TipoLocal)}>
                  <option value="">Todos</option>
                  <option value="sala">Salas de aula</option>
                  <option value="laboratorio">Laboratórios</option>
                  <option value="espaco">Espaços</option>
                </select>
              </label>
            </div>

            <p className={estilos.contagem} aria-live="polite">
              {visiveis.length === 1 ? '1 chave encontrada' : `${visiveis.length} chaves encontradas`}
            </p>

            {visiveis.length === 0 ? (
              <p className={estilos.vazio}>Nenhuma chave corresponde aos filtros escolhidos.</p>
            ) : (
              <ul className={estilos.grade}>
                {visiveis.map(({ chave, situacao }) => (
                  <li key={chave.id}>
                    <CartaoChave chave={chave} agora={agora} acoes={acoesDa(chave, situacao)} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {dialogo?.tipo === 'retirada' && (
        <DialogoRetirada
          chave={dialogo.chave}
          aoFechar={() => setDialogo(null)}
          aoConcluir={(atualizada, pessoa) => {
            substituirChave(atualizada);
            setDialogo(null);
            setConfirmacao(`Retirada da chave ${atualizada.codigo} registrada para ${pessoa.nome_completo}.`);
          }}
        />
      )}

      {dialogo?.tipo === 'devolucao' && (
        <DialogoDevolucao
          chave={dialogo.chave}
          agora={agora}
          aoFechar={() => setDialogo(null)}
          aoConcluir={(atualizada, pessoa) => {
            substituirChave(atualizada);
            setDialogo(null);
            setConfirmacao(`Devolução da chave ${atualizada.codigo} registrada${pessoa ? ` (${pessoa})` : ''}.`);
          }}
        />
      )}
    </main>
  );
}
