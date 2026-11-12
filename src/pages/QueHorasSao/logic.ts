export type Nivel = 'facil' | 'medio' | 'dificil';

export type Modo = 'ler' | 'acertar';

export type Formato = 'digital' | 'extenso';

export interface Questao {
  inicio: number;
  resposta: number;
  intervalo?: number;
  opcoes: number[];
}

export const TOTAL_QUESTOES = 10;
export const MINUTOS_DO_RELOGIO = 720;
export const PASSO_NIVEL: Record<Nivel, number> = { facil: 30, medio: 5, dificil: 1 };
export const PASSO_ARRASTE: Record<Nivel, number> = { facil: 5, medio: 5, dificil: 1 };
const CHANCE_INTERVALO = 0.5;
const INTERVALO_MAXIMO = 90;
const TOTAL_OPCOES = 4;

const UNIDADES = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
const DEZENAS = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta'];
const NOMES_DAS_HORAS = ['', 'uma', 'duas', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'meio-dia'];

const inteiro = (min: number, max: number, random: () => number) => Math.floor(random() * (max - min + 1)) + min;

const embaralhar = <T,>(itens: T[], random: () => number) => {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
};

export const normalizar = (minutos: number) => ((minutos % MINUTOS_DO_RELOGIO) + MINUTOS_DO_RELOGIO) % MINUTOS_DO_RELOGIO;

export const hora = (horas: number, minutos: number) => normalizar(horas * 60 + minutos);

export const horaDe = (minutos: number) => Math.floor(normalizar(minutos) / 60) || 12;

export const minutoDe = (minutos: number) => normalizar(minutos) % 60;

const doisDigitos = (valor: number) => String(valor).padStart(2, '0');

export const formatarDigital = (minutos: number) => `${doisDigitos(horaDe(minutos))}:${doisDigitos(minutoDe(minutos))}`;

export const numeroPorExtenso = (numero: number) =>
  numero < 20 ? UNIDADES[numero] : `${DEZENAS[Math.floor(numero / 10)]}${numero % 10 ? ` e ${UNIDADES[numero % 10]}` : ''}`;

const artigo = (horas: number) => (horas === 1 ? 'a' : horas === 12 ? 'o' : 'as');

export const formatarExtenso = (minutos: number) => {
  const horas = horaDe(minutos);
  const minuto = minutoDe(minutos);

  if (minuto === 0) {
    return horas === 12 ? 'meio-dia' : horas === 1 ? 'uma hora' : `${NOMES_DAS_HORAS[horas]} horas`;
  }

  if (minuto === 30) {
    return `${NOMES_DAS_HORAS[horas]} e meia`;
  }

  if (minuto > 30 && minuto % 5 === 0) {
    const proxima = horaDe(minutos + 60);
    return `${numeroPorExtenso(60 - minuto)} para ${artigo(proxima)} ${NOMES_DAS_HORAS[proxima]}`;
  }

  return `${NOMES_DAS_HORAS[horas]} e ${numeroPorExtenso(minuto)}`;
};

export const formatar = (minutos: number, formato: Formato) => (formato === 'digital' ? formatarDigital(minutos) : formatarExtenso(minutos));

const sortearHora = (nivel: Nivel, random: () => number) => {
  const passo = PASSO_NIVEL[nivel];
  return inteiro(0, MINUTOS_DO_RELOGIO / passo - 1, random) * passo;
};

const ponteirosTrocados = (minutos: number) => hora(Math.floor(minutoDe(minutos) / 5), (horaDe(minutos) % 12) * 5);

export const gerarOpcoes = (resposta: number, nivel: Nivel, random = Math.random) => {
  const passo = PASSO_NIVEL[nivel];
  const vizinho = Math.max(passo, 5);
  const candidatas = embaralhar([resposta + 60, resposta - 60, ponteirosTrocados(resposta), resposta + vizinho, resposta - vizinho], random)
    .map(normalizar)
    .filter((opcao) => opcao % passo === 0);
  const opcoes = [resposta];

  candidatas.forEach((opcao) => {
    if (opcoes.length < TOTAL_OPCOES && !opcoes.includes(opcao)) {
      opcoes.push(opcao);
    }
  });

  while (opcoes.length < TOTAL_OPCOES) {
    const opcao = sortearHora(nivel, random);
    if (!opcoes.includes(opcao)) {
      opcoes.push(opcao);
    }
  }

  return embaralhar(opcoes, random);
};

export const gerarQuestao = (nivel: Nivel, random = Math.random): Questao => {
  if (nivel === 'dificil' && random() < CHANCE_INTERVALO) {
    const inicio = sortearHora(nivel, random);
    const intervalo = inteiro(1, INTERVALO_MAXIMO / 5, random) * 5;
    const resposta = normalizar(inicio + intervalo);
    return { inicio, resposta, intervalo, opcoes: gerarOpcoes(resposta, nivel, random) };
  }

  const resposta = sortearHora(nivel, random);
  return { inicio: resposta, resposta, opcoes: gerarOpcoes(resposta, nivel, random) };
};

export const gerarPartida = (nivel: Nivel, random = Math.random) => {
  const questoes: Questao[] = [];

  for (let tentativa = 0; questoes.length < TOTAL_QUESTOES; tentativa++) {
    const questao = gerarQuestao(nivel, random);
    if (tentativa > 100 || !questoes.some((item) => item.resposta === questao.resposta)) {
      questoes.push(questao);
    }
  }

  return questoes;
};

export const inicioDosPonteiros = (questao: Questao) => {
  if (questao.intervalo) {
    return questao.inicio;
  }

  return questao.resposta === 0 ? hora(3, 0) : 0;
};

export const acertou = (questao: Questao, minutos: number) => normalizar(minutos) === questao.resposta;

const verbo = (minutos: number, formato: Formato) => {
  const texto = formatar(minutos, formato);
  return (formato === 'digital' ? horaDe(minutos) === 1 : /^(uma|meio-dia)/.test(texto)) ? `É ${texto}` : `São ${texto}`;
};

export const pergunta = (questao: Questao, modo: Modo, formato: Formato) => {
  if (questao.intervalo) {
    return `${verbo(questao.inicio, formato)}. Que horas serão daqui a ${questao.intervalo} minutos?`;
  }

  return modo === 'ler' ? 'Que horas o relógio está marcando?' : `Coloque os ponteiros em ${formatar(questao.resposta, formato)}.`;
};

const posicaoDoPonteiroGrande = (minuto: number) =>
  minuto % 5 === 0 ? `no ${minuto / 5 || 12}` : `entre o ${Math.floor(minuto / 5) || 12} e o ${Math.floor(minuto / 5) + 1}`;

const posicaoDoPonteiroPequeno = (minutos: number) =>
  minutoDe(minutos) === 0 ? `no ${horaDe(minutos)}` : `entre o ${horaDe(minutos)} e o ${horaDe(minutos + 60)}`;

export const explicar = (questao: Questao) => {
  const horas = horaDe(questao.resposta);
  const minuto = minutoDe(questao.resposta);
  const marcaMinutos = minuto === 0 ? 'a hora cheia' : `${minuto} ${minuto === 1 ? 'minuto' : 'minutos'}`;
  const ponteiros = `O ponteiro pequeno ${posicaoDoPonteiroPequeno(questao.resposta)} marca ${horas} ${horas === 1 ? 'hora' : 'horas'} e o grande ${posicaoDoPonteiroGrande(minuto)} marca ${marcaMinutos}.`;

  return questao.intervalo
    ? `${formatarDigital(questao.inicio)} + ${questao.intervalo} minutos = ${formatarDigital(questao.resposta)}. ${ponteiros}`
    : ponteiros;
};

export const anguloDoPonteiroDosMinutos = (minutos: number) => minutoDe(minutos) * 6;

export const anguloDoPonteiroDasHoras = (minutos: number) => normalizar(minutos) / 2;

export const anguloDoPonto = (dx: number, dy: number) => ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;

export const moverMinutos = (atual: number, angulo: number, passo: number) => {
  const alvo = (Math.round(angulo / 6 / passo) * passo) % 60;
  let diferenca = alvo - minutoDe(atual);

  if (diferenca > 30) {
    diferenca -= 60;
  }

  if (diferenca < -30) {
    diferenca += 60;
  }

  return normalizar(atual + diferenca);
};

export const moverHoras = (atual: number, angulo: number) => {
  const minuto = minutoDe(atual);
  return hora(Math.round(angulo / 30 - minuto / 60), minuto);
};
