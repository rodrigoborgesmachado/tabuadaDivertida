import type { Progresso } from '../../gamificacao/progresso';
import { chaveDia } from '../../gamificacao/sequenciaDias';
import { jogos, type JogoConfig } from '../Jogos/jogosConfig';

export const STORAGE_FILTRO = 'tabuada-divertida-filtro-home';

export interface FiltroJogos {
  id: string;
  nome: string;
  incluir: (jogo: JogoConfig) => boolean;
}

export const filtros: FiltroJogos[] = [
  { id: 'todos', nome: 'Todos', incluir: () => true },
  { id: 'tabuada', nome: '✖️ Tabuada', incluir: (jogo) => /tabuada/i.test(jogo.habilidade) },
  { id: 'logica', nome: '🧩 Lógica', incluir: (jogo) => /lógica/i.test(jogo.habilidade) },
  { id: 'contas', nome: '➕ Contas', incluir: (jogo) => /soma|cálculo|frações|decimais|agilidade/i.test(jogo.habilidade) },
  { id: 'pequenos', nome: '🧸 Para os pequenos', incluir: (jogo) => parseInt(jogo.idade, 10) <= 6 },
];

export const rotaDoJogo = (jogo: JogoConfig) => jogo.inicio || jogo.path;

export const jogoParaContinuar = (progresso: Progresso) => {
  const id = progresso.ultimoJogo || progresso.jogosJogados[progresso.jogosJogados.length - 1];
  return jogos.find((jogo) => jogo.id === id);
};

export const jogoFavorito = (progresso: Progresso) => {
  const [favorito] = jogos
    .filter((jogo) => (progresso.partidasPorJogo[jogo.id] || 0) > 0)
    .sort((a, b) => progresso.partidasPorJogo[b.id] - progresso.partidasPorJogo[a.id]);
  return favorito?.id;
};

export const ehNovo = (jogo: JogoConfig, data = new Date()) => !!jogo.novoAte && chaveDia(data) <= jogo.novoAte;

export const lerFiltro = () => {
  try {
    const salvo = window.localStorage.getItem(STORAGE_FILTRO);
    return filtros.some((filtro) => filtro.id === salvo) ? (salvo as string) : 'todos';
  } catch {
    return 'todos';
  }
};

export const salvarFiltro = (filtro: string) => {
  try {
    window.localStorage.setItem(STORAGE_FILTRO, filtro);
  } catch {}
};
