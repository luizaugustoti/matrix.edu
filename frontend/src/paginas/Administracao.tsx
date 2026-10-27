import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { verificarSupabase } from '../servicos/administracao';
import type { StatusSupabase } from '../tipos/administracao';

function mensagemDeErro(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.status === 503) {
    return 'A API esta funcionando, mas o Supabase ainda nao esta configurado.';
  }

  return 'Nao foi possivel testar a conexao com a API.';
}

export function Administracao() {
  const [status, setStatus] = useState<StatusSupabase | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const testarConexao = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      setStatus(await verificarSupabase());
    } catch (error: unknown) {
      setErro(mensagemDeErro(error));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void testarConexao();
  }, [testarConexao]);

  return (
    <main className="shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Administracao</p>
          <h1>Conexoes do sistema</h1>
          <p className="page-description">
            Consulte e teste a infraestrutura configurada para o ambiente atual.
          </p>
        </div>
        <span className="status-chip">Painel tecnico</span>
      </header>

      <section className="content-panel" aria-labelledby="supabase-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Persistencia e autenticacao</p>
            <h2 id="supabase-title">Supabase</h2>
          </div>
          {status && (
            <span className={status.configured ? 'status-chip' : 'status-chip status-warning'}>
              {status.configured ? 'Configurado' : 'Pendente'}
            </span>
          )}
        </div>

        {carregando && <p className="feedback">Testando conexao...</p>}
        {erro && <p className="feedback feedback-error" role="alert">{erro}</p>}
        {!carregando && !erro && status && (
          <dl className="connection-grid">
            <div>
              <dt>Provedor</dt>
              <dd>{status.provider}</dd>
            </div>
            <div>
              <dt>Banco</dt>
              <dd>{status.database}</dd>
            </div>
            <div>
              <dt>Estado</dt>
              <dd>{status.configured ? 'Credenciais detectadas' : 'Credenciais ausentes'}</dd>
            </div>
          </dl>
        )}

        <div className="admin-note">
          <strong>Como substituir a conexao</strong>
          <p>
            Atualize as variaveis do arquivo local <code>backend/.env</code> e reinicie a API.
            Chaves nunca sao exibidas ou salvas pelo navegador.
          </p>
        </div>

        <button className="action-button" type="button" onClick={() => void testarConexao()} disabled={carregando}>
          {carregando ? 'Testando...' : 'Testar novamente'}
        </button>
      </section>
    </main>
  );
}
