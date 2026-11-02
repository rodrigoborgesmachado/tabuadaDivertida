import { buscarMedalha, nomeNivel } from './medalhas';
import { lerProgresso, type Progresso } from './progresso';
import { calcularNivel } from './xp';

export const STORAGE_PERSONALIZACAO = 'tabuada-divertida-personalizacao';
export const EVENTO_PERSONALIZACAO = 'tabuada-divertida-personalizacao';

export type TipoRecompensa = 'cor' | 'acessorio' | 'tema';

export interface Recompensa {
  id: string;
  tipo: TipoRecompensa;
  nome: string;
  icone: string;
  valor?: string;
  nivel?: number;
  medalha?: { id: string; nivel: number };
}

export type Personalizacao = Record<TipoRecompensa, string>;

export const recompensas: Recompensa[] = [
  { id: 'cor-prata', tipo: 'cor', nome: 'Prata', icone: '⚪', valor: '#cccccc' },
  { id: 'cor-azul', tipo: 'cor', nome: 'Azul céu', icone: '🔵', valor: '#7cc6f2', nivel: 2 },
  { id: 'cor-verde', tipo: 'cor', nome: 'Verde menta', icone: '🟢', valor: '#8fdcb0', nivel: 4 },
  { id: 'cor-laranja', tipo: 'cor', nome: 'Laranja', icone: '🟠', valor: '#ffb067', nivel: 6 },
  { id: 'cor-roxa', tipo: 'cor', nome: 'Roxo galáctico', icone: '🟣', valor: '#b79cf0', nivel: 10 },
  { id: 'cor-dourada', tipo: 'cor', nome: 'Dourado', icone: '🟡', valor: '#f2c94c', medalha: { id: 'partida-perfeita', nivel: 3 } },
  { id: 'sem-acessorio', tipo: 'acessorio', nome: 'Nenhum', icone: '🤖' },
  { id: 'bone', tipo: 'acessorio', nome: 'Boné', icone: '🧢', nivel: 3 },
  { id: 'oculos', tipo: 'acessorio', nome: 'Óculos', icone: '👓', nivel: 5 },
  { id: 'gravata', tipo: 'acessorio', nome: 'Gravata borboleta', icone: '🎀', medalha: { id: 'constancia', nivel: 1 } },
  { id: 'capa', tipo: 'acessorio', nome: 'Capa de herói', icone: '🦸', nivel: 8 },
  { id: 'cartola', tipo: 'acessorio', nome: 'Cartola', icone: '🎩', medalha: { id: 'acertos-seguidos', nivel: 2 } },
  { id: 'coroa', tipo: 'acessorio', nome: 'Coroa', icone: '👑', medalha: { id: 'tabuada-completa', nivel: 1 } },
  { id: 'tema-padrao', tipo: 'tema', nome: 'Padrão', icone: '🎨' },
  { id: 'tema-oceano', tipo: 'tema', nome: 'Oceano', icone: '🌊', valor: 'oceano', medalha: { id: 'partidas-jogadas', nivel: 1 } },
  { id: 'tema-floresta', tipo: 'tema', nome: 'Floresta', icone: '🌳', valor: 'floresta', medalha: { id: 'constancia', nivel: 2 } },
  { id: 'tema-galaxia', tipo: 'tema', nome: 'Galáxia', icone: '🌌', valor: 'galaxia', nivel: 12 },
];

export const PERSONALIZACAO_PADRAO: Personalizacao = { cor: 'cor-prata', acessorio: 'sem-acessorio', tema: 'tema-padrao' };

export const buscarRecompensa = (id: string) => recompensas.find((recompensa) => recompensa.id === id);

export const recompensaLiberada = (recompensa: Recompensa, progresso: Progresso) =>
  (!recompensa.nivel || calcularNivel(progresso.xp).nivel >= recompensa.nivel) &&
  (!recompensa.medalha || (progresso.medalhas[recompensa.medalha.id]?.nivel || 0) >= recompensa.medalha.nivel);

export const condicaoRecompensa = (recompensa: Recompensa) => {
  if (recompensa.nivel) {
    return `Chegue ao nível ${recompensa.nivel}`;
  }

  const medalha = recompensa.medalha && buscarMedalha(recompensa.medalha.id);
  if (!medalha || !recompensa.medalha) {
    return '';
  }

  const nivel = nomeNivel(medalha, recompensa.medalha.nivel);
  return `Conquiste a medalha ${medalha.icone} ${medalha.nome}${nivel ? ` · ${nivel}` : ''}`;
};

export const lerPersonalizacao = (progresso = lerProgresso()): Personalizacao => {
  let salva: Partial<Personalizacao> = {};
  try {
    salva = JSON.parse(window.localStorage.getItem(STORAGE_PERSONALIZACAO) || '{}') || {};
  } catch {}

  const escolher = (tipo: TipoRecompensa) => {
    const recompensa = buscarRecompensa(salva[tipo] || '');
    return recompensa && recompensa.tipo === tipo && recompensaLiberada(recompensa, progresso) ? recompensa.id : PERSONALIZACAO_PADRAO[tipo];
  };

  return { cor: escolher('cor'), acessorio: escolher('acessorio'), tema: escolher('tema') };
};

export const salvarPersonalizacao = (personalizacao: Personalizacao) => {
  try {
    window.localStorage.setItem(STORAGE_PERSONALIZACAO, JSON.stringify(personalizacao));
  } catch {}

  window.dispatchEvent(new CustomEvent<Personalizacao>(EVENTO_PERSONALIZACAO, { detail: personalizacao }));
};
