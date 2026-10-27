// Dados simulados do estacionamento (portaria e autorizacoes).
// Usados enquanto o back-end nao expoe as rotas. Nomes e placas sao ficticios.
//
// As regras abaixo imitam o que o back-end deve validar:
// - so entra veiculo com autorizacao aprovada e dentro da validade;
// - o mesmo veiculo nao entra duas vezes sem registrar a saida;
// - a saida e sempre permitida para quem esta no patio;
// - uma solicitacao precisa de CNH, documento do veiculo e termo assinado;
// - so solicitacoes pendentes ou em analise podem ser aprovadas ou rejeitadas;
// - a aprovacao vale 6 meses (renovacao conta a partir do fim da anterior).

import type {
  AutorizacaoEstacionamento,
  ConsultaPlaca,
  DocumentoAutorizacao,
  MovimentacaoVeiculo,
  Solicitante,
  SolicitacaoAutorizacao,
  TipoDocumento,
  Veiculo,
} from '../tipos/estacionamento';
import {
  MESES_VALIDADE,
  adicionarMeses,
  formatarData,
  normalizarPlaca,
  placaValida,
  situacaoEfetiva,
} from '../utilitarios/estacionamento';
import { formatarHora } from '../utilitarios/situacao';
import { ErroGuarita } from './chaves';

const LATENCIA_MS = 300;
const MINUTO = 60 * 1000;
const DIA = 24 * 60 * MINUTO;

function esperar(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCIA_MS));
}

function copiar<T>(valor: T): T {
  return JSON.parse(JSON.stringify(valor)) as T;
}

function operadorAtual(): string {
  try {
    const usuario = window.localStorage.getItem('efg_usuario');
    const email = usuario ? (JSON.parse(usuario) as { email?: string }).email : null;
    return email ?? 'guarita@efg.local';
  } catch {
    return 'guarita@efg.local';
  }
}

let proximoId = 100;
function novoId(prefixo: string): string {
  proximoId += 1;
  return `${prefixo}-${proximoId}`;
}

const autorizacoes: AutorizacaoEstacionamento[] = [];
const movimentacoes: MovimentacaoVeiculo[] = [];

function documentosDeExemplo(placa: string, enviadoHaDias: number): DocumentoAutorizacao[] {
  const enviado_em = new Date(Date.now() - enviadoHaDias * DIA).toISOString();
  const tipos: Array<[TipoDocumento, string, number]> = [
    ['cnh', `cnh-${placa.toLowerCase()}.jpg`, 412_000],
    ['crlv', `crlv-${placa.toLowerCase()}.pdf`, 238_000],
    ['termo', `termo-assinado-${placa.toLowerCase()}.pdf`, 186_000],
  ];
  return tipos.map(([tipo, nome_arquivo, tamanho_bytes]) => ({
    id: novoId('d'),
    tipo,
    nome_arquivo,
    tamanho_bytes,
    url: null,
    enviado_em,
  }));
}

type Exemplo = {
  nome: string;
  vinculo: Solicitante['vinculo'];
  telefone: string | null;
  veiculo: Veiculo;
  situacao: AutorizacaoEstacionamento['situacao'];
  solicitadaHaDias: number;
  // Para aprovadas: quantos dias faltam para vencer (negativo = vencida).
  venceEmDias?: number;
  motivo?: string;
};

const exemplos: Exemplo[] = [
  { nome: 'Ana Beatriz Rocha', vinculo: 'Professor(a)', telefone: '(61) 99812-4410', veiculo: { placa: 'RTA2B45', modelo: 'Chevrolet Onix', cor: 'Prata', tipo: 'carro' }, situacao: 'aprovada', solicitadaHaDias: 70, venceEmDias: 120 },
  { nome: 'Carlos Eduardo Lima', vinculo: 'Professor(a)', telefone: '(61) 99654-2201', veiculo: { placa: 'QWE7J12', modelo: 'Hyundai HB20', cor: 'Branco', tipo: 'carro' }, situacao: 'aprovada', solicitadaHaDias: 175, venceEmDias: 12 },
  { nome: 'Fernanda Souza', vinculo: 'Coordenação', telefone: null, veiculo: { placa: 'PBX4C88', modelo: 'Jeep Compass', cor: 'Preto', tipo: 'carro' }, situacao: 'aprovada', solicitadaHaDias: 15, venceEmDias: 170 },
  { nome: 'Marcos Vinícius Alves', vinculo: 'Professor(a)', telefone: '(61) 98877-3012', veiculo: { placa: 'OJK3F21', modelo: 'Honda CG 160', cor: 'Vermelha', tipo: 'moto' }, situacao: 'aprovada', solicitadaHaDias: 190, venceEmDias: -5 },
  { nome: 'João Pedro Martins', vinculo: 'Funcionário(a)', telefone: '(61) 99120-7765', veiculo: { placa: 'NGV8H34', modelo: 'Fiat Strada', cor: 'Branca', tipo: 'carro' }, situacao: 'aprovada', solicitadaHaDias: 120, venceEmDias: 60 },
  { nome: 'Patrícia Mendes', vinculo: 'Professor(a)', telefone: '(61) 99231-0098', veiculo: { placa: 'XYZ1Z23', modelo: 'Fiat Argo', cor: 'Vermelho', tipo: 'carro' }, situacao: 'aprovada', solicitadaHaDias: 25, venceEmDias: 160 },
  { nome: 'Juliana Prado', vinculo: 'Funcionário(a)', telefone: '(61) 99300-4521', veiculo: { placa: 'SDF1A90', modelo: 'Renault Kwid', cor: 'Laranja', tipo: 'carro' }, situacao: 'pendente', solicitadaHaDias: 2 },
  { nome: 'Rafael Ramos', vinculo: 'Professor(a)', telefone: '(61) 98455-6610', veiculo: { placa: 'JKL5367', modelo: 'Volkswagen Gol', cor: 'Cinza', tipo: 'carro' }, situacao: 'em_analise', solicitadaHaDias: 4 },
  { nome: 'Larissa Duarte', vinculo: 'Coordenação', telefone: null, veiculo: { placa: 'MNO9P12', modelo: 'Toyota Corolla', cor: 'Azul', tipo: 'carro' }, situacao: 'rejeitada', solicitadaHaDias: 9, motivo: 'Foto do CRLV ilegível. Envie uma nova foto do documento do veículo.' },
  { nome: 'Ricardo Nogueira', vinculo: 'Funcionário(a)', telefone: '(61) 99781-1200', veiculo: { placa: 'TUV2W34', modelo: 'Honda Biz', cor: 'Preta', tipo: 'moto' }, situacao: 'cancelada', solicitadaHaDias: 60, motivo: 'Cancelada a pedido do servidor (troca de veículo).' },
];

function carregarDadosIniciais() {
  const agora = Date.now();

  exemplos.forEach((exemplo, indice) => {
    const solicitada = agora - exemplo.solicitadaHaDias * DIA;
    const analisada =
      exemplo.situacao === 'pendente' || exemplo.situacao === 'em_analise'
        ? null
        : new Date(solicitada + DIA).toISOString();
    const validaAte =
      exemplo.venceEmDias !== undefined ? new Date(agora + exemplo.venceEmDias * DIA) : null;
    const validaDe = validaAte ? adicionarMeses(validaAte, -MESES_VALIDADE) : null;

    autorizacoes.push({
      id: `a-${indice + 1}`,
      solicitante: {
        id: `s-${indice + 1}`,
        nome_completo: exemplo.nome,
        vinculo: exemplo.vinculo,
        telefone: exemplo.telefone,
      },
      veiculo: exemplo.veiculo,
      situacao: exemplo.situacao,
      solicitada_em: new Date(solicitada).toISOString(),
      analisada_em: analisada,
      analisada_por: analisada ? 'coordenacao@efg.local' : null,
      valida_de: validaDe ? validaDe.toISOString() : null,
      valida_ate: validaAte ? validaAte.toISOString() : null,
      motivo: exemplo.motivo ?? null,
      documentos: documentosDeExemplo(exemplo.veiculo.placa, exemplo.solicitadaHaDias),
      renovacao_de: null,
    });
  });

  // Historico de entradas e saidas dos ultimos dias.
  const historico: Array<[string, number, number]> = [
    // placa, entrou ha X minutos, ficou Y minutos
    ['RTA2B45', 1 * 24 * 60 + 70, 250],
    ['QWE7J12', 1 * 24 * 60 + 65, 245],
    ['NGV8H34', 1 * 24 * 60 + 600, 540],
    ['XYZ1Z23', 1 * 24 * 60 + 80, 200],
    ['OJK3F21', 7 * 24 * 60 + 60, 240],
    ['PBX4C88', 2 * 24 * 60 + 500, 480],
    ['RTA2B45', 2 * 24 * 60 + 75, 250],
    ['NGV8H34', 2 * 24 * 60 + 610, 545],
    ['PBX4C88', 300, 180],
    ['XYZ1Z23', 260, 95],
  ];
  historico.forEach(([placa, entrouHa, ficou]) => {
    const autorizacao = autorizacoes.find((item) => item.veiculo.placa === placa);
    if (!autorizacao) return;
    movimentacoes.push({
      id: novoId('mv'),
      autorizacao_id: autorizacao.id,
      veiculo: autorizacao.veiculo,
      condutor: autorizacao.solicitante,
      entrada_em: new Date(agora - entrouHa * MINUTO).toISOString(),
      saida_em: new Date(agora - entrouHa * MINUTO + ficou * MINUTO).toISOString(),
      entrada_registrada_por: 'guarita@efg.local',
      saida_registrada_por: 'guarita@efg.local',
    });
  });

  // Veiculos no patio agora.
  const noPatio: Array<[string, number]> = [
    ['RTA2B45', 95],
    ['QWE7J12', 70],
    ['NGV8H34', 540],
  ];
  noPatio.forEach(([placa, entrouHa]) => {
    const autorizacao = autorizacoes.find((item) => item.veiculo.placa === placa);
    if (!autorizacao) return;
    movimentacoes.push({
      id: novoId('mv'),
      autorizacao_id: autorizacao.id,
      veiculo: autorizacao.veiculo,
      condutor: autorizacao.solicitante,
      entrada_em: new Date(agora - entrouHa * MINUTO).toISOString(),
      saida_em: null,
      entrada_registrada_por: 'guarita@efg.local',
      saida_registrada_por: null,
    });
  });
}

carregarDadosIniciais();

// ---------- Regras de consulta ----------

function autorizacaoDaPlaca(placa: string): AutorizacaoEstacionamento | null {
  const agora = Date.now();
  const daPlaca = autorizacoes.filter((item) => item.veiculo.placa === placa);
  if (!daPlaca.length) return null;

  // Prefere uma aprovada e valida (a de validade mais longa); senao, a mais recente.
  const validas = daPlaca
    .filter((item) => situacaoEfetiva(item, agora) === 'aprovada')
    .sort((a, b) => new Date(b.valida_ate ?? 0).getTime() - new Date(a.valida_ate ?? 0).getTime());
  if (validas.length) return validas[0];

  return [...daPlaca].sort(
    (a, b) => new Date(b.solicitada_em).getTime() - new Date(a.solicitada_em).getTime(),
  )[0];
}

function veiculoNoPatio(placa: string): MovimentacaoVeiculo | null {
  return movimentacoes.find((item) => item.veiculo.placa === placa && !item.saida_em) ?? null;
}

function motivoDoBloqueio(
  autorizacao: AutorizacaoEstacionamento | null,
  noPatio: MovimentacaoVeiculo | null,
): string | null {
  if (noPatio) return `O veículo já está no pátio desde ${formatarHora(noPatio.entrada_em)}.`;
  if (!autorizacao) return 'Placa sem autorização cadastrada. Oriente a pessoa a solicitar na coordenação.';

  switch (situacaoEfetiva(autorizacao, Date.now())) {
    case 'aprovada':
      return null;
    case 'pendente':
    case 'em_analise':
      return 'A solicitação ainda está em análise pela coordenação.';
    case 'rejeitada':
      return `Solicitação rejeitada${autorizacao.motivo ? `: ${autorizacao.motivo}` : '.'}`;
    case 'expirada':
      return `Autorização vencida em ${formatarData(autorizacao.valida_ate ?? autorizacao.solicitada_em)}. É preciso solicitar a renovação.`;
    case 'cancelada':
      return `Autorização cancelada${autorizacao.motivo ? `: ${autorizacao.motivo}` : '.'}`;
    default:
      return 'Entrada não permitida.';
  }
}

function montarConsulta(placa: string): ConsultaPlaca {
  const autorizacao = autorizacaoDaPlaca(placa);
  const noPatio = veiculoNoPatio(placa);
  const motivo = motivoDoBloqueio(autorizacao, noPatio);
  return { placa, autorizacao, no_patio: noPatio, pode_entrar: motivo === null, motivo_bloqueio: motivo };
}

function validarPlaca(valor: string): string {
  const placa = normalizarPlaca(valor);
  if (!placaValida(placa)) throw new ErroGuarita('Placa inválida. Use o formato ABC1234 ou ABC1D23.');
  return placa;
}

// ---------- Portaria ----------

export async function consultarPlaca(valor: string): Promise<ConsultaPlaca> {
  await esperar();
  return copiar(montarConsulta(validarPlaca(valor)));
}

export async function registrarEntrada(valor: string): Promise<MovimentacaoVeiculo> {
  await esperar();
  const consulta = montarConsulta(validarPlaca(valor));
  if (!consulta.pode_entrar || !consulta.autorizacao) {
    throw new ErroGuarita(consulta.motivo_bloqueio ?? 'Entrada não permitida.');
  }

  const movimentacao: MovimentacaoVeiculo = {
    id: novoId('mv'),
    autorizacao_id: consulta.autorizacao.id,
    veiculo: consulta.autorizacao.veiculo,
    condutor: consulta.autorizacao.solicitante,
    entrada_em: new Date().toISOString(),
    saida_em: null,
    entrada_registrada_por: operadorAtual(),
    saida_registrada_por: null,
  };
  movimentacoes.push(movimentacao);
  return copiar(movimentacao);
}

export async function registrarSaida(valor: string): Promise<MovimentacaoVeiculo> {
  await esperar();
  const placa = validarPlaca(valor);
  const movimentacao = veiculoNoPatio(placa);
  if (!movimentacao) throw new ErroGuarita('Este veículo não está registrado no pátio.');

  movimentacao.saida_em = new Date().toISOString();
  movimentacao.saida_registrada_por = operadorAtual();
  return copiar(movimentacao);
}

export async function listarNoPatio(): Promise<MovimentacaoVeiculo[]> {
  await esperar();
  return copiar(
    movimentacoes
      .filter((item) => !item.saida_em)
      .sort((a, b) => new Date(a.entrada_em).getTime() - new Date(b.entrada_em).getTime()),
  );
}

export async function listarMovimentacoesVeiculos(placa?: string): Promise<MovimentacaoVeiculo[]> {
  await esperar();
  const filtradas = placa ? movimentacoes.filter((item) => item.veiculo.placa === normalizarPlaca(placa)) : movimentacoes;
  return copiar(
    [...filtradas].sort((a, b) => new Date(b.entrada_em).getTime() - new Date(a.entrada_em).getTime()),
  );
}

// ---------- Autorizacoes ----------

function buscarAutorizacao(id: string): AutorizacaoEstacionamento {
  const autorizacao = autorizacoes.find((item) => item.id === id);
  if (!autorizacao) throw new ErroGuarita('Autorização não encontrada.');
  return autorizacao;
}

export async function listarAutorizacoes(): Promise<AutorizacaoEstacionamento[]> {
  await esperar();
  return copiar(
    [...autorizacoes].sort((a, b) => new Date(b.solicitada_em).getTime() - new Date(a.solicitada_em).getTime()),
  );
}

export async function solicitarAutorizacao(dados: SolicitacaoAutorizacao): Promise<AutorizacaoEstacionamento> {
  await esperar();
  const placa = validarPlaca(dados.placa);
  const agora = Date.now();

  const emAberto = autorizacoes.find(
    (item) =>
      item.veiculo.placa === placa &&
      item.id !== dados.renovacao_de &&
      ['pendente', 'em_analise'].includes(item.situacao),
  );
  if (emAberto) {
    throw new ErroGuarita(`Já existe uma solicitação em análise para a placa ${placa}.`);
  }

  const vigente = autorizacoes.find(
    (item) => item.veiculo.placa === placa && situacaoEfetiva(item, agora) === 'aprovada' && item.id !== dados.renovacao_de,
  );
  if (vigente && !dados.renovacao_de) {
    throw new ErroGuarita(`A placa ${placa} já tem autorização válida. Use a opção de renovação.`);
  }

  const tipos: TipoDocumento[] = ['cnh', 'crlv', 'termo'];
  const documentos = tipos.map((tipo) => {
    const arquivo = dados.documentos[tipo];
    if (!arquivo) throw new ErroGuarita('Anexe a CNH, o documento do veículo e o termo assinado.');
    return {
      id: novoId('d'),
      tipo,
      nome_arquivo: arquivo.name,
      tamanho_bytes: arquivo.size,
      // Nos dados simulados o arquivo so existe no navegador (some ao recarregar).
      url: URL.createObjectURL(arquivo),
      enviado_em: new Date(agora).toISOString(),
    };
  });

  const nova: AutorizacaoEstacionamento = {
    id: novoId('a'),
    solicitante: {
      id: novoId('s'),
      nome_completo: dados.nome_completo.trim(),
      vinculo: dados.vinculo,
      telefone: dados.telefone?.trim() || null,
    },
    veiculo: { placa, modelo: dados.modelo.trim(), cor: dados.cor.trim(), tipo: dados.tipo },
    situacao: 'pendente',
    solicitada_em: new Date(agora).toISOString(),
    analisada_em: null,
    analisada_por: null,
    valida_de: null,
    valida_ate: null,
    motivo: null,
    documentos,
    renovacao_de: dados.renovacao_de ?? null,
  };
  autorizacoes.push(nova);
  return copiar(nova);
}

function exigirEmAnalise(autorizacao: AutorizacaoEstacionamento) {
  if (autorizacao.situacao !== 'pendente' && autorizacao.situacao !== 'em_analise') {
    throw new ErroGuarita('Esta solicitação já foi analisada.');
  }
}

export async function iniciarAnalise(id: string): Promise<AutorizacaoEstacionamento> {
  await esperar();
  const autorizacao = buscarAutorizacao(id);
  if (autorizacao.situacao !== 'pendente') throw new ErroGuarita('Só solicitações pendentes podem entrar em análise.');
  autorizacao.situacao = 'em_analise';
  return copiar(autorizacao);
}

export async function aprovarAutorizacao(id: string): Promise<AutorizacaoEstacionamento> {
  await esperar();
  const autorizacao = buscarAutorizacao(id);
  exigirEmAnalise(autorizacao);

  const tipos = new Set(autorizacao.documentos.map((documento) => documento.tipo));
  if (!tipos.has('cnh') || !tipos.has('crlv') || !tipos.has('termo')) {
    throw new ErroGuarita('Faltam documentos. A aprovação exige CNH, documento do veículo e termo assinado.');
  }

  // Renovacao: a nova validade comeca quando a anterior terminar.
  const agora = new Date();
  let inicio = agora;
  if (autorizacao.renovacao_de) {
    const anterior = autorizacoes.find((item) => item.id === autorizacao.renovacao_de);
    if (anterior?.valida_ate && new Date(anterior.valida_ate) > agora) inicio = new Date(anterior.valida_ate);
  }

  autorizacao.situacao = 'aprovada';
  autorizacao.analisada_em = agora.toISOString();
  autorizacao.analisada_por = operadorAtual();
  autorizacao.valida_de = inicio.toISOString();
  autorizacao.valida_ate = adicionarMeses(inicio, MESES_VALIDADE).toISOString();
  autorizacao.motivo = null;
  return copiar(autorizacao);
}

export async function rejeitarAutorizacao(id: string, motivo: string): Promise<AutorizacaoEstacionamento> {
  await esperar();
  const autorizacao = buscarAutorizacao(id);
  exigirEmAnalise(autorizacao);
  if (!motivo.trim()) throw new ErroGuarita('Informe o motivo da rejeição.');

  autorizacao.situacao = 'rejeitada';
  autorizacao.analisada_em = new Date().toISOString();
  autorizacao.analisada_por = operadorAtual();
  autorizacao.motivo = motivo.trim();
  return copiar(autorizacao);
}

export async function cancelarAutorizacao(id: string, motivo: string): Promise<AutorizacaoEstacionamento> {
  await esperar();
  const autorizacao = buscarAutorizacao(id);
  if (autorizacao.situacao !== 'aprovada') throw new ErroGuarita('Só autorizações aprovadas podem ser canceladas.');
  if (!motivo.trim()) throw new ErroGuarita('Informe o motivo do cancelamento.');

  autorizacao.situacao = 'cancelada';
  autorizacao.motivo = motivo.trim();
  autorizacao.analisada_em = new Date().toISOString();
  autorizacao.analisada_por = operadorAtual();
  return copiar(autorizacao);
}
