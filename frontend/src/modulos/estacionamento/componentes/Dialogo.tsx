import { useEffect, useRef, type ReactNode } from 'react';
import { Icone } from './Icone';
import estilos from './dialogo.module.css';

type Props = {
  titulo: string;
  subtitulo?: string;
  aoFechar: () => void;
  children: ReactNode;
};

// Janela modal baseada no <dialog> nativo: prende o foco dentro dela,
// fecha com Esc e devolve o foco para o botao que a abriu.
export function Dialogo({ titulo, subtitulo, aoFechar, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const tituloId = useRef(`dialogo-${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => {
    const dialogo = ref.current;
    if (dialogo && !dialogo.open) dialogo.showModal();
    return () => dialogo?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      className={estilos.dialogo}
      aria-labelledby={tituloId}
      onClose={() => {
        // Ignora o evento se a janela ja foi reaberta (acontece no StrictMode).
        if (!ref.current?.open) aoFechar();
      }}
      onClick={(event) => {
        // Clique fora da caixa (no fundo escurecido) fecha a janela.
        if (event.target === ref.current) aoFechar();
      }}
    >
      <div className={estilos.caixa}>
        <header className={estilos.cabecalho}>
          <div>
            <h2 id={tituloId} className={estilos.titulo}>
              {titulo}
            </h2>
            {subtitulo && <p className={estilos.subtitulo}>{subtitulo}</p>}
          </div>
          <button type="button" className={estilos.fechar} onClick={aoFechar} aria-label="Fechar janela">
            <Icone nome="fechar" tamanho={18} />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}
