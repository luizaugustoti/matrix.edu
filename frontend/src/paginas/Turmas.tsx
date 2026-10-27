import { FormEvent, useEffect, useState } from 'react';
import axios from 'axios';
import { listarUnidades } from '../servicos/fundacao';
import { criarTurma, listarCursos, listarTurmas } from '../servicos/pedagogico';
import type { Unidade } from '../tipos/fundacao';
import type { Curso } from '../tipos/pedagogico';
import type { Turma } from '../tipos/turmas';

function mensagemDeErro(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    return 'Entre no sistema para consultar ou cadastrar turmas.';
  }

  return 'Nao foi possivel concluir a operacao. Tente novamente.';
}

export function Turmas() {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [unidadeId, setUnidadeId] = useState('');
  const [cursoId, setCursoId] = useState('');
  const [nome, setNome] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [sala, setSala] = useState('');
  const [capacidade, setCapacidade] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    listarUnidades()
      .then((dados) => {
        setUnidades(dados);
        setUnidadeId(dados[0]?.id ?? '');
      })
      .catch((error: unknown) => setErro(mensagemDeErro(error)))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    if (!unidadeId) {
      setCursos([]);
      setCursoId('');
      setTurmas([]);
      return;
    }

    setCarregando(true);
    Promise.all([listarCursos(unidadeId), listarTurmas(unidadeId)])
      .then(([cursosDaUnidade, turmasDaUnidade]) => {
        setCursos(cursosDaUnidade);
        setCursoId(cursosDaUnidade[0]?.id ?? '');
        setTurmas(turmasDaUnidade);
      })
      .catch((error: unknown) => setErro(mensagemDeErro(error)))
      .finally(() => setCarregando(false));
  }, [unidadeId]);

  async function submeter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!unidadeId || !cursoId || !nome.trim()) {
      setErro('Preencha unidade, curso e nome da turma.');
      return;
    }

    setSalvando(true);
    setErro(null);
    try {
      const turma = await criarTurma({
        unidade_id: unidadeId,
        curso_id: cursoId,
        nome: nome.trim(),
        ...(periodo ? { periodo: periodo.trim() } : {}),
        ...(sala ? { sala: sala.trim() } : {}),
        ...(capacidade ? { capacidade: Number(capacidade) } : {}),
      });
      setTurmas((atuais) => [...atuais, turma].sort((a, b) => a.nome.localeCompare(b.nome)));
      setNome('');
      setPeriodo('');
      setSala('');
      setCapacidade('');
    } catch (error: unknown) {
      setErro(mensagemDeErro(error));
    } finally {
      setSalvando(false);
    }
  }

  const cursoSelecionado = cursos.find((curso) => curso.id === cursoId);

  return (
    <main className="shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Coordenacao pedagogica</p>
          <h1>Turmas</h1>
          <p className="page-description">Organize turmas, salas, capacidade e periodos por curso.</p>
        </div>
        <span className="status-chip">Estrutura pedagogica</span>
      </header>

      <section className="content-panel" aria-labelledby="turmas-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Oferta educacional</p>
            <h2 id="turmas-title">Turmas cadastradas</h2>
          </div>
          <div className="filter-row">
            <label className="inline-field"><span>Unidade</span><select value={unidadeId} onChange={(event) => setUnidadeId(event.target.value)}><option value="">Selecione</option>{unidades.map((unidade) => <option key={unidade.id} value={unidade.id}>{unidade.nome}</option>)}</select></label>
            <label className="inline-field"><span>Curso</span><select value={cursoId} onChange={(event) => setCursoId(event.target.value)} disabled={!cursos.length}><option value="">Selecione</option>{cursos.map((curso) => <option key={curso.id} value={curso.id}>{curso.nome}</option>)}</select></label>
          </div>
        </div>

        {carregando && <p className="feedback">Carregando dados...</p>}
        {erro && <p className="feedback feedback-error" role="alert">{erro}</p>}
        {!carregando && !erro && turmas.length === 0 && <p className="feedback">Nenhuma turma ativa nesta unidade.</p>}
        {!carregando && turmas.length > 0 && <ul className="unit-list">{turmas.map((turma) => <li className="unit-item" key={turma.id}><span><strong>{turma.nome}</strong><small>{turma.periodo || 'Periodo nao informado'} · {turma.sala || 'Sala nao informada'}</small></span><span className="active-label">{turma.situacao}</span></li>)}</ul>}
      </section>

      <section className="content-panel form-panel" aria-labelledby="nova-turma-title">
        <p className="eyebrow">Cadastro</p>
        <h2 id="nova-turma-title">Nova turma</h2>
        {cursoSelecionado && <p className="form-context">Curso selecionado: <strong>{cursoSelecionado.nome}</strong></p>}
        <form className="course-form" onSubmit={submeter}>
          <label>Nome<input value={nome} onChange={(event) => setNome(event.target.value)} /></label>
          <label>Periodo<input value={periodo} onChange={(event) => setPeriodo(event.target.value)} /></label>
          <label>Sala<input value={sala} onChange={(event) => setSala(event.target.value)} /></label>
          <label>Capacidade<input type="number" min="1" value={capacidade} onChange={(event) => setCapacidade(event.target.value)} /></label>
          <button className="action-button" type="submit" disabled={salvando || !cursoId}>{salvando ? 'Salvando...' : 'Cadastrar turma'}</button>
        </form>
      </section>
    </main>
  );
}
