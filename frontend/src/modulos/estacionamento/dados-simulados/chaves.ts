// Dados simulados do controle de chaves.
// Usados enquanto o back-end nao expoe as rotas da guarita.
// Os nomes de pessoas sao ficticios. Os locais seguem o mapa de salas e
// laboratorios da unidade.
//
// As regras abaixo imitam o que o back-end deve validar:
// - so pessoas autorizadas para aquela chave podem retira-la;
// - so chaves disponiveis (ou reservadas) podem ser retiradas;
// - so chaves retiradas podem ser devolvidas;
// - toda retirada e devolucao gera uma movimentacao com quem registrou.

import type {
  Chave,
  DevolucaoCriacao,
  LocalChave,
  Movimentacao,
  PessoaAutorizada,
  RetiradaCriacao,
} from '../tipos/chaves';

export class ErroGuarita extends Error {}

const LATENCIA_MS = 300;
const MINUTO = 60 * 1000;

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

const pessoas: Record<string, PessoaAutorizada> = {
  ana: { id: 'p-ana', nome_completo: 'Ana Beatriz Rocha', papel: 'Professora' },
  carlos: { id: 'p-carlos', nome_completo: 'Carlos Eduardo Lima', papel: 'Professor' },
  fernanda: { id: 'p-fernanda', nome_completo: 'Fernanda Souza', papel: 'Coordenação pedagógica' },
  marcos: { id: 'p-marcos', nome_completo: 'Marcos Vinícius Alves', papel: 'Professor' },
  juliana: { id: 'p-juliana', nome_completo: 'Juliana Prado', papel: 'Monitora' },
  ricardo: { id: 'p-ricardo', nome_completo: 'Ricardo Nogueira', papel: 'Equipe de TI' },
  patricia: { id: 'p-patricia', nome_completo: 'Patrícia Mendes', papel: 'Professora' },
  rafael: { id: 'p-rafael', nome_completo: 'Rafael Ramos', papel: 'Professor' },
  larissa: { id: 'p-larissa', nome_completo: 'Larissa Duarte', papel: 'Coordenação' },
  joao: { id: 'p-joao', nome_completo: 'João Pedro Martins', papel: 'Zeladoria' },
};

// Coordenacao e zeladoria podem retirar qualquer chave.
const autorizadosGerais = [pessoas.fernanda, pessoas.larissa, pessoas.joao];

function local(id: string, nome: string, tipo: LocalChave['tipo']): LocalChave {
  return { id, nome, tipo };
}

type ChaveInicial = Omit<Chave, 'retirada_atual'> & { autorizados: PessoaAutorizada[] };

const chavesIniciais: ChaveInicial[] = [
  { id: 'c-s01', codigo: 'S-01', local: local('l-s01', 'Sala 1', 'sala'), status: 'disponivel', observacao: null, autorizados: [pessoas.ana, pessoas.carlos, pessoas.marcos, pessoas.rafael] },
  { id: 'c-s03', codigo: 'S-03', local: local('l-s03', 'Sala 3', 'sala'), status: 'disponivel', observacao: null, autorizados: [pessoas.marcos, pessoas.patricia, pessoas.rafael] },
  { id: 'c-s04', codigo: 'S-04', local: local('l-s04', 'Sala 4', 'sala'), status: 'disponivel', observacao: null, autorizados: [pessoas.ana, pessoas.patricia] },
  { id: 'c-s05', codigo: 'S-05', local: local('l-s05', 'Sala 5', 'sala'), status: 'disponivel', observacao: null, autorizados: [pessoas.carlos, pessoas.rafael] },
  { id: 'c-s07', codigo: 'S-07', local: local('l-s07', 'Sala 7', 'sala'), status: 'disponivel', observacao: null, autorizados: [pessoas.ana, pessoas.marcos] },
  { id: 'c-s09', codigo: 'S-09', local: local('l-s09', 'Sala 9', 'sala'), status: 'disponivel', observacao: null, autorizados: [pessoas.patricia, pessoas.rafael] },
  { id: 'c-s10', codigo: 'S-10', local: local('l-s10', 'Sala 10', 'sala'), status: 'disponivel', observacao: null, autorizados: [pessoas.carlos, pessoas.ana] },
  { id: 'c-s11', codigo: 'S-11', local: local('l-s11', 'Sala 11', 'sala'), status: 'disponivel', observacao: null, autorizados: [pessoas.marcos, pessoas.patricia] },
  { id: 'c-s12', codigo: 'S-12', local: local('l-s12', 'Sala 12', 'sala'), status: 'perdida', observacao: 'Cópia extraviada em 14/10. Nova cópia solicitada à direção.', autorizados: [pessoas.rafael] },
  { id: 'c-rob', codigo: 'LAB-ROB', local: local('l-rob', 'Laboratório de Robótica', 'laboratorio'), status: 'disponivel', observacao: null, autorizados: [pessoas.juliana, pessoas.ricardo, pessoas.carlos] },
  { id: 'c-steam', codigo: 'LAB-STEAM', local: local('l-steam', 'Laboratório STEAM', 'laboratorio'), status: 'disponivel', observacao: null, autorizados: [pessoas.juliana, pessoas.patricia] },
  { id: 'c-ele', codigo: 'LAB-ELE', local: local('l-ele', 'Laboratório de Eletrônica', 'laboratorio'), status: 'disponivel', observacao: null, autorizados: [pessoas.ana, pessoas.ricardo, pessoas.carlos] },
  { id: 'c-aut', codigo: 'LAB-AUT', local: local('l-aut', 'Laboratório de Automação', 'laboratorio'), status: 'manutencao', observacao: 'Fechadura em troca. Previsão de retorno: próxima semana.', autorizados: [pessoas.ricardo, pessoas.marcos] },
  { id: 'c-cri', codigo: 'LAB-CRI', local: local('l-cri', 'Laboratório Criativo', 'laboratorio'), status: 'disponivel', observacao: null, autorizados: [pessoas.patricia, pessoas.ana] },
  { id: 'c-esp', codigo: 'LAB-ESP', local: local('l-esp', 'Laboratório de E-sports', 'laboratorio'), status: 'disponivel', observacao: null, autorizados: [pessoas.rafael, pessoas.patricia, pessoas.ricardo] },
  { id: 'c-inf', codigo: 'LAB-INF', local: local('l-inf', 'Laboratório de Informática', 'laboratorio'), status: 'disponivel', observacao: null, autorizados: [pessoas.carlos, pessoas.ricardo, pessoas.marcos] },
  { id: 'c-aud', codigo: 'AUD', local: local('l-aud', 'Auditório', 'espaco'), status: 'disponivel', observacao: null, autorizados: [] },
  { id: 'c-gin', codigo: 'GIN', local: local('l-gin', 'Ginásio de esportes', 'espaco'), status: 'bloqueada', observacao: 'Uso suspenso pela direção até a vistoria da quadra.', autorizados: [] },
  { id: 'c-cow', codigo: 'COW', local: local('l-cow', 'Coworking', 'espaco'), status: 'disponivel', observacao: null, autorizados: [pessoas.juliana, pessoas.ricardo] },
];

type Registro = { chave: Chave; autorizados: PessoaAutorizada[] };

const registros = new Map<string, Registro>();
const movimentacoes: Movimentacao[] = [];
let proximoId = 1;

function novoId(prefixo: string): string {
  proximoId += 1;
  return `${prefixo}-${proximoId}`;
}

function autorizadosDa(chave: ChaveInicial): PessoaAutorizada[] {
  const unicos = new Map<string, PessoaAutorizada>();
  [...chave.autorizados, ...autorizadosGerais].forEach((pessoa) => unicos.set(pessoa.id, pessoa));
  return [...unicos.values()].sort((a, b) => a.nome_completo.localeCompare(b.nome_completo));
}

function registrarHistorico(
  chave: Chave,
  pessoa: PessoaAutorizada,
  retiradaHa: number,
  duracao: number,
  devolvidaHa: number | null,
  observacaoDevolucao: string | null = null,
): Movimentacao {
  const agora = Date.now();
  const movimentacao: Movimentacao = {
    id: novoId('m'),
    chave_id: chave.id,
    chave_codigo: chave.codigo,
    local_nome: chave.local.nome,
    pessoa,
    retirada_em: new Date(agora - retiradaHa * MINUTO).toISOString(),
    devolucao_prevista: new Date(agora - retiradaHa * MINUTO + duracao * MINUTO).toISOString(),
    devolvida_em: devolvidaHa === null ? null : new Date(agora - devolvidaHa * MINUTO).toISOString(),
    retirada_registrada_por: 'guarita@efg.local',
    devolucao_registrada_por: devolvidaHa === null ? null : 'guarita@efg.local',
    observacao_retirada: null,
    observacao_devolucao: observacaoDevolucao,
  };
  movimentacoes.push(movimentacao);
  return movimentacao;
}

function retirarNaCarga(codigo: string, pessoa: PessoaAutorizada, retiradaHa: number, duracao: number) {
  const registro = [...registros.values()].find((item) => item.chave.codigo === codigo);
  if (!registro) return;
  const movimentacao = registrarHistorico(registro.chave, pessoa, retiradaHa, duracao, null);
  registro.chave.status = 'retirada';
  registro.chave.retirada_atual = {
    movimentacao_id: movimentacao.id,
    pessoa,
    retirada_em: movimentacao.retirada_em,
    devolucao_prevista: movimentacao.devolucao_prevista,
  };
}

function carregarDadosIniciais() {
  chavesIniciais.forEach((inicial) => {
    const { autorizados: _autorizados, ...chave } = inicial;
    registros.set(chave.id, { chave: { ...chave, retirada_atual: null }, autorizados: autorizadosDa(inicial) });
  });

  // Historico ja encerrado (dias anteriores).
  const historico: Array<[string, PessoaAutorizada, number, number, number, string | null]> = [
    ['S-01', pessoas.ana, 1560, 140, 1425, null],
    ['LAB-ROB', pessoas.juliana, 1500, 200, 1310, null],
    ['LAB-INF', pessoas.carlos, 1480, 240, 1230, 'Devolvida pela zeladoria.'],
    ['S-12', pessoas.rafael, 17280, 140, 17130, null],
    ['LAB-ESP', pessoas.rafael, 2950, 240, 2700, null],
    ['AUD', pessoas.larissa, 2900, 120, 2790, null],
    ['LAB-ELE', pessoas.ricardo, 2880, 90, 2800, 'Chaveiro com argola quebrada.'],
  ];
  historico.forEach(([codigo, pessoa, retiradaHa, duracao, devolvidaHa, observacao]) => {
    const registro = [...registros.values()].find((item) => item.chave.codigo === codigo);
    if (registro) registrarHistorico(registro.chave, pessoa, retiradaHa, duracao, devolvidaHa, observacao);
  });

  // Chaves em uso agora: duas dentro do prazo e duas atrasadas.
  retirarNaCarga('LAB-ELE', pessoas.ana, 60, 110);
  retirarNaCarga('LAB-ESP', pessoas.patricia, 30, 150);
  retirarNaCarga('LAB-INF', pessoas.carlos, 180, 145);
  retirarNaCarga('S-03', pessoas.marcos, 130, 120);
}

carregarDadosIniciais();

function buscarRegistro(chaveId: string): Registro {
  const registro = registros.get(chaveId);
  if (!registro) throw new ErroGuarita('Chave não encontrada.');
  return registro;
}

export async function listarChaves(): Promise<Chave[]> {
  await esperar();
  return copiar([...registros.values()].map((registro) => registro.chave));
}

export async function listarAutorizados(chaveId: string): Promise<PessoaAutorizada[]> {
  await esperar();
  return copiar(buscarRegistro(chaveId).autorizados);
}

export async function registrarRetirada(dados: RetiradaCriacao): Promise<Chave> {
  await esperar();
  const { chave, autorizados } = buscarRegistro(dados.chave_id);

  if (chave.status !== 'disponivel' && chave.status !== 'reservada') {
    throw new ErroGuarita(`A chave ${chave.codigo} não está disponível para retirada.`);
  }

  const pessoa = autorizados.find((item) => item.id === dados.pessoa_id);
  if (!pessoa) {
    throw new ErroGuarita(`Esta pessoa não tem autorização para retirar a chave ${chave.codigo}.`);
  }

  const agora = new Date();
  if (new Date(dados.devolucao_prevista) <= agora) {
    throw new ErroGuarita('A devolução prevista precisa ser depois do horário atual.');
  }

  const movimentacao: Movimentacao = {
    id: novoId('m'),
    chave_id: chave.id,
    chave_codigo: chave.codigo,
    local_nome: chave.local.nome,
    pessoa,
    retirada_em: agora.toISOString(),
    devolucao_prevista: new Date(dados.devolucao_prevista).toISOString(),
    devolvida_em: null,
    retirada_registrada_por: operadorAtual(),
    devolucao_registrada_por: null,
    observacao_retirada: dados.observacao?.trim() || null,
    observacao_devolucao: null,
  };
  movimentacoes.push(movimentacao);

  chave.status = 'retirada';
  chave.retirada_atual = {
    movimentacao_id: movimentacao.id,
    pessoa,
    retirada_em: movimentacao.retirada_em,
    devolucao_prevista: movimentacao.devolucao_prevista,
  };

  return copiar(chave);
}

export async function registrarDevolucao(dados: DevolucaoCriacao): Promise<Chave> {
  await esperar();
  const { chave } = buscarRegistro(dados.chave_id);

  if (chave.status !== 'retirada' || !chave.retirada_atual) {
    throw new ErroGuarita(`A chave ${chave.codigo} não está retirada.`);
  }

  const movimentacao = movimentacoes.find((item) => item.id === chave.retirada_atual?.movimentacao_id);
  if (movimentacao) {
    movimentacao.devolvida_em = new Date().toISOString();
    movimentacao.devolucao_registrada_por = operadorAtual();
    movimentacao.observacao_devolucao = dados.observacao?.trim() || null;
  }

  chave.status = 'disponivel';
  chave.retirada_atual = null;

  return copiar(chave);
}

export async function listarMovimentacoes(chaveId?: string): Promise<Movimentacao[]> {
  await esperar();
  const filtradas = chaveId ? movimentacoes.filter((item) => item.chave_id === chaveId) : movimentacoes;
  return copiar(
    [...filtradas].sort((a, b) => new Date(b.retirada_em).getTime() - new Date(a.retirada_em).getTime()),
  );
}
