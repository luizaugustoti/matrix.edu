import { NavLink } from 'react-router-dom';
import { Icone, type NomeIcone } from './Icone';
import estilos from './estacionamento.module.css';

// Abas das telas da guarita. Usa NavLink (navegacao sem recarregar a pagina),
// e o link da tela atual recebe aria-current="page" automaticamente.
const abas: Array<{ para: string; rotulo: string; icone: NomeIcone }> = [
  { para: '/guarita/chaves', rotulo: 'Chaves', icone: 'chave' },
  { para: '/guarita/estacionamento', rotulo: 'Estacionamento', icone: 'carro' },
  { para: '/guarita/autorizacoes', rotulo: 'Autorizações', icone: 'documento' },
];

export function AbasGuarita() {
  return (
    <nav className={estilos.abas} aria-label="Telas da guarita">
      {abas.map((aba) => (
        <NavLink key={aba.para} to={aba.para} className={estilos.aba}>
          <Icone nome={aba.icone} />
          {aba.rotulo}
        </NavLink>
      ))}
    </nav>
  );
}
