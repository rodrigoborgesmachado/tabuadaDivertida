import { aplicarDesafios, type Desafio, type TipoDesafio } from './desafios';
import { FATORES, medalhas, nivelAlcancado, type Medalha } from './medalhas';
import { PARES_POR_NIVEL, type Nivel } from '../pages/MemoriaTabuada/logic';
import { TEMPO_MEDIO_SEM_TITUBEAR, TOTAL_QUESTOES } from '../pages/TesteQi/logic';
import { CASAS_PADRAO, type NivelRobo } from '../pages/CorridaRobo/logic';
import { chaveDia, chaveSemana, diasEntre, registrarDia } from './sequenciaDias';
import { idsLiberados, idsLiberadosNaCurvaAnterior } from './recompensas';
import { calcularNivel, nivelNaCurvaAnterior, xpDaPartida, xpDasMedalhas, xpDoDesafio, xpDoJogo, xpInicial, type NivelXp } from './xp';
import { gravarItem } from '../services/armazenamento';
import { ativarBoosters, boostersAtivados, multiplicadorDeXp, type BoosterAtivado } from './boosters';

export const STORAGE_KEY = 'tabuada-divertida-progresso';
export const EVENTO_CONQUISTAS = 'tabuada-divertida-conquistas';
export const EVENTO_DESAFIOS = 'tabuada-divertida-desafios';
export const EVENTO_NIVEL = 'tabuada-divertida-nivel';
export const EVENTO_BOOSTERS = 'tabuada-divertida-boosters';
export const VERSAO_PROGRESSO = 5;
export const MINIMO_CONTAS = 20;
export const MAXIMO_CONTAS = 100;
export const DIAS_MESTRE = 7;

export interface MedalhaObtida {
  nivel: number;
  data: string;
}

export interface Progresso {
  versao: number;
  partidas: number;
  partidasPerfeitas: number;
  partidasNoturnas: number;
  partidasMadrugada: number;
  partidasPalindromas: number;
  perfeitasPorModo: Record<string, number>;
  acertosPorModo: Record<string, number>;
  sequenciaPorModo: Record<string, number>;
  melhorSequenciaPorModo: Record<string, number>;
  melhorTempoMedioPorModo: Record<string, number>;
  maiorPerfeitaPorModo: Record<string, number>;
  contasAcimaDe50: number;
  maratonas: number;
  voltasPorCima: number;
  recordesBatidos: number;
  acertos: number;
  teimosia: Record<string, { erros: number; acertos: number }>;
  teimoso: number;
  jogosJogados: string[];
  ultimoJogo: string;
  partidasPorJogo: Record<string, number>;
  sequenciaAtual: number;
  melhorSequencia: number;
  melhorTempoMedio: number;
  maiorPeca: number;
  maiorPecaSemDesfazer: number;
  maiorPontuacao2048: number;
  memoriasDeElefante: number;
  memoriasRelampago: number;
  memoriasSemDesperdicio: number;
  padroesAcertados: number;
  gabaritos: number;
  semTitubear: number;
  vitoriasContraCampeao: number;
  sudokusPorModo: Record<string, number>;
  melhorTempoSudokuPorModo: Record<string, number>;
  sudokusSemAjudaPorModo: Record<string, number>;
  sudokusSemBorracha: number;
  sudokusSilenciosos: number;
  diasComSudoku: number;
  ultimoDiaSudoku: string;
  tabuadas: Record<string, Record<string, string>>;
  divisoes: Record<string, Record<string, string>>;
  medalhas: Record<string, MedalhaObtida>;
  ultimoDia: string;
  diasSeguidos: number;
  melhorDiasSeguidos: number;
  folgas: number;
  fimDeSemana: { semana: string; dias: number[] };
  finsDeSemana: number;
  desafios: Partial<Record<TipoDesafio, { id: string; valor: number }>>;
  desafiosConcluidos: string[];
  xp: number;
  recompensasLiberadas: string[];
  nivelDoTitulo: number;
  boosters: Record<string, number>;
}

export interface ContaRespondida {
  correta: boolean;
  fatores?: [number, number];
  divisao?: [number, number];
  texto?: string;
}

export interface EventoJogo {
  jogo: string;
  contas?: ContaRespondida[];
  tempoMedio?: number;
  maiorPeca?: number;
  modo?: string;
  pontuacao?: number;
  recorde?: number;
  desfez?: boolean;
  nivel?: Nivel;
  jogadas?: number;
  tempo?: number;
  desperdicio?: boolean;
  nivelRobo?: NivelRobo;
  casas?: number;
  venceu?: boolean;
  dicasUsadas?: number;
  marcouErros?: boolean;
}

export interface Conquista {
  medalha: Medalha;
  nivel: number;
}

export interface NivelAlcancado extends NivelXp {
  nivelAnterior: number;
}

export const criarProgresso = (): Progresso => ({
  versao: VERSAO_PROGRESSO,
  partidas: 0,
  partidasPerfeitas: 0,
  partidasNoturnas: 0,
  partidasMadrugada: 0,
  partidasPalindromas: 0,
  perfeitasPorModo: {},
  acertosPorModo: {},
  sequenciaPorModo: {},
  melhorSequenciaPorModo: {},
  melhorTempoMedioPorModo: {},
  maiorPerfeitaPorModo: {},
  contasAcimaDe50: 0,
  maratonas: 0,
  voltasPorCima: 0,
  recordesBatidos: 0,
  acertos: 0,
  teimosia: {},
  teimoso: 0,
  jogosJogados: [],
  ultimoJogo: '',
  partidasPorJogo: {},
  sequenciaAtual: 0,
  melhorSequencia: 0,
  melhorTempoMedio: 0,
  maiorPeca: 0,
  maiorPecaSemDesfazer: 0,
  maiorPontuacao2048: 0,
  memoriasDeElefante: 0,
  memoriasRelampago: 0,
  memoriasSemDesperdicio: 0,
  padroesAcertados: 0,
  gabaritos: 0,
  semTitubear: 0,
  vitoriasContraCampeao: 0,
  sudokusPorModo: {},
  melhorTempoSudokuPorModo: {},
  sudokusSemAjudaPorModo: {},
  sudokusSemBorracha: 0,
  sudokusSilenciosos: 0,
  diasComSudoku: 0,
  ultimoDiaSudoku: '',
  tabuadas: {},
  divisoes: {},
  medalhas: {},
  ultimoDia: '',
  diasSeguidos: 0,
  melhorDiasSeguidos: 0,
  folgas: 0,
  fimDeSemana: { semana: '', dias: [] },
  finsDeSemana: 0,
  desafios: {},
  desafiosConcluidos: [],
  xp: 0,
  recompensasLiberadas: [],
  nivelDoTitulo: 0,
  boosters: {},
});

const migrarProgresso = (dados: Partial<Progresso>): Progresso => {
  const progresso: Progresso = {
    ...criarProgresso(),
    ...dados,
    ...((dados.versao || 0) < 2 ? { tabuadas: {} } : {}),
    versao: VERSAO_PROGRESSO,
  };

  const comXp = typeof dados.xp === 'number' ? progresso : { ...progresso, xp: xpInicial(progresso) };

  return (dados.versao || 0) < 4
    ? { ...comXp, recompensasLiberadas: idsLiberadosNaCurvaAnterior(comXp), nivelDoTitulo: nivelNaCurvaAnterior(comXp.xp) }
    : comXp;
};

export const lerProgresso = (): Progresso => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const dados = stored ? JSON.parse(stored) : null;
    return dados && typeof dados === 'object' ? migrarProgresso(dados) : criarProgresso();
  } catch {
    return criarProgresso();
  }
};

const salvarProgresso = (progresso: Progresso) => {
  try {
    gravarItem(STORAGE_KEY, JSON.stringify(progresso));
  } catch {}
};

const descartarVencidas = (tabuadas: Progresso['tabuadas'], hoje: string) =>
  Object.fromEntries(Object.entries(tabuadas).map(([tabuada, acertadas]) => [
    tabuada,
    Object.fromEntries(Object.entries(acertadas).filter(([, dia]) => diasEntre(dia, hoje) < DIAS_MESTRE)),
  ]));

const marcarConta = (tabuadas: Progresso['tabuadas'], tabuada: number, fator: number, correta: boolean, hoje: string) => {
  if (!FATORES.includes(tabuada) || !FATORES.includes(fator)) {
    return;
  }

  const { [fator]: _, ...acertadas } = tabuadas[tabuada] || {};
  tabuadas[tabuada] = correta ? { ...acertadas, [fator]: hoje } : acertadas;
};

const marcarTeimosia = (proximo: Progresso, conta: ContaRespondida) => {
  if (!conta.texto || proximo.teimoso) {
    return;
  }

  const atual = proximo.teimosia[conta.texto];
  if (!conta.correta) {
    proximo.teimosia = { ...proximo.teimosia, [conta.texto]: { erros: (atual?.erros || 0) + 1, acertos: 0 } };
  } else if (atual) {
    const acertos = atual.acertos + 1;
    proximo.teimoso = atual.erros >= 3 && acertos >= 5 ? 1 : 0;
    proximo.teimosia = proximo.teimoso ? {} : { ...proximo.teimosia, [conta.texto]: { ...atual, acertos } };
  }
};

const resultadoDaSomaOuSubtracao = (texto = '') => {
  const conta = /^(\d+)([+-])(\d+)$/.exec(texto);
  if (!conta) {
    return 0;
  }

  return conta[2] === '+' ? Number(conta[1]) + Number(conta[3]) : Number(conta[1]) - Number(conta[3]);
};

const registrarModo = (proximo: Progresso, modo: string, contas: ContaRespondida[], acertos: number) => {
  let sequencia = proximo.sequenciaPorModo[modo] || 0;
  let melhor = proximo.melhorSequenciaPorModo[modo] || 0;

  contas.forEach((conta) => {
    sequencia = conta.correta ? sequencia + 1 : 0;
    melhor = Math.max(melhor, sequencia);
  });

  proximo.acertosPorModo = { ...proximo.acertosPorModo, [modo]: (proximo.acertosPorModo[modo] || 0) + acertos };
  proximo.sequenciaPorModo = { ...proximo.sequenciaPorModo, [modo]: sequencia };
  proximo.melhorSequenciaPorModo = { ...proximo.melhorSequenciaPorModo, [modo]: melhor };
};

const ehPalindromo = (valor: number) => valor >= 10 && String(valor) === String(valor).split('').reverse().join('');

const registrarFimDeSemana = (proximo: Progresso, data: Date) => {
  const diaSemana = data.getDay();
  if (diaSemana !== 0 && diaSemana !== 6) {
    return;
  }

  const semana = chaveSemana(data);
  const dias = proximo.fimDeSemana.semana === semana ? proximo.fimDeSemana.dias : [];
  if (dias.includes(diaSemana)) {
    return;
  }

  proximo.fimDeSemana = { semana, dias: [...dias, diaSemana] };
  proximo.finsDeSemana += dias.length === 1 ? 1 : 0;
};

const registrarMemoria = (proximo: Progresso, evento: EventoJogo) => {
  if (!evento.nivel) {
    return;
  }

  if (evento.nivel === 'dificil' && evento.jogadas && evento.jogadas <= PARES_POR_NIVEL.dificil * 1.5) {
    proximo.memoriasDeElefante += 1;
  }

  if (evento.nivel === 'medio' && evento.tempo !== undefined && evento.tempo < 60) {
    proximo.memoriasRelampago += 1;
  }

  if (evento.desperdicio === false) {
    proximo.memoriasSemDesperdicio += 1;
  }
};

const registrarTesteQi = (proximo: Progresso, evento: EventoJogo, acertos: number) => {
  if (evento.jogo !== 'teste-qi') {
    return;
  }

  proximo.padroesAcertados += acertos;

  if (acertos === TOTAL_QUESTOES) {
    proximo.gabaritos += 1;
    proximo.semTitubear += evento.tempo !== undefined && evento.tempo / TOTAL_QUESTOES <= TEMPO_MEDIO_SEM_TITUBEAR ? 1 : 0;
  }
};

const registrarCorrida = (proximo: Progresso, evento: EventoJogo) => {
  if (evento.jogo === 'corrida-robo' && evento.venceu && evento.nivelRobo === 'campeao' && (evento.casas ?? CASAS_PADRAO) >= CASAS_PADRAO) {
    proximo.vitoriasContraCampeao += 1;
  }
};

const registrarSudoku = (proximo: Progresso, evento: EventoJogo, data: Date) => {
  if (evento.jogo !== 'sudoku' || !evento.modo) {
    return;
  }

  const modo = evento.modo;
  const semAjuda = !evento.dicasUsadas && !evento.marcouErros;
  const melhorTempo = proximo.melhorTempoSudokuPorModo[modo] || 0;

  proximo.sudokusPorModo = { ...proximo.sudokusPorModo, [modo]: (proximo.sudokusPorModo[modo] || 0) + 1 };

  if (evento.tempo && (melhorTempo === 0 || evento.tempo < melhorTempo)) {
    proximo.melhorTempoSudokuPorModo = { ...proximo.melhorTempoSudokuPorModo, [modo]: evento.tempo };
  }

  if (semAjuda) {
    proximo.sudokusSemAjudaPorModo = { ...proximo.sudokusSemAjudaPorModo, [modo]: (proximo.sudokusSemAjudaPorModo[modo] || 0) + 1 };
  }

  if (evento.desfez === false && (modo === '9x9-medio' || modo === '9x9-dificil')) {
    proximo.sudokusSemBorracha += 1;
  }

  if (evento.desfez === false && semAjuda && modo === '9x9-dificil') {
    proximo.sudokusSilenciosos += 1;
  }

  if (proximo.ultimoDiaSudoku !== chaveDia(data)) {
    proximo.diasComSudoku += 1;
    proximo.ultimoDiaSudoku = chaveDia(data);
  }
};

export const aplicarEvento = (progresso: Progresso, evento: EventoJogo, finalizada: boolean, data: Date): Progresso => {
  const proximo: Progresso = {
    ...progresso,
    jogosJogados: progresso.jogosJogados.includes(evento.jogo) ? progresso.jogosJogados : [...progresso.jogosJogados, evento.jogo],
    ultimoJogo: evento.jogo,
    tabuadas: descartarVencidas(progresso.tabuadas, chaveDia(data)),
    divisoes: descartarVencidas(progresso.divisoes, chaveDia(data)),
  };
  const contas = evento.contas || [];
  const acertos = contas.filter((conta) => conta.correta).length;

  contas.forEach((conta) => {
    proximo.sequenciaAtual = conta.correta ? proximo.sequenciaAtual + 1 : 0;
    proximo.melhorSequencia = Math.max(proximo.melhorSequencia, proximo.sequenciaAtual);
    marcarTeimosia(proximo, conta);

    if (conta.fatores) {
      const [a, b] = conta.fatores;
      marcarConta(proximo.tabuadas, a, b, conta.correta, chaveDia(data));
      marcarConta(proximo.tabuadas, b, a, conta.correta, chaveDia(data));
    }

    if (conta.divisao) {
      const [dividendo, divisor] = conta.divisao;
      marcarConta(proximo.divisoes, divisor, dividendo / divisor, conta.correta, chaveDia(data));
    }

    proximo.contasAcimaDe50 += conta.correta && resultadoDaSomaOuSubtracao(conta.texto) > 50 ? 1 : 0;
  });
  proximo.acertos += acertos;

  if (evento.modo && contas.length > 0) {
    registrarModo(proximo, evento.modo, contas, acertos);
  }

  if (evento.maiorPeca && evento.maiorPeca > proximo.maiorPeca) {
    proximo.maiorPeca = evento.maiorPeca;
  }

  if (evento.maiorPeca && evento.desfez === false && evento.maiorPeca > proximo.maiorPecaSemDesfazer) {
    proximo.maiorPecaSemDesfazer = evento.maiorPeca;
  }

  if (evento.jogo === '2048' && evento.pontuacao && evento.pontuacao > proximo.maiorPontuacao2048) {
    proximo.maiorPontuacao2048 = evento.pontuacao;
  }

  if (!finalizada) {
    return proximo;
  }

  proximo.partidas += 1;
  proximo.partidasPorJogo = { ...proximo.partidasPorJogo, [evento.jogo]: (proximo.partidasPorJogo[evento.jogo] || 0) + 1 };

  const hora = data.getHours();
  if (hora >= 22 || hora < 5) {
    proximo.partidasNoturnas += 1;
  }

  if (hora >= 5 && hora < 7) {
    proximo.partidasMadrugada += 1;
  }

  if (evento.pontuacao && ehPalindromo(evento.pontuacao)) {
    proximo.partidasPalindromas += 1;
  }

  if (evento.recorde && evento.pontuacao && evento.pontuacao > evento.recorde) {
    proximo.recordesBatidos += 1;
  }

  if (contas.length >= MINIMO_CONTAS && acertos === contas.length) {
    proximo.partidasPerfeitas += 1;
    proximo.maratonas += contas.length >= MAXIMO_CONTAS ? 1 : 0;

    if (evento.modo) {
      proximo.perfeitasPorModo = { ...proximo.perfeitasPorModo, [evento.modo]: (proximo.perfeitasPorModo[evento.modo] || 0) + 1 };
      proximo.maiorPerfeitaPorModo = { ...proximo.maiorPerfeitaPorModo, [evento.modo]: Math.max(proximo.maiorPerfeitaPorModo[evento.modo] || 0, contas.length) };

      const melhorTempoNoModo = proximo.melhorTempoMedioPorModo[evento.modo] || 0;
      if (evento.tempoMedio && (melhorTempoNoModo === 0 || evento.tempoMedio < melhorTempoNoModo)) {
        proximo.melhorTempoMedioPorModo = { ...proximo.melhorTempoMedioPorModo, [evento.modo]: evento.tempoMedio };
      }
    }

    if (evento.tempoMedio && (proximo.melhorTempoMedio === 0 || evento.tempoMedio < proximo.melhorTempoMedio)) {
      proximo.melhorTempoMedio = evento.tempoMedio;
    }
  }

  if (contas.length > 3 && contas.slice(0, 3).every((conta) => !conta.correta) && acertos / contas.length >= 0.9) {
    proximo.voltasPorCima += 1;
  }

  registrarMemoria(proximo, evento);
  registrarTesteQi(proximo, evento, acertos);
  registrarCorrida(proximo, evento);
  registrarSudoku(proximo, evento, data);
  registrarFimDeSemana(proximo, data);

  return registrarDia(proximo, data);
};

export const avaliarMedalhas = (progresso: Progresso, data: Date) => {
  const obtidas = { ...progresso.medalhas };
  const novas: Conquista[] = [];

  medalhas.forEach((medalha) => {
    const nivel = nivelAlcancado(medalha, { ...progresso, medalhas: obtidas });

    if (nivel > (obtidas[medalha.id]?.nivel || 0)) {
      obtidas[medalha.id] = { nivel, data: data.toISOString() };
      novas.push({ medalha, nivel });
    }
  });

  return { progresso: { ...progresso, medalhas: obtidas }, novas };
};

const registrar = (evento: EventoJogo, finalizada: boolean, data: Date) => {
  const anterior = lerProgresso();
  const novoDia = finalizada && anterior.ultimoDia !== chaveDia(data);
  const desafios = aplicarDesafios(aplicarEvento(anterior, evento, finalizada, data), evento, finalizada, novoDia, data);
  const { progresso: avaliado, novas } = avaliarMedalhas(desafios.progresso, data);
  const contas = evento.contas || [];
  const ganho = (finalizada ? xpDaPartida(avaliado.acertos - anterior.acertos, contas.length > 0 && contas.every((conta) => conta.correta), xpDoJogo(evento)) * multiplicadorDeXp(anterior, data) : 0) +
    desafios.concluidos.reduce((total, desafio) => total + xpDoDesafio(desafio.tipo), 0) +
    xpDasMedalhas(avaliado.medalhas) - xpDasMedalhas(anterior.medalhas);
  const comXp = { ...ativarBoosters(avaliado, anterior, desafios.concluidos, data), xp: avaliado.xp + ganho };
  const progresso = { ...comXp, recompensasLiberadas: idsLiberados(comXp) };
  salvarProgresso(progresso);

  if (desafios.concluidos.length > 0) {
    window.dispatchEvent(new CustomEvent<Desafio[]>(EVENTO_DESAFIOS, { detail: desafios.concluidos }));
  }

  if (novas.length > 0) {
    window.dispatchEvent(new CustomEvent<Conquista[]>(EVENTO_CONQUISTAS, { detail: novas }));
  }

  const boosters = boostersAtivados(anterior, progresso, data);
  if (boosters.length > 0) {
    window.dispatchEvent(new CustomEvent<BoosterAtivado[]>(EVENTO_BOOSTERS, { detail: boosters }));
  }

  const nivel = calcularNivel(progresso.xp, progresso.nivelDoTitulo);
  const nivelAnterior = calcularNivel(anterior.xp).nivel;
  if (nivel.nivel > nivelAnterior) {
    window.dispatchEvent(new CustomEvent<NivelAlcancado>(EVENTO_NIVEL, { detail: { ...nivel, nivelAnterior } }));
  }

  return novas;
};

export const partidaFinalizada = (evento: EventoJogo, data = new Date()) => registrar(evento, true, data);

export const registrarProgresso = (evento: EventoJogo, data = new Date()) => registrar(evento, false, data);

export const contasDaTabuada = (questoes: { questao: string; correta: boolean }[]): ContaRespondida[] =>
  questoes.map((questao) => {
    const multiplicacao = /^(\d+)x(\d+)$/.exec(questao.questao);
    const divisao = /^(\d+)÷(\d+)$/.exec(questao.questao);
    if (divisao) {
      return { correta: questao.correta, divisao: [Number(divisao[1]), Number(divisao[2])], texto: questao.questao };
    }

    return multiplicacao
      ? { correta: questao.correta, fatores: [Number(multiplicacao[1]), Number(multiplicacao[2])], texto: questao.questao }
      : { correta: questao.correta, texto: questao.questao };
  });
