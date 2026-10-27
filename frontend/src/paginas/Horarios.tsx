import { FormEvent, useEffect, useState } from 'react';
import axios from 'axios';
import { listarUnidades } from '../servicos/fundacao';
import { criarHorario, listarCursos, listarHorarios, listarTurmas } from '../servicos/pedagogico';
import type { Unidade } from '../tipos/fundacao';
import type { Curso } from '../tipos/pedagogico';
import type { Turma } from '../tipos/turmas';
import type { Horario } from '../tipos/horarios';

const diasDaSemana = ['Domingo', 'Segunda-feira', 'Terca-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sabado'];

function mensagemDeErro(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    return 'Entre no sistema para consultar ou cadastrar horarios.';
  }

  return 'Nao foi possivel concluir a operacao. Tente novamente.';
}

export function Horarios() {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [unidadeId, setUnidadeId] = useState('');
  const [cursoId, setCursoId] = useState('');
  const [turmaId, setTurmaId] = useState('');
  const [diaSemana, setDiaSemana] = useState('1');
  const [horaInicio, setHoraInicio] = useState('18:00');
  const [horaFim, setHoraFim] = useState('20:00');
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
      setTurmas([]);
      setCursoId('');
      setTurmaId('');
      return;
    }

    setCarregando(true);
    Promise.all([listarCursos(unidadeId), listarTurmas(unidadeId)])
      .then(([cursosDaUnidade, turmasDaUnidade]) => {
        setCursos(cursosDaUnidade);
        setTurmas(turmasDaUnidade);
        setCursoId(cursosDaUnidade[0]?.id ?? '');
      })
      .catch((error: unknown) => setErro(mensagemDeErro(error)))
      .finally(() => setCarregando(false));
  }, [unidadeId]);

  useEffect(() => {
    const turmasDoCurso = turmas.filter((turma) => turma.curso_id === cursoId);
    setTurmaId(turmasDoCurso[0]?.id ?? '');
  }, [cursoId, turmas]);

  useEffect(() => {
    if (!turmaId) {
      setHorarios([]);
      return;
    }

    setCarregando(true);
    listarHorarios(turmaId)
      .then(setHorarios)
      .catch((error: unknown) => setErro(mensagemDeErro(error)))
      .finally(() => setCarregando(false));
  }, [turmaId]);

  async function submeter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!turmaId || !horaInicio || !horaFim) {
      setErro('Preencha turma, hora inicial e hora final.');
      return;
    }

    setSalvando(true);
    setErro(null);
    try {
      const horario = await criarHorario({
        turma_id: turmaId,
        dia_semana: Number(diaSemana),
        hora_inicio: horaInicio,
        hora_fim: horaFim,
      });
      setHorarios((atuais) => [...atuais, horario].sort((a, b) => a.dia_semana - b.dia_semana || a.hora_inicio.localeCompare(b.hora_inicio)));
    } catch (error: unknown) {
      setErro(mensagemDeErro(error));
    } finally {
      setSalvando(false);
    }
  }

  const turmasDoCurso = turmas.filter((turma) => turma.curso_id === cursoId);

  return (
    <main className="shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Coordenacao pedagogica</p>
          <h1>Horarios</h1>
          <p className="page-description">Organize os encontros semanais de cada turma.</p>
        </div>
        <span className="status-chip">Agenda pedagogica</span>
      </header>

      <section className="content-panel" aria-labelledby="horarios-title">
        <div className="section-heading">
          <div><p className="eyebrow">Grade semanal</p><h2 id="horarios-title">Horarios cadastrados</h2></div>
          <div className="filter-row">
            <label className="inline-field"><span>Unidade</span><select value={unidadeId} onChange={(event) => setUnidadeId(event.target.value)}><option value="">Selecione</option>{unidades.map((unidade) => <option key={unidade.id} value={unidade.id}>{unidade.nome}</option>)}</select></label>
            <label className="inline-field"><span>Curso</span><select value={cursoId} onChange={(event) => setCursoId(event.target.value)} disabled={!cursos.length}><option value="">Selecione</option>{cursos.map((curso) => <option key={curso.id} value={curso.id}>{curso.nome}</option>)}</select></label>
            <label className="inline-field"><span>Turma</span><select value={turmaId} onChange={(event) => setTurmaId(event.target.value)} disabled={!turmasDoCurso.length}><option value="">Selecione</option>{turmasDoCurso.map((turma) => <option key={turma.id} value={turma.id}>{turma.nome}</option>)}</select></label>
          </div>
        </div>

        {carregando && <p className="feedback">Carregando dados...</p>}
        {erro && <p className="feedback feedback-error" role="alert">{erro}</p>}
        {!carregando && !erro && horarios.length === 0 && <p className="feedback">Nenhum horario cadastrado para esta turma.</p>}
        {!carregando && horarios.length > 0 && <ul className="unit-list">{horarios.map((horario) => <li className="unit-item" key={horario.id}><span><strong>{diasDaSemana[horario.dia_semana]}</strong><small>{horario.hora_inicio} ate {horario.hora_fim}</small></span><span className="active-label">Semanal</span></li>)}</ul>}
      </section>

      <section className="content-panel form-panel" aria-labelledby="novo-horario-title">
        <p className="eyebrow">Cadastro</p><h2 id="novo-horario-title">Novo horario</h2>
        <form className="course-form" onSubmit={submeter}>
          <label>Dia<select value={diaSemana} onChange={(event) => setDiaSemana(event.target.value)}>{diasDaSemana.map((dia, index) => <option key={dia} value={index}>{dia}</option>)}</select></label>
          <label>Inicio<input type="time" value={horaInicio} onChange={(event) => setHoraInicio(event.target.value)} /></label>
          <label>Fim<input type="time" value={horaFim} onChange={(event) => setHoraFim(event.target.value)} /></label>
          <button className="action-button" type="submit" disabled={salvando || !turmaId}>{salvando ? 'Salvando...' : 'Cadastrar horario'}</button>
        </form>
      </section>
    </main>
  );
}
