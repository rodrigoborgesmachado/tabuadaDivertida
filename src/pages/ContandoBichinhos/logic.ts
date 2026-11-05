export type Nivel = 5 | 10 | 20;

export type TipoDesafio = 'quantos' | 'ligue' | 'mostre' | 'junte' | 'mais';

export interface Bicho {
  emoji: string;
  nome: string;
  plural: string;
}

export interface Grupo {
  bicho: Bicho;
  quantidade: number;
}

export type Desafio =
  | { tipo: 'quantos'; grupo: Grupo; opcoes: number[] }
  | { tipo: 'ligue'; grupos: Grupo[]; numeros: number[] }
  | { tipo: 'mostre'; grupo: Grupo; alvo: number }
  | { tipo: 'junte'; grupos: [Grupo, Grupo]; opcoes: number[] }
  | { tipo: 'mais'; grupos: [Grupo, Grupo] };

export const NIVEIS: Nivel[] = [5, 10, 20];
export const TIPOS: TipoDesafio[] = ['quantos', 'ligue', 'mostre', 'junte', 'mais'];
export const TOTAL_DESAFIOS = 8;
export const GRUPOS_LIGUE = 3;
export const MAXIMO_LIGUE = 10;
export const QUANTIDADE_OPCOES = 3;

export const BICHOS: Bicho[] = [
  { emoji: '🐥', nome: 'pintinho', plural: 'pintinhos' },
  { emoji: '🦆', nome: 'patinho', plural: 'patinhos' },
  { emoji: '🐱', nome: 'gatinho', plural: 'gatinhos' },
  { emoji: '🐶', nome: 'cachorrinho', plural: 'cachorrinhos' },
  { emoji: '🐰', nome: 'coelhinho', plural: 'coelhinhos' },
  { emoji: '🐸', nome: 'sapinho', plural: 'sapinhos' },
  { emoji: '🐟', nome: 'peixinho', plural: 'peixinhos' },
  { emoji: '🐷', nome: 'porquinho', plural: 'porquinhos' },
  { emoji: '🐵', nome: 'macaquinho', plural: 'macaquinhos' },
  { emoji: '🐻', nome: 'ursinho', plural: 'ursinhos' },
];

export const ELOGIOS = ['Muito bem!', 'Isso aí!', 'Parabéns!', 'Você é demais!', 'Que legal!'];
export const ENCORAJAR = 'Quase! Vamos contar de novo?';

const inteiro = (min: number, max: number, random: () => number) => Math.floor(random() * (max - min + 1)) + min;

export const embaralhar = <T,>(itens: T[], random: () => number = Math.random) => {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = inteiro(0, i, random);
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
};

const sortearDistintos = <T,>(itens: T[], quantidade: number, random: () => number) => embaralhar(itens, random).slice(0, quantidade);

const faixa = (min: number, max: number) => Array.from({ length: max - min + 1 }, (_, i) => min + i);

const sortearBicho = (random: () => number) => BICHOS[inteiro(0, BICHOS.length - 1, random)];

export const gerarOpcoes = (resposta: number, maximo: number, random: () => number = Math.random) => {
  const vizinhos = [resposta - 2, resposta - 1, resposta + 1, resposta + 2].filter((valor) => valor >= 1 && valor <= maximo);
  return embaralhar([resposta, ...sortearDistintos(vizinhos, QUANTIDADE_OPCOES - 1, random)], random);
};

export const gerarDesafio = (tipo: TipoDesafio, nivel: Nivel, random: () => number = Math.random): Desafio => {
  if (tipo === 'ligue') {
    const quantidades = sortearDistintos(faixa(1, Math.min(nivel, MAXIMO_LIGUE)), GRUPOS_LIGUE, random);
    const bichos = sortearDistintos(BICHOS, GRUPOS_LIGUE, random);
    return { tipo, grupos: quantidades.map((quantidade, i) => ({ bicho: bichos[i], quantidade })), numeros: embaralhar(quantidades, random) };
  }

  if (tipo === 'mostre') {
    const alvo = inteiro(1, nivel - 1, random);
    return { tipo, grupo: { bicho: sortearBicho(random), quantidade: Math.min(nivel, alvo + inteiro(1, 3, random)) }, alvo };
  }

  if (tipo === 'junte') {
    const total = inteiro(2, nivel, random);
    const primeiro = inteiro(1, total - 1, random);
    const bicho = sortearBicho(random);
    return { tipo, grupos: [{ bicho, quantidade: primeiro }, { bicho, quantidade: total - primeiro }], opcoes: gerarOpcoes(total, nivel, random) };
  }

  if (tipo === 'mais') {
    const [a, b] = sortearDistintos(faixa(1, nivel), 2, random);
    const bicho = sortearBicho(random);
    return { tipo, grupos: [{ bicho, quantidade: a }, { bicho, quantidade: b }] };
  }

  const quantidade = inteiro(1, nivel, random);
  return { tipo, grupo: { bicho: sortearBicho(random), quantidade }, opcoes: gerarOpcoes(quantidade, nivel, random) };
};

export const gerarPartida = (nivel: Nivel, random: () => number = Math.random) => {
  const extras = Array.from({ length: TOTAL_DESAFIOS - TIPOS.length }, () => TIPOS[inteiro(0, TIPOS.length - 1, random)]);
  return embaralhar([...TIPOS, ...extras], random).map((tipo) => gerarDesafio(tipo, nivel, random));
};

export const nomeDoBicho = (bicho: Bicho, quantidade: number) => (quantidade === 1 ? bicho.nome : bicho.plural);

export const respostaDoDesafio = (desafio: Desafio) => {
  if (desafio.tipo === 'quantos') return desafio.grupo.quantidade;
  if (desafio.tipo === 'mostre') return desafio.alvo;
  if (desafio.tipo === 'junte') return desafio.grupos[0].quantidade + desafio.grupos[1].quantidade;
  if (desafio.tipo === 'mais') return desafio.grupos[0].quantidade > desafio.grupos[1].quantidade ? 0 : 1;
  return null;
};

export const instrucao = (desafio: Desafio) => {
  if (desafio.tipo === 'quantos') {
    return `Quantos ${desafio.grupo.bicho.plural} tem? Toque no número certo.`;
  }

  if (desafio.tipo === 'ligue') {
    return 'Ligue cada grupo ao seu número. Toque em um grupo e depois no número.';
  }

  if (desafio.tipo === 'mostre') {
    return `Toque em ${desafio.alvo} ${nomeDoBicho(desafio.grupo.bicho, desafio.alvo)}. Depois toque no botão verde.`;
  }

  if (desafio.tipo === 'junte') {
    const [a, b] = desafio.grupos;
    return `Junte os grupos: ${a.quantidade} ${nomeDoBicho(a.bicho, a.quantidade)} mais ${b.quantidade} ${nomeDoBicho(b.bicho, b.quantidade)}. Quantos ficam ao todo?`;
  }

  return 'Qual grupo tem mais bichinhos? Toque no grupo.';
};

export const dicaMostre = (tocados: number, alvo: number) =>
  tocados < alvo ? 'Faltou um pouquinho! Vamos contar de novo?' : 'Passou um pouquinho! Vamos contar de novo?';

export const estrelas = (erros: number) => {
  if (erros <= 1) return 3;
  if (erros <= 4) return 2;
  return 1;
};

export const sortearElogio = (random: () => number = Math.random) => ELOGIOS[inteiro(0, ELOGIOS.length - 1, random)];
