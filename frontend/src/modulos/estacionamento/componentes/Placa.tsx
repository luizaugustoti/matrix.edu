import { formatarPlaca } from '../utilitarios/estacionamento';
import estilos from './estacionamento.module.css';

// Placa no estilo Mercosul, para a guarita reconhecer de relance.
export function Placa({ placa, tamanho = 'normal' }: { placa: string; tamanho?: 'normal' | 'grande' }) {
  const texto = formatarPlaca(placa);
  return (
    <span className={estilos.placa} data-tamanho={tamanho} role="img" aria-label={`Placa ${texto}`}>
      <span className={estilos.placaFaixa} aria-hidden="true">
        BRASIL
      </span>
      <span className={estilos.placaTexto} aria-hidden="true">
        {texto}
      </span>
    </span>
  );
}
