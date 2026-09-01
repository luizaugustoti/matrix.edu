import { Navigate, Route, Routes } from 'react-router-dom';

// Arquivo central de navegacao.
// Deve ser alterado quando novas paginas/modulos forem adicionados.

function PlaceholderPage({ titulo }: { titulo: string }) {
  return (
    <main style={{ padding: 24 }}>
      <h1>{titulo}</h1>
      <p>Pagina inicial do modulo. Evolua este espaco com componentes e servicos.</p>
    </main>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/cantina" replace />} />
      <Route path="/cantina" element={<PlaceholderPage titulo="Modulo Cantina" />} />
      <Route path="/laboratorios" element={<PlaceholderPage titulo="Modulo Laboratorios" />} />
      <Route path="/busca-ativa" element={<PlaceholderPage titulo="Modulo Busca Ativa" />} />
      <Route path="/match-professor-curso" element={<PlaceholderPage titulo="Modulo Match Professor x Curso" />} />
      <Route path="/conflito-matricula" element={<PlaceholderPage titulo="Modulo Conflito de Matricula" />} />
      <Route path="/estacionamento" element={<PlaceholderPage titulo="Modulo Estacionamento e Chaves" />} />
    </Routes>
  );
}
