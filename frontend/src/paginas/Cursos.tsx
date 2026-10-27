import { FormEvent, useEffect, useState } from 'react';
import axios from 'axios';
import { listarUnidades } from '../servicos/fundacao';
import { criarCurso, listarCursos } from '../servicos/pedagogico';
import type { Unidade } from '../tipos/fundacao';
import type { Curso } from '../tipos/pedagogico';

function mensagemDeErro(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    return 'Entre no sistema para consultar ou cadastrar cursos.';
  }

  return 'Nao foi possivel concluir a operacao. Tente novamente.';
}

export function Cursos() {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [unidadeId, setUnidadeId] = useState('');
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [tipo, setTipo] = useState('');
  const [cargaHoraria, setCargaHoraria] = useState('');
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
      return;
    }

    setCarregando(true);
    listarCursos(unidadeId)
      .then(setCursos)
      .catch((error: unknown) => setErro(mensagemDeErro(error)))
      .finally(() => setCarregando(false));
  }, [unidadeId]);

  async function submeter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!unidadeId || !nome.trim() || !codigo.trim() || !tipo.trim()) {
      setErro('Preencha unidade, nome, codigo e tipo do curso.');
      return;
    }

    setSalvando(true);
    setErro(null);
    try {
      const curso = await criarCurso({
        unidade_id: unidadeId,
        nome: nome.trim(),
        codigo: codigo.trim(),
        tipo: tipo.trim(),
        ...(cargaHoraria ? { carga_horaria: Number(cargaHoraria) } : {}),
      });
      setCursos((atuais) => [...atuais, curso].sort((a, b) => a.nome.localeCompare(b.nome)));
      setNome('');
      setCodigo('');
      setTipo('');
      setCargaHoraria('');
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
          <h1>Cursos</h1>
          <p className="page-description">Cadastre e consulte os cursos por unidade.</p>
        </div>
        <span className="status-chip">Base pedagogica</span>
      </header>

      <section className="content-panel" aria-labelledby="cursos-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Catalogo institucional</p>
            <h2 id="cursos-title">Cursos ativos</h2>
          </div>
          <label className="inline-field">
            <span>Unidade</span>
            <select value={unidadeId} onChange={(event) => setUnidadeId(event.target.value)} disabled={!unidades.length}>
              <option value="">Selecione</option>
              {unidades.map((unidade) => <option key={unidade.id} value={unidade.id}>{unidade.nome}</option>)}
            </select>
          </label>
        </div>

        {carregando && <p className="feedback">Carregando dados...</p>}
        {erro && <p className="feedback feedback-error" role="alert">{erro}</p>}
        {!carregando && !erro && cursos.length === 0 && <p className="feedback">Nenhum curso ativo nesta unidade.</p>}
        {!carregando && cursos.length > 0 && (
          <ul className="unit-list">
            {cursos.map((curso) => (
              <li className="unit-item" key={curso.id}>
                <span><strong>{curso.nome}</strong><small>{curso.codigo} · {curso.tipo}</small></span>
                <span className="active-label">{curso.carga_horaria ? `${curso.carga_horaria}h` : 'Sem carga'}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="content-panel form-panel" aria-labelledby="novo-curso-title">
        <p className="eyebrow">Cadastro</p>
        <h2 id="novo-curso-title">Novo curso</h2>
        <form className="course-form" onSubmit={submeter}>
          <label>Nome<input value={nome} onChange={(event) => setNome(event.target.value)} /></label>
          <label>Codigo<input value={codigo} onChange={(event) => setCodigo(event.target.value)} /></label>
          <label>Tipo<input value={tipo} onChange={(event) => setTipo(event.target.value)} /></label>
          <label>Carga horaria<input type="number" min="1" value={cargaHoraria} onChange={(event) => setCargaHoraria(event.target.value)} /></label>
          <button className="action-button" type="submit" disabled={salvando || !unidadeId}>{salvando ? 'Salvando...' : 'Cadastrar curso'}</button>
        </form>
      </section>
    </main>
  );
}
