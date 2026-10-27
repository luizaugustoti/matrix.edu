import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../contextos/AuthContext';
import { listarAutorizados, mensagemDeErroGuarita, registrarRetirada } from '../servicos/chaves';
import type { Chave, PessoaAutorizada } from '../tipos/chaves';
import {
  horarioDeHoje,
  resolverZod,
  retiradaSchema,
  type RetiradaFormulario,
} from '../validacoes/chaves';
import { Dialogo } from './Dialogo';
import { Icone } from './Icone';
import estilosBotao from './chaves.module.css';
import estilos from './dialogo.module.css';

// Fim dos horarios das aulas noturnas (mapa de salas e laboratorios).
const fimDosHorarios = [
  { rotulo: 'Fim do 1º horário', horario: '20:20' },
  { rotulo: 'Fim do 2º horário', horario: '22:00' },
];

function horarioPadrao(): string {
  const proximo = fimDosHorarios.find((item) => horarioDeHoje(item.horario).getTime() > Date.now());
  if (proximo) return proximo.horario;

  // Fora do periodo noturno: sugere daqui a 1 hora, arredondado para 10 min.
  const data = new Date(Date.now() + 60 * 60 * 1000);
  data.setMinutes(Math.ceil(data.getMinutes() / 10) * 10, 0, 0);
  if (data.getDate() !== new Date().getDate()) return '23:50';
  return data.toTimeString().slice(0, 5);
}

type Props = {
  chave: Chave;
  aoFechar: () => void;
  aoConcluir: (chave: Chave, pessoa: PessoaAutorizada) => void;
};

export function DialogoRetirada({ chave, aoFechar, aoConcluir }: Props) {
  const { usuario } = useAuth();
  const [autorizados, setAutorizados] = useState<PessoaAutorizada[] | null>(null);
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RetiradaFormulario>({
    resolver: resolverZod(retiradaSchema),
    defaultValues: { pessoa_id: '', devolucao_prevista: horarioPadrao(), observacao: '' },
  });

  useEffect(() => {
    listarAutorizados(chave.id)
      .then(setAutorizados)
      .catch((error: unknown) => {
        setAutorizados([]);
        setErroGeral(mensagemDeErroGuarita(error));
      });
  }, [chave.id]);

  const horarioEscolhido = watch('devolucao_prevista');
  const atalhosValidos = useMemo(
    () => fimDosHorarios.filter((item) => horarioDeHoje(item.horario).getTime() > Date.now()),
    [],
  );

  async function enviar(dados: RetiradaFormulario) {
    setErroGeral(null);
    try {
      const atualizada = await registrarRetirada({
        chave_id: chave.id,
        pessoa_id: dados.pessoa_id,
        devolucao_prevista: horarioDeHoje(dados.devolucao_prevista).toISOString(),
        observacao: dados.observacao,
      });
      const pessoa = autorizados?.find((item) => item.id === dados.pessoa_id);
      if (pessoa) aoConcluir(atualizada, pessoa);
    } catch (error: unknown) {
      setErroGeral(mensagemDeErroGuarita(error));
    }
  }

  return (
    <Dialogo titulo={`Retirada da chave ${chave.codigo}`} subtitulo={chave.local.nome} aoFechar={aoFechar}>
      <form className={estilos.formulario} onSubmit={handleSubmit(enviar)} noValidate>
        {autorizados === null && <p className={estilos.dica}>Carregando pessoas autorizadas...</p>}

        {autorizados !== null && autorizados.length === 0 && !erroGeral && (
          <p className={estilos.aviso}>
            Nenhuma pessoa está autorizada a retirar esta chave. Peça à coordenação para cadastrar a
            autorização antes da retirada.
          </p>
        )}

        {autorizados !== null && autorizados.length > 0 && (
          <>
            <label className={estilos.campo}>
              Quem está retirando
              <select
                {...register('pessoa_id')}
                aria-invalid={errors.pessoa_id ? 'true' : 'false'}
                aria-describedby="retirada-pessoa-ajuda retirada-pessoa-erro"
                autoFocus
              >
                <option value="">Selecione uma pessoa autorizada</option>
                {autorizados.map((pessoa) => (
                  <option key={pessoa.id} value={pessoa.id}>
                    {pessoa.nome_completo} ({pessoa.papel})
                  </option>
                ))}
              </select>
              <span id="retirada-pessoa-ajuda" className={estilos.dica}>
                Só aparecem pessoas com autorização para esta chave.
              </span>
              {errors.pessoa_id && (
                <span id="retirada-pessoa-erro" className={estilos.erroCampo} role="alert">
                  <Icone nome="alerta" tamanho={14} />
                  {errors.pessoa_id.message}
                </span>
              )}
            </label>

            <div className={estilos.campo}>
              <label htmlFor="retirada-horario">Devolução prevista</label>
              {atalhosValidos.length > 0 && (
                <div className={estilos.atalhos} role="group" aria-label="Horários sugeridos">
                  {atalhosValidos.map((item) => (
                    <button
                      key={item.horario}
                      type="button"
                      className={estilos.atalho}
                      aria-pressed={horarioEscolhido === item.horario}
                      onClick={() => setValue('devolucao_prevista', item.horario, { shouldValidate: true })}
                    >
                      {item.rotulo} · {item.horario}
                    </button>
                  ))}
                </div>
              )}
              <input
                id="retirada-horario"
                type="time"
                {...register('devolucao_prevista')}
                aria-invalid={errors.devolucao_prevista ? 'true' : 'false'}
                aria-describedby="retirada-horario-erro"
              />
              {errors.devolucao_prevista && (
                <span id="retirada-horario-erro" className={estilos.erroCampo} role="alert">
                  <Icone nome="alerta" tamanho={14} />
                  {errors.devolucao_prevista.message}
                </span>
              )}
            </div>

            <label className={estilos.campo}>
              Observação (opcional)
              <textarea
                {...register('observacao')}
                maxLength={200}
                placeholder="Ex.: retirou também o controle do projetor"
                aria-invalid={errors.observacao ? 'true' : 'false'}
              />
              {errors.observacao && (
                <span className={estilos.erroCampo} role="alert">
                  {errors.observacao.message}
                </span>
              )}
            </label>
          </>
        )}

        {erroGeral && (
          <p className={estilos.erroGeral} role="alert">
            {erroGeral}
          </p>
        )}

        <div className={estilos.rodape}>
          <span className={estilos.operador}>Registrado por {usuario?.email ?? 'usuário atual'}</span>
          <div className={estilos.botoes}>
            <button type="button" className={estilosBotao.botaoSecundario} onClick={aoFechar}>
              Cancelar
            </button>
            <button
              type="submit"
              className={estilosBotao.botao}
              disabled={isSubmitting || !autorizados || autorizados.length === 0}
            >
              <Icone nome="saida" />
              {isSubmitting ? 'Registrando...' : 'Registrar retirada'}
            </button>
          </div>
        </div>
      </form>
    </Dialogo>
  );
}
