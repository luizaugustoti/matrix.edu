export type SessaoAutenticacao = {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string | null;
    user_metadata?: Record<string, unknown>;
  };
};

export async function loginComSupabase(email: string, password: string): Promise<SessaoAutenticacao> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error('Supabase ainda nao foi configurado no frontend.');
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const dados = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (!response.ok) {
    const mensagem =
      typeof dados.error_description === 'string'
        ? dados.error_description
        : typeof dados.message === 'string'
          ? dados.message
          : 'Credenciais invalidas ou usuario nao encontrado.';

    throw new Error(mensagem);
  }

  return dados as SessaoAutenticacao;
}
