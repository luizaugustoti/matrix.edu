import { useEffect, useState } from 'react';
import axios from 'axios';
import { listarUnidades } from '../servicos/fundacao';
import type { Unidade } from '../tipos/fundacao';

function mensagemDeErro(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    return 'Entre no sistema para visualizar as unidades.';
  }

  if (error instanceof Error && error.message.includes('formato invalido')) {
    return 'A API retornou dados em um formato inesperado.';
  }

  return 'Nao foi possivel carregar as unidades. Tente novamente.';
}

export function Fundacao() {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    listarUnidades()
      .then((dados) => {
        if (ativo) {
          setUnidades(dados);
        }
      })
      .catch((error: unknown) => {
        if (ativo) {
          setErro(mensagemDeErro(error));
        }
      })
      .finally(() => {
        if (ativo) {
          setCarregando(false);
        }
      });

    return () => {
      ativo = false;
    };
  }, []);

  return (
    <main className="shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Fundacao</p>
          <h1>Cadastros centrais</h1>
          <p className="page-description">
            Unidades e pessoas compartilhadas pelos modulos do Sistema EFG.
          </p>
        </div>
        <span className="status-chip">API conectada</span>
      </header>

      <section className="content-panel" aria-labelledby="unidades-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Base institucional</p>
            <h2 id="unidades-title">Unidades</h2>
          </div>
          {!carregando && !erro && <span className="count-label">{unidades.length} cadastrada(s)</span>}
        </div>

        {carregando && <p className="feedback">Carregando unidades...</p>}
        {erro && <p className="feedback feedback-error" role="alert">{erro}</p>}
        {!carregando && !erro && unidades.length === 0 && (
          <p className="feedback">Nenhuma unidade ativa foi encontrada.</p>
        )}
        {!carregando && !erro && unidades.length > 0 && (
          <ul className="unit-list">
            {unidades.map((unidade) => (
              <li key={unidade.id} className="unit-item">
                <span>
                  <strong>{unidade.nome}</strong>
                  <small>Codigo {unidade.codigo}</small>
                </span>
                <span className="active-label">Ativa</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}