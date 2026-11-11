import regras from './xp.json';
import type { TipoDesafio } from './desafios';
import { buscarMedalha } from './medalhas';
import { MINIMO_CONTAS, type EventoJogo, type Progresso } from './progresso';

export interface NivelXp {
  nivel: number;
  titulo: string;
  xpNoNivel: number;
  xpDoNivel: number;
}

const somar = (valores: number[]) => valores.reduce((total, valor) => total + valor, 0);

const xpDoSudoku = (modo: string, semAjuda: boolean) => {
  const base = (regras.sudoku as Record<string, number>)[modo] ?? regras.partidaConcluida;

  return base + (semAjuda ? Math.round(base * regras.sudokuSemAjuda) : 0);
};

export const xpDoJogo = (evento: EventoJogo) => {
  if (evento.jogo === 'sudoku') {
    return xpDoSudoku(evento.modo || '', !evento.dicasUsadas && !evento.marcouErros);
  }

  if (evento.jogo === '2048') {
    return regras.pecas2048.reduce((xp, item) => ((evento.maiorPeca || 0) >= item.peca ? item.xp : xp), regras.partidaConcluida);
  }

  return (evento.jogo === 'memoria' && evento.nivel && regras.memoria[evento.nivel]) || regras.partidaConcluida;
};

export const xpDaPartidaPerfeita = (acertos: number) => Math.max(Math.floor(acertos * regras.partidaPerfeitaPorAcerto), regras.partidaPerfeitaMinimo);

export const xpDaPartida = (acertos: number, perfeita: boolean, base = regras.partidaConcluida) =>
  base + Math.min(acertos * regras.porAcerto, regras.maximoPorAcertos) + (perfeita ? xpDaPartidaPerfeita(acertos) : 0);

export const xpDoDesafio = (tipo: TipoDesafio) => (tipo === 'dia' ? regras.desafioDoDia : regras.desafioDaSemana);

export const xpDasMedalhas = (obtidas: Progresso['medalhas']) =>
  somar(Object.entries(obtidas).map(([id, { nivel }]) => {
    const medalha = buscarMedalha(id);
    if (!medalha) {
      return 0;
    }

    return medalha.metas.length > 1 ? somar(regras.medalhaPorNivel.slice(0, nivel)) : regras.medalhaUnica;
  }));

export const xpInicial = (progresso: Progresso) =>
  progresso.partidas * regras.partidaConcluida +
  progresso.acertos * regras.porAcerto +
  progresso.partidasPerfeitas * xpDaPartidaPerfeita(MINIMO_CONTAS) +
  somar(Object.entries(progresso.sudokusPorModo).map(([modo, partidas]) => partidas * (xpDoSudoku(modo, false) - regras.partidaConcluida))) +
  somar(progresso.desafiosConcluidos.map((id) => xpDoDesafio(id.startsWith('dia:') ? 'dia' : 'semana'))) +
  xpDasMedalhas(progresso.medalhas);

export const xpParaSubir = (nivel: number) => regras.primeiroNivel + regras.aumentoPorNivel * (nivel - 1);

export const tituloDoNivel = (nivel: number) =>
  regras.titulos.reduce((titulo, item) => (nivel >= item.nivel ? item.titulo : titulo), regras.titulos[0].titulo);

export const xpTotalDoNivel = (nivel: number) => somar(Array.from({ length: Math.max(nivel - 1, 0) }, (_, indice) => xpParaSubir(indice + 1)));

const nivelDoXp = (xp: number, paraSubir: (nivel: number) => number) => {
  let nivel = 1;
  let inicio = 0;

  while (xp >= inicio + paraSubir(nivel)) {
    inicio += paraSubir(nivel);
    nivel += 1;
  }

  return { nivel, inicio };
};

export const nivelNaCurvaAnterior = (xp: number) => nivelDoXp(xp, (nivel) => 100 + 50 * (nivel - 1)).nivel;

export const calcularNivel = (xp: number, nivelDoTitulo = 0): NivelXp => {
  const { nivel, inicio } = nivelDoXp(xp, xpParaSubir);

  return { nivel, titulo: tituloDoNivel(Math.max(nivel, nivelDoTitulo)), xpNoNivel: Math.max(xp - inicio, 0), xpDoNivel: xpParaSubir(nivel) };
};
