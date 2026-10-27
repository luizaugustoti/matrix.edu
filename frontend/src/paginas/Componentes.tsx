import { FormEvent, useEffect, useState } from 'react';
import axios from 'axios';
import { listarUnidades } from '../servicos/fundacao';
import { criarComponente, listarComponentes, listarCursos } from '../servicos/pedagogico';
import type { Unidade } from '../tipos/fundacao';
import type { ComponenteCurricular } from '../tipos/componentes';
import type { Curso } from '../tipos/pedagogico';

function mensagemDeErro(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    return 'Entre no sistema para consultar ou cadastrar componentes.';
  }

  return 'Nao foi possivel concluir a operacao. Tente novamente.';
}

export function Componentes() {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [componentes, setComponentes] = useState<ComponenteCurricular[]>([]);
  const [unidadeId, setUnidadeId] = useState('');
  const [cursoId, setCursoId] = useState('');
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [cargaHoraria, setCargaHoraria] = useState('');
  const [competencias, setCompetencias] = useState('');
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
      return;
    }

    setCarregando(true);
    listarCursos(unidadeId)
      .then((dados) => {
        setCursos(dados);
        setCursoId(dados[0]?.id ?? '');
      })
      .catch((error: unknown) => setErro(mensagemDeErro(error)))
      .finally(() => setCarregando(false));
  }, [unidadeId]);

  useEffect(() => {
    if (!cursoId) {
      setComponentes([]);
      return;
    }

    setCarregando(true);
    listarComponentes(cursoId)
      .then(setComponentes)
      .catch((error: unknown) => setErro(mensagemDeErro(error)))
      .finally(() => setCarregando(false));
  }, [cursoId]);

  async function submeter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cursoId || !nome.trim() || !codigo.trim()) {
      setErro('Preencha curso, nome e codigo do componente.');
      return;
    }

    setSalvando(true);
    setErro(null);
    try {
      const componente = await criarComponente({
        curso_id: cursoId,
        nome: nome.trim(),
        codigo: codigo.trim(),
        competencias: competencias.split(',').map((item) => item.trim()).filter(Boolean),
        ...(cargaHoraria ? { carga_horaria: Number(cargaHoraria) } : {}),
      });
      setComponentes((atuais) => [...atuais, componente].sort((a, b) => a.nome.localeCompare(b.nome)));
      setNome('');
      setCodigo('');
      setCargaHoraria('');
      setCompetencias('');
    } catch (error: unknown) {
      setErro(mensagemDeErro(error));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Coordenacao pedagogica</p>
          <h1>Componentes curriculares</h1>
          <p className="page-description">Organize disciplinas, carga horaria e competencias de cada curso.</p>
        </div>
        <span className="status-chip">Base pedagogica</span>
      </header>

      <section className="content-panel" aria-labelledby="componentes-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Catalogo curricular</p>
            <h2 id="componentes-title">Componentes ativos</h2>
          </div>
          <div className="filter-row">
            <label className="inline-field"><span>Unidade</span><select value={unidadeId} onChange={(event) => setUnidadeId(event.target.value)}><option value="">Selecione</option>{unidades.map((unidade) => <option key={unidade.id} value={unidade.id}>{unidade.nome}</option>)}</select></label>
            <label className="inline-field"><span>Curso</span><select value={cursoId} onChange={(event) => setCursoId(event.target.value)} disabled={!cursos.length}><option value="">Selecione</option>{cursos.map((curso) => <option key={curso.id} value={curso.id}>{curso.nome}</option>)}</select></label>
          </div>
        </div>

        {carregando && <p className="feedback">Carregando dados...</p>}
        {erro && <p className="feedback feedback-error" role="alert">{erro}</p>}
        {!carregando && !erro && componentes.length === 0 && <p className="feedback">Nenhum componente ativo neste curso.</p>}
        {!carregando && componentes.length > 0 && <ul className="unit-list">{componentes.map((componente) => <li className="unit-item" key={componente.id}><span><strong>{componente.nome}</strong><small>{componente.codigo} · {componente.competencias.join(', ') || 'Sem competencias'}</small></span><span className="active-label">{componente.carga_horaria ? `${componente.carga_horaria}h` : 'Sem carga'}</span></li>)}</ul>}
      </section>

      <section className="content-panel form-panel" aria-labelledby="novo-componente-title">
        <p className="eyebrow">Cadastro</p>
        <h2 id="novo-componente-title">Novo componente</h2>
        <form className="course-form" onSubmit={submeter}>
          <label>Nome<input value={nome} onChange={(event) => setNome(event.target.value)} /></label>
          <label>Codigo<input value={codigo} onChange={(event) => setCodigo(event.target.value)} /></label>
          <label>Carga horaria<input type="number" min="1" value={cargaHoraria} onChange={(event) => setCargaHoraria(event.target.value)} /></label>
          <label>Competencias<input placeholder="Separe por virgulas" value={competencias} onChange={(event) => setCompetencias(event.target.value)} /></label>
          <button className="action-button" type="submit" disabled={salvando || !cursoId}>{salvando ? 'Salvando...' : 'Cadastrar componente'}</button>
        </form>
      </section>
    </main>
  );
}
