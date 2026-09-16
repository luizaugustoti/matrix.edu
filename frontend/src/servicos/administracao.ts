import { api } from './api';
import type { StatusSupabase } from '../tipos/administracao';

export async function verificarSupabase(): Promise<StatusSupabase> {
  const response = await api.get<StatusSupabase>('/health/supabase');
  return response.data;
}
