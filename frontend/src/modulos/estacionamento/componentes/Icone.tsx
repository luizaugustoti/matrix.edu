import type { ReactNode } from 'react';

// Icones simples em SVG (traco), sempre decorativos: o texto ao lado
// e quem comunica o significado para leitores de tela.

export type NomeIcone =
  | 'chave'
  | 'check'
  | 'saida'
  | 'alerta'
  | 'cadeado'
  | 'ferramenta'
  | 'interrogacao'
  | 'relogio'
  | 'historico'
  | 'busca'
  | 'fechar'
  | 'entrada';

const desenhos: Record<NomeIcone, ReactNode> = {
  chave: (
    <>
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="M10.7 12.3 20 3" />
      <path d="m16 7 3 3" />
      <path d="m13.5 9.5 2 2" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  saida: (
    <>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </>
  ),
  entrada: (
    <>
      <path d="M17 7 7 17" />
      <path d="M16 17H7V8" />
    </>
  ),
  alerta: (
    <>
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 10v4" />
      <path d="M12 17h.01" />
    </>
  ),
  cadeado: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  ferramenta: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
    </>
  ),
  interrogacao: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6" />
      <path d="M12 17h.01" />
    </>
  ),
  relogio: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  historico: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v4h4" />
      <path d="M12 8v4l3 2" />
    </>
  ),
  busca: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  fechar: (
    <>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </>
  ),
};

export function Icone({ nome, tamanho = 16 }: { nome: NomeIcone; tamanho?: number }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {desenhos[nome]}
    </svg>
  );
}
