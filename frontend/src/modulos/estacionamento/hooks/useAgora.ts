import { useEffect, useState } from 'react';

// Devolve o horario atual e atualiza a cada intervalo.
// O painel usa isso para uma chave virar "atrasada" sozinha,
// sem precisar recarregar a pagina.
export function useAgora(intervaloMs = 30000): number {
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setAgora(Date.now()), intervaloMs);
    return () => window.clearInterval(id);
  }, [intervaloMs]);

  return agora;
}
