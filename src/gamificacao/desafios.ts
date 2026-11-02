import { jogos } from '../pages/Jogos/jogosConfig';
import type { EventoJogo, Progresso } from './progresso';
import { chaveDia, chaveSemana } from './sequenciaDias';

export type TipoDesafio = 'dia' | 'semana';

type Avancar = (valor: number, evento: EventoJogo, finalizada: boolean, novoDia: boolean) => number;

export interface Desafio {
  id: string;
  tipo: TipoDesafio;
  modelo: string;
  jogo?: string;
  icone: string;
  texto: string;
  meta: number;
  avancar: Avancar;
}

interface ModeloDesafio {
  id: string;
  jogo?: string;
  icone: string;
  criar: (sortear: <T>(opcoes: T[]) => T) => { texto: string; meta: number; avancar: Avancar };
}

const acertos = (evento: EventoJogo) => (evento.contas || []).filter((conta) => conta.correta).length;

const perfeita = (evento: EventoJogo, finalizada: boolean) =>
  finalizada && (evento.contas || []).length > 0 && evento.contas.every((conta) => conta.correta);

const somarPartidas = (jogo?: string): Avancar => (valor, evento, finalizada) =>
  valor + (finalizada && (!jogo || evento.jogo === jogo) ? 1 : 0);

const maiorPeca: Avancar = (valor, evento) => Math.max(valor, evento.maiorPeca || 0);

export const modelosDoDia: ModeloDesafio[] = [
  {
    id: 'tabuada-do',
    jogo: 'tabuada',
    icone: '🧮',
    criar: (sortear) => {
      const tabuada = sortear([3, 4, 5, 6, 7, 8, 9]);
      return {
        texto: `Acerte 5 contas da tabuada do ${tabuada}`,
        meta: 5,
        avancar: (valor, evento) => valor + (evento.contas || []).filter((conta) => conta.correta && conta.fatores?.includes(tabuada)).length,
      };
    },
  },
  {
    id: 'partida-perfeita',
    jogo: 'tabuada',
    icone: '⭐',
    criar: () => ({
      texto: 'Faça uma partida da tabuada sem errar nenhuma conta',
      meta: 1,
      avancar: (valor, evento, finalizada) => valor + (perfeita(evento, finalizada) ? 1 : 0),
    }),
  },
  {
    id: 'um-minuto',
    jogo: 'tabuada',
    icone: '⚡',
    criar: (sortear) => {
      const meta = sortear([10, 15, 20]);
      return {
        texto: `Acerte ${meta} contas em uma partida de até 1 minuto`,
        meta,
        avancar: (valor, evento, finalizada) =>
          finalizada && evento.tempoMedio !== undefined && evento.tempoMedio * (evento.contas || []).length <= 60 ? Math.max(valor, acertos(evento)) : valor,
      };
    },
  },
  {
    id: 'acertos',
    jogo: 'tabuada',
    icone: '✅',
    criar: (sortear) => {
      const meta = sortear([30, 40, 50]);
      return { texto: `Acerte ${meta} contas hoje`, meta, avancar: (valor, evento) => valor + acertos(evento) };
    },
  },
  {
    id: 'peca-2048',
    jogo: '2048',
    icone: '🎲',
    criar: (sortear) => {
      const meta = sortear([128, 256]);
      return { texto: `Chegue à peça ${meta} no 2048`, meta, avancar: maiorPeca };
    },
  },
  {
    id: 'memoria',
    jogo: 'memoria',
    icone: '🧠',
    criar: (sortear) => {
      const meta = sortear([1, 2]);
      return { texto: `Termine ${meta === 1 ? 'uma partida' : `${meta} partidas`} da Memória da tabuada`, meta, avancar: somarPartidas('memoria') };
    },
  },
  {
    id: 'partidas',
    icone: '🎮',
    criar: (sortear) => {
      const meta = sortear([3, 5]);
      return { texto: `Termine ${meta} partidas em qualquer jogo`, meta, avancar: somarPartidas() };
    },
  },
  {
    id: 'sudoku',
    jogo: 'sudoku',
    icone: '🔢',
    criar: () => ({ texto: 'Termine um Sudoku 4×4', meta: 1, avancar: somarPartidas('sudoku') }),
  },
];

export const modelosDaSemana: ModeloDesafio[] = [
  {
    id: 'partidas-perfeitas',
    jogo: 'tabuada',
    icone: '⭐',
    criar: () => ({
      texto: 'Faça 5 partidas perfeitas da tabuada esta semana',
      meta: 5,
      avancar: (valor, evento, finalizada) => valor + (perfeita(evento, finalizada) ? 1 : 0),
    }),
  },
  {
    id: 'acertos',
    jogo: 'tabuada',
    icone: '✅',
    criar: (sortear) => {
      const meta = sortear([150, 200]);
      return { texto: `Acerte ${meta} contas esta semana`, meta, avancar: (valor, evento) => valor + acertos(evento) };
    },
  },
  {
    id: 'peca-2048',
    jogo: '2048',
    icone: '🎲',
    criar: () => ({ texto: 'Chegue à peça 1024 no 2048 esta semana', meta: 1024, avancar: maiorPeca }),
  },
  {
    id: 'partidas',
    icone: '🎮',
    criar: (sortear) => {
      const meta = sortear([15, 20]);
      return { texto: `Termine ${meta} partidas esta semana`, meta, avancar: somarPartidas() };
    },
  },
  {
    id: 'dias',
    icone: '📅',
    criar: (sortear) => {
      const meta = sortear([4, 5]);
      return { texto: `Jogue em ${meta} dias diferentes esta semana`, meta, avancar: (valor, evento, finalizada, novoDia) => valor + (novoDia ? 1 : 0) };
    },
  },
];

export const criarSorteio = (semente: string) => {
  let estado = 0;
  for (let i = 0; i < semente.length; i++) {
    estado = (Math.imul(31, estado) + semente.charCodeAt(i)) | 0;
  }

  return () => {
    estado = (estado + 0x6d2b79f5) | 0;
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const sortearDesafio = (tipo: TipoDesafio, chave: string, modelos: ModeloDesafio[]): Desafio => {
  const aleatorio = criarSorteio(`${tipo}:${chave}`);
  const sortear = <T>(opcoes: T[]) => opcoes[Math.floor(aleatorio() * opcoes.length)];
  const modelo = sortear(modelos.filter((item) => !item.jogo || jogos.some((jogo) => jogo.id === item.jogo)));

  return { id: `${tipo}:${chave}`, tipo, modelo: modelo.id, jogo: modelo.jogo, icone: modelo.icone, ...modelo.criar(sortear) };
};

export const desafioDoDia = (data = new Date()) => sortearDesafio('dia', chaveDia(data), modelosDoDia);

export const desafioDaSemana = (data = new Date()) => sortearDesafio('semana', chaveSemana(data), modelosDaSemana);

export const valorDesafio = (progresso: Progresso, desafio: Desafio) =>
  progresso.desafios[desafio.tipo]?.id === desafio.id ? progresso.desafios[desafio.tipo].valor : 0;

export const desafioConcluido = (progresso: Progresso, desafio: Desafio) => progresso.desafiosConcluidos.includes(desafio.id);

export const aplicarDesafios = (progresso: Progresso, evento: EventoJogo, finalizada: boolean, novoDia: boolean, data: Date) => {
  const proximo: Progresso = { ...progresso, desafios: { ...progresso.desafios }, desafiosConcluidos: [...progresso.desafiosConcluidos] };
  const concluidos: Desafio[] = [];

  [desafioDoDia(data), desafioDaSemana(data)].forEach((desafio) => {
    const valor = desafio.avancar(valorDesafio(progresso, desafio), evento, finalizada, novoDia);
    proximo.desafios[desafio.tipo] = { id: desafio.id, valor };

    if (valor >= desafio.meta && !desafioConcluido(proximo, desafio)) {
      proximo.desafiosConcluidos.push(desafio.id);
      concluidos.push(desafio);
    }
  });

  return { progresso: proximo, concluidos };
};
