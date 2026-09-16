import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from '../contextos/AuthContext';
import { Administracao } from '../paginas/Administracao';
import { Componentes } from '../paginas/Componentes';
import { Cursos } from '../paginas/Cursos';
import { Fundacao } from '../paginas/Fundacao';
import { Horarios } from '../paginas/Horarios';
import { Login } from '../paginas/Login';
import { Turmas } from '../paginas/Turmas';

// Arquivo central de navegacao.
// Deve ser alterado quando novas paginas/modulos forem adicionados.

function PlaceholderPage({ titulo }: { titulo: string }) {
  return (
    <main className="shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Modulo</p>
          <h1>{titulo}</h1>
          <p className="page-description">
            Pagina inicial do modulo. Evolua este espaco com componentes e servicos.
          </p>
        </div>
      </header>
    </main>
  );
}

function ProtectedLayout() {
  const { estaAutenticado, usuario, logout } = useAuth();

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <header className="app-topbar">
        <div className="app-topbar__brand">
          <span className="eyebrow">EFG</span>
          <strong>Sistema</strong>
        </div>

        <nav className="app-topbar__nav" aria-label="Navegacao principal">
          <a href="/fundacao">Fundacao</a>
          <a href="/administracao">Administracao</a>
          <a href="/cursos">Cursos</a>
          <a href="/componentes">Componentes</a>
          <a href="/turmas">Turmas</a>
          <a href="/horarios">Horarios</a>
        </nav>

        <div className="app-topbar__user">
          <span>{usuario?.email ?? 'Usuario'}</span>
          <button type="button" className="action-button action-button--small" onClick={logout}>
            Sair
          </button>
        </div>
      </header>
      <Outlet />
    </>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Navigate to="/fundacao" replace />} />
        <Route path="/fundacao" element={<Fundacao />} />
        <Route path="/administracao" element={<Administracao />} />
        <Route path="/cursos" element={<Cursos />} />
        <Route path="/componentes" element={<Componentes />} />
        <Route path="/turmas" element={<Turmas />} />
        <Route path="/horarios" element={<Horarios />} />
        <Route path="/cantina" element={<PlaceholderPage titulo="Modulo Cantina" />} />
        <Route path="/laboratorios" element={<PlaceholderPage titulo="Modulo Laboratorios" />} />
        <Route path="/busca-ativa" element={<PlaceholderPage titulo="Modulo Busca Ativa" />} />
        <Route path="/match-professor-curso" element={<PlaceholderPage titulo="Modulo Match Professor x Curso" />} />
        <Route path="/conflito-matricula" element={<PlaceholderPage titulo="Modulo Conflito de Matricula" />} />
        <Route path="/estacionamento" element={<PlaceholderPage titulo="Modulo Estacionamento e Chaves" />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
