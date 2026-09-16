import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { loginComSupabase } from '../servicos/autenticacao';

export type Usuario = {
  id: string;
  email: string | null;
  nome?: string;
};

type AuthContextValue = {
  usuario: Usuario | null;
  token: string | null;
  carregando: boolean;
  estaAutenticado: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const STORAGE_TOKEN_KEY = 'efg_access_token';
const STORAGE_USER_KEY = 'efg_usuario';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => window.localStorage.getItem(STORAGE_TOKEN_KEY));
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const valor = window.localStorage.getItem(STORAGE_USER_KEY);
    return valor ? (JSON.parse(valor) as Usuario) : null;
  });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (token) {
      window.localStorage.setItem(STORAGE_TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(STORAGE_TOKEN_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (usuario) {
      window.localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(usuario));
    } else {
      window.localStorage.removeItem(STORAGE_USER_KEY);
    }
  }, [usuario]);

  useEffect(() => {
    setCarregando(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const sessao = await loginComSupabase(email, password);

    const proximoUsuario: Usuario = {
      id: sessao.user.id,
      email: sessao.user.email,
      nome: sessao.user.user_metadata?.nome as string | undefined,
    };

    setToken(sessao.access_token);
    setUsuario(proximoUsuario);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUsuario(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      token,
      carregando,
      estaAutenticado: Boolean(token && usuario),
      login,
      logout,
    }),
    [carregando, login, token, usuario],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }

  return contexto;
}
