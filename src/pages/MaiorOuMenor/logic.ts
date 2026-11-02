export type Modalidade = 'tabuada' | 'fracoes' | 'decimais' | 'misturado';

export type Nivel = 'facil' | 'medio' | 'dificil';

export type Resposta = 'esquerda' | 'direita' | 'iguais';

export type TipoValor = 'conta' | 'numero' | 'fracao' | 'decimal';

export interface Valor {
  tipo: TipoValor;
  texto: string;
  numerador: number;
  denominador: number;
}

export interface Rodada {
  esquerda: Valor;
  direita: Valor;
}

export interface ConfigNivel {
  fatorMaximo: number;
  denominadorMaximo: number;
  casas: number;
  inteiroMaximo: number;
  segundos: number;
}

export const CONFIG_NIVEL: Record<Nivel, ConfigNivel> = {
  facil: { fatorMaximo: 5, denominadorMaximo: 4, casas: 1, inteiroMaximo: 0, segundos: 90 },
  medio: { fatorMaximo: 10, denominadorMaximo: 8, casas: 2, inteiroMaximo: 1, segundos: 60 },
  dificil: { fatorMaximo: 12, denominadorMaximo: 12, casas: 3, inteiroMaximo: 9, segundos: 45 },
};

export const PONTOS_POR_ACERTO = 10;
export const PENALIDADE_SEGUNDOS = 3;
const CHANCE_IGUAIS = 0.2;

const inteiro = (min: number, max: number, random: () => number) => Math.floor(random() * (max - min + 1)) + min;

const mdc = (a: number, b: number): number => (b === 0 ? a : mdc(b, a % b));

const mmc = (a: number, b: number) => (a * b) / mdc(a, b);

export const formatarDecimal = (valor: number, casas: number) => {
  const escala = 10 ** casas;
  return `${Math.floor(valor / escala)},${String(valor % escala).padStart(casas, '0')}`;
};

export const conta = (a: number, b: number): Valor => ({ tipo: 'conta', texto: `${a} × ${b}`, numerador: a * b, denominador: 1 });

export const numero = (valor: number): Valor => ({ tipo: 'numero', texto: String(valor), numerador: valor, denominador: 1 });

export const fracao = (numerador: number, denominador: number): Valor => ({ tipo: 'fracao', texto: `${numerador}/${denominador}`, numerador, denominador });

export const decimal = (valor: number, casas: number): Valor => ({ tipo: 'decimal', texto: formatarDecimal(valor, casas), numerador: valor, denominador: 10 ** casas });

const casasDe = (valor: Valor) => Math.round(Math.log10(valor.denominador));

export const comparar = (esquerda: Valor, direita: Valor): Resposta => {
  const diferenca = esquerda.numerador * direita.denominador - direita.numerador * esquerda.denominador;
  if (diferenca > 0) return 'esquerda';
  if (diferenca < 0) return 'direita';
  return 'iguais';
};

const embaralharLados = (a: Valor, b: Valor, random: () => number): Rodada =>
  random() < 0.5 ? { esquerda: a, direita: b } : { esquerda: b, direita: a };

const gerarTabuada = (config: ConfigNivel, random: () => number): Rodada => {
  const a = inteiro(2, config.fatorMaximo, random);
  const b = inteiro(2, config.fatorMaximo, random);
  const produto = a * b;

  if (random() < CHANCE_IGUAIS) {
    return embaralharLados(conta(a, b), numero(produto), random);
  }

  const diferenca = inteiro(1, Math.max(2, Math.round(produto * 0.2)), random);
  const outro = random() < 0.5 ? produto + diferenca : produto - diferenca;
  return embaralharLados(conta(a, b), numero(outro), random);
};

const gerarFracoes = (config: ConfigNivel, random: () => number): Rodada => {
  const denominador = inteiro(2, config.denominadorMaximo, random);
  const numerador = inteiro(1, denominador - 1, random);

  if (random() < CHANCE_IGUAIS) {
    const fator = inteiro(2, 3, random);
    return embaralharLados(fracao(numerador, denominador), fracao(numerador * fator, denominador * fator), random);
  }

  let outroDenominador = inteiro(2, config.denominadorMaximo, random);
  let outroNumerador = inteiro(1, outroDenominador - 1, random);

  if (numerador * outroDenominador === outroNumerador * denominador) {
    if (outroNumerador < outroDenominador - 1) {
      outroNumerador += 1;
    } else if (outroNumerador > 1) {
      outroNumerador -= 1;
    } else {
      outroDenominador += 1;
    }
  }

  return embaralharLados(fracao(numerador, denominador), fracao(outroNumerador, outroDenominador), random);
};

const gerarDecimais = (config: ConfigNivel, random: () => number): Rodada => {
  const maximo = (casas: number) => (config.inteiroMaximo + 1) * 10 ** casas - 1;
  const casas = inteiro(1, config.casas, random);
  const valor = inteiro(1, maximo(casas), random);

  if (random() < CHANCE_IGUAIS) {
    return embaralharLados(decimal(valor, casas), decimal(valor * 10, casas + 1), random);
  }

  const outrasCasas = inteiro(1, config.casas, random);
  let outroValor = inteiro(1, maximo(outrasCasas), random);

  if (valor * 10 ** outrasCasas === outroValor * 10 ** casas) {
    outroValor += outroValor < maximo(outrasCasas) ? 1 : -1;
  }

  return embaralharLados(decimal(valor, casas), decimal(outroValor, outrasCasas), random);
};

const GERADORES: Record<Exclude<Modalidade, 'misturado'>, (config: ConfigNivel, random: () => number) => Rodada> = {
  tabuada: gerarTabuada,
  fracoes: gerarFracoes,
  decimais: gerarDecimais,
};

export const gerarRodada = (modalidade: Modalidade, nivel: Nivel, random: () => number = Math.random): Rodada => {
  const tipos = Object.keys(GERADORES) as Exclude<Modalidade, 'misturado'>[];
  const tipo = modalidade === 'misturado' ? tipos[inteiro(0, tipos.length - 1, random)] : modalidade;
  return GERADORES[tipo](CONFIG_NIVEL[nivel], random);
};

const explicar = (valor: Valor, outro: Valor) => {
  if (valor.tipo === 'conta') {
    return `${valor.texto} = ${valor.numerador}`;
  }

  if (valor.tipo === 'fracao' && outro.tipo === 'fracao' && valor.denominador !== outro.denominador) {
    const comum = mmc(valor.denominador, outro.denominador);
    return comum === valor.denominador ? valor.texto : `${valor.texto} = ${valor.numerador * (comum / valor.denominador)}/${comum}`;
  }

  if (valor.tipo === 'decimal' && outro.tipo === 'decimal' && casasDe(outro) > casasDe(valor)) {
    return `${valor.texto} = ${formatarDecimal(valor.numerador * 10 ** (casasDe(outro) - casasDe(valor)), casasDe(outro))}`;
  }

  return valor.texto;
};

const SINAIS: Record<Resposta, string> = { esquerda: '>', direita: '<', iguais: '=' };

export const explicarRodada = (rodada: Rodada) => ({
  esquerda: explicar(rodada.esquerda, rodada.direita),
  direita: explicar(rodada.direita, rodada.esquerda),
  sinal: SINAIS[comparar(rodada.esquerda, rodada.direita)],
});
