import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contextos/AuthContext';

export function Login() {
  const { login, estaAutenticado, carregando } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (carregando) {
    return <main className="shell"><p className="feedback">Verificando sessao...</p></main>;
  }

  if (estaAutenticado) {
    return <Navigate to="/fundacao" replace />;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setEnviando(true);

    try {
      await login(email, senha);
      navigate('/fundacao', { replace: true });
    } catch (error: unknown) {
      const mensagem = error instanceof Error ? error.message : 'Nao foi possivel entrar no sistema.';
      setErro(mensagem);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="shell auth-shell">
      <section className="auth-card">
        <div>
          <p className="eyebrow">Acesso ao sistema</p>
          <h1>EFG Sistema</h1>
          <p className="page-description">
            Entre com seu email e senha para acessar os dados da instituicao.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="inline-field">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nome@instituicao.edu.br"
              required
            />
          </label>

          <label className="inline-field">
            Senha
            <input
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              placeholder="Sua senha"
              required
            />
          </label>

          {erro && (
            <p className="feedback feedback-error" role="alert">
              {erro}
            </p>
          )}

          <button className="action-button" type="submit" disabled={enviando}>
            {enviando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  );
}
