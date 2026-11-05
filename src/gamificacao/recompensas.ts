import { buscarMedalha, NIVEIS, nomeNivel } from './medalhas';
import { lerProgresso, type Progresso } from './progresso';
import { calcularNivel, nivelNaCurvaAnterior, xpTotalDoNivel } from './xp';

export const STORAGE_PERSONALIZACAO = 'tabuada-divertida-personalizacao';
export const EVENTO_PERSONALIZACAO = 'tabuada-divertida-personalizacao';
export const STORAGE_RECOMPENSAS_VISTAS = 'tabuada-divertida-recompensas-vistas';
export const EVENTO_RECOMPENSAS_VISTAS = 'tabuada-divertida-recompensas-vistas';
export const QUALQUER_MEDALHA = 'qualquer';

export type TipoRecompensa = 'cor' | 'acessorio' | 'tema';
export type Espaco = 'cabeca' | 'rosto' | 'pescoco' | 'costas' | 'mao';
export type Raridade = 'comum' | 'rara' | 'epica' | 'lendaria';

export interface Recompensa {
  id: string;
  tipo: TipoRecompensa;
  nome: string;
  icone: string;
  valor?: string;
  degrade?: string[];
  brilho?: boolean;
  raridade?: Raridade;
  espaco?: Espaco;
  nivel?: number;
  medalha?: { id: string; nivel: number };
}

export type Personalizacao = Record<'cor' | 'tema' | Espaco, string>;

export const ESPACOS: { id: Espaco; nome: string }[] = [
  { id: 'cabeca', nome: '🎩 Cabeça' },
  { id: 'rosto', nome: '👓 Rosto' },
  { id: 'pescoco', nome: '🎀 Pescoço' },
  { id: 'costas', nome: '🦸 Costas' },
  { id: 'mao', nome: '✋ Mão' },
];

export const RARIDADES: { id: Raridade; nome: string }[] = [
  { id: 'comum', nome: 'Comum' },
  { id: 'rara', nome: 'Rara' },
  { id: 'epica', nome: 'Épica' },
  { id: 'lendaria', nome: 'Lendária' },
];

const cor = (id: string, nome: string, icone: string, valor: string, raridade: Raridade, condicao: Partial<Recompensa> = {}): Recompensa =>
  ({ id, tipo: 'cor', nome, icone, valor, raridade, ...condicao });

const acessorio = (id: string, espaco: Espaco, nome: string, icone: string, condicao: Partial<Recompensa>): Recompensa =>
  ({ id, tipo: 'acessorio', espaco, nome, icone, ...condicao });

const tema = (id: string, nome: string, icone: string, condicao: Partial<Recompensa> = {}): Recompensa =>
  ({ id: `tema-${id}`, tipo: 'tema', nome, icone, valor: id, ...condicao });

const medalha = (id: string, nivel = 1) => ({ medalha: { id, nivel } });

export const recompensas: Recompensa[] = [
  cor('cor-prata', 'Prata', '⚪', '#cccccc', 'comum'),
  cor('cor-azul', 'Azul céu', '🔵', '#7cc6f2', 'comum', { nivel: 2 }),
  cor('cor-vermelho', 'Vermelho tomate', '🔴', '#f2685a', 'comum', { nivel: 3 }),
  cor('cor-verde', 'Verde menta', '🟢', '#8fdcb0', 'comum', { nivel: 4 }),
  cor('cor-rosa', 'Rosa chiclete', '🩷', '#f7a1c4', 'comum', { nivel: 5 }),
  cor('cor-laranja', 'Laranja', '🟠', '#ffb067', 'comum', { nivel: 6 }),
  cor('cor-amarelo', 'Amarelo limão', '🟡', '#f4e66b', 'comum', { nivel: 7 }),
  cor('cor-turquesa', 'Turquesa', '🩵', '#5fd3c9', 'comum', { nivel: 8 }),
  cor('cor-marinho', 'Azul marinho', '🔵', '#4a6fa5', 'comum', { nivel: 9 }),
  cor('cor-floresta', 'Verde floresta', '🌲', '#4f9d69', 'comum', { nivel: 11 }),
  cor('cor-lilas', 'Lilás', '🪻', '#c9b3e8', 'comum', { nivel: 12 }),
  cor('cor-coral', 'Coral', '🪸', '#ff8c75', 'comum', { nivel: 13 }),
  cor('cor-chocolate', 'Marrom chocolate', '🍫', '#9a6b4f', 'comum', { nivel: 14 }),
  cor('cor-grafite', 'Grafite', '⚫', '#7a7f87', 'comum', { nivel: 15 }),
  cor('cor-neve', 'Branco neve', '⚪', '#f7f9fc', 'comum', { nivel: 16 }),
  cor('cor-pessego', 'Pêssego', '🍑', '#ffc8a2', 'comum', { nivel: 17 }),
  cor('cor-roxa', 'Roxo galáctico', '🟣', '#b79cf0', 'rara', { nivel: 10 }),
  cor('cor-dourada', 'Dourado', '🟡', '#f2c94c', 'rara', medalha('partida-perfeita', 3)),
  cor('cor-verde-neon', 'Verde neon', '💚', '#5cff7a', 'rara', { nivel: 18 }),
  cor('cor-rosa-neon', 'Rosa neon', '💗', '#ff4fb8', 'rara', { nivel: 20 }),
  cor('cor-azul-eletrico', 'Azul elétrico', '💙', '#2f7bff', 'rara', { nivel: 22 }),
  cor('cor-rubi', 'Vermelho rubi', '♦️', '#c2185b', 'rara', { nivel: 24 }),
  cor('cor-esmeralda', 'Esmeralda', '💎', '#1fa774', 'rara', { nivel: 26 }),
  cor('cor-safira', 'Safira', '🔷', '#2952a3', 'rara', { nivel: 28 }),
  cor('cor-bronze', 'Bronze', '🥉', '#c08457', 'rara', medalha('partidas-jogadas', 2)),
  cor('cor-cobre', 'Cobre', '🟤', '#b8673e', 'rara', medalha('constancia', 3)),
  cor('cor-arco-iris', 'Arco-íris', '🌈', '#ff6b6b', 'epica', { nivel: 30, degrade: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#b07cff'] }),
  cor('cor-holografico', 'Holográfico', '🪩', '#c3f0ff', 'epica', { nivel: 33, degrade: ['#c3f0ff', '#f5c2ff', '#fff3b0', '#b8ffd9'], brilho: true }),
  cor('cor-por-do-sol', 'Pôr do sol', '🌇', '#ff9a5a', 'epica', { nivel: 36, degrade: ['#ffd36b', '#ff9a5a', '#e8577e'] }),
  cor('cor-aurora', 'Aurora boreal', '🌌', '#5fe0b0', 'epica', { nivel: 40, degrade: ['#5fe0b0', '#4fa8e8', '#9b7bf0'] }),
  cor('cor-metalico', 'Metálico prateado', '🔩', '#c9d1db', 'epica', { nivel: 45, degrade: ['#eef2f6', '#a9b3bf', '#eef2f6'], brilho: true }),
  cor('cor-ouro', 'Ouro puro', '🏅', '#f2c94c', 'epica', { nivel: 50, degrade: ['#fff1a8', '#f2c94c', '#c9931e'], brilho: true }),
  cor('cor-diamante', 'Diamante', '💎', '#bdeeff', 'lendaria', { ...medalha(QUALQUER_MEDALHA, 4), degrade: ['#ffffff', '#bdeeff', '#7fd3f7'], brilho: true }),
  cor('cor-galaxia', 'Galáxia estrelada', '✨', '#3b2a7a', 'lendaria', { ...medalha('perfeccionista'), degrade: ['#1c1446', '#3b2a7a', '#8a4fc7'], brilho: true }),
  cor('cor-lava', 'Lava', '🌋', '#ff5a1f', 'lendaria', { ...medalha('acertos-seguidos', 4), degrade: ['#ffd23f', '#ff5a1f', '#a3120f'], brilho: true }),
  acessorio('bone', 'cabeca', 'Boné', '🧢', { nivel: 3 }),
  acessorio('fones', 'cabeca', 'Fones de ouvido', '🎧', { nivel: 7 }),
  acessorio('antena-coracao', 'cabeca', 'Antena de coração', '💖', { nivel: 9 }),
  acessorio('chapeu-cowboy', 'cabeca', 'Chapéu de cowboy', '🤠', { nivel: 11 }),
  acessorio('chapeu-mago', 'cabeca', 'Chapéu de mago', '🧙', { nivel: 14 }),
  acessorio('gorro', 'cabeca', 'Gorro de inverno', '🧶', { nivel: 16 }),
  acessorio('chapeu-pirata', 'cabeca', 'Chapéu de pirata', '🏴‍☠️', { nivel: 19 }),
  acessorio('tiara-flores', 'cabeca', 'Tiara de flores', '🌸', { nivel: 23 }),
  acessorio('capacete-astronauta', 'cabeca', 'Capacete de astronauta', '👩‍🚀', { nivel: 27 }),
  acessorio('chapeu-chef', 'cabeca', 'Chapéu de chef', '👨‍🍳', { nivel: 31 }),
  acessorio('aureola', 'cabeca', 'Auréola', '😇', { nivel: 37 }),
  acessorio('chifres-unicornio', 'cabeca', 'Chifres de unicórnio', '🦄', { nivel: 42 }),
  acessorio('cartola', 'cabeca', 'Cartola', '🎩', medalha('acertos-seguidos', 2)),
  acessorio('coroa', 'cabeca', 'Coroa', '👑', medalha('tabuada-completa')),
  acessorio('chapeu-formatura', 'cabeca', 'Chapéu de formatura', '🎓', medalha('quatro-operacoes')),
  acessorio('oculos', 'rosto', 'Óculos', '👓', { nivel: 5 }),
  acessorio('oculos-escuros', 'rosto', 'Óculos escuros', '🕶️', { nivel: 13 }),
  acessorio('bigode', 'rosto', 'Bigode', '🥸', { nivel: 17 }),
  acessorio('monoculo', 'rosto', 'Monóculo', '🧐', { nivel: 21 }),
  acessorio('mascara-heroi', 'rosto', 'Máscara de herói', '🦹', { nivel: 25 }),
  acessorio('tapa-olho', 'rosto', 'Tapa-olho', '🏴‍☠️', { nivel: 29 }),
  acessorio('oculos-laboratorio', 'rosto', 'Óculos de laboratório', '🥽', medalha('mestre-dos-padroes', 2)),
  acessorio('gravata', 'pescoco', 'Gravata borboleta', '🎀', medalha('constancia')),
  acessorio('lenco', 'pescoco', 'Lenço', '🧣', { nivel: 10 }),
  acessorio('gravata-social', 'pescoco', 'Gravata', '👔', { nivel: 15 }),
  acessorio('cachecol', 'pescoco', 'Cachecol', '🧣', { nivel: 20 }),
  acessorio('colar-perolas', 'pescoco', 'Colar de pérolas', '📿', { nivel: 38 }),
  acessorio('medalha-ouro', 'pescoco', 'Medalha de ouro', '🥇', medalha('partida-perfeita', 4)),
  acessorio('mochila', 'costas', 'Mochila', '🎒', { nivel: 4 }),
  acessorio('capa', 'costas', 'Capa de herói', '🦸', { nivel: 8 }),
  acessorio('asas-borboleta', 'costas', 'Asas de borboleta', '🦋', { nivel: 32 }),
  acessorio('asas-anjo', 'costas', 'Asas de anjo', '🪽', { nivel: 44 }),
  acessorio('capa-mago', 'costas', 'Capa de mago', '🧙', { nivel: 47 }),
  acessorio('jato', 'costas', 'Jato propulsor', '🚀', medalha('resposta-rapida', 4)),
  acessorio('lapis', 'mao', 'Lápis gigante', '✏️', { nivel: 2 }),
  acessorio('regua', 'mao', 'Régua', '📏', { nivel: 6 }),
  acessorio('varinha', 'mao', 'Varinha mágica', '🪄', { nivel: 18 }),
  acessorio('balao', 'mao', 'Balão', '🎈', { nivel: 24 }),
  acessorio('guitarra', 'mao', 'Guitarra', '🎸', { nivel: 35 }),
  acessorio('calculadora', 'mao', 'Calculadora', '🧮', medalha('sem-pressa-sem-erro')),
  acessorio('trofeu', 'mao', 'Troféu', '🏆', medalha('recordista')),
  { id: 'tema-padrao', tipo: 'tema', nome: 'Padrão', icone: '🎨' },
  tema('por-do-sol', 'Pôr do sol', '🌅', { nivel: 5 }),
  tema('doces', 'Doces', '🍬', { nivel: 9 }),
  tema('galaxia', 'Galáxia', '🌌', { nivel: 12 }),
  tema('jardim', 'Jardim', '🌷', { nivel: 14 }),
  tema('deserto', 'Deserto', '🏜️', { nivel: 18 }),
  tema('neve', 'Neve', '❄️', { nivel: 22 }),
  tema('biblioteca', 'Biblioteca', '📚', { nivel: 26 }),
  tema('fundo-do-mar', 'Fundo do mar', '🐠', { nivel: 30 }),
  tema('vulcao', 'Vulcão', '🌋', { nivel: 35 }),
  tema('arco-iris', 'Arco-íris', '🌈', { nivel: 40 }),
  tema('oceano', 'Oceano', '🌊', medalha('partidas-jogadas')),
  tema('floresta', 'Floresta', '🌳', medalha('constancia', 2)),
  tema('cyberpunk', 'Cyberpunk', '🤖', medalha('resposta-rapida', 3)),
  tema('espaco-profundo', 'Espaço profundo', '🪐', medalha('constancia', 4)),
];

const RECOMPENSAS_DA_CURVA_ANTERIOR = [
  'cor-prata', 'cor-azul', 'cor-verde', 'cor-laranja', 'cor-roxa', 'cor-dourada',
  'bone', 'oculos', 'gravata', 'capa', 'cartola', 'coroa',
  'tema-padrao', 'tema-oceano', 'tema-floresta', 'tema-galaxia',
];

export const PERSONALIZACAO_PADRAO: Personalizacao = { cor: 'cor-prata', tema: 'tema-padrao', cabeca: '', rosto: '', pescoco: '', costas: '', mao: '' };

export const buscarRecompensa = (id: string) => recompensas.find((recompensa) => recompensa.id === id);

export const chaveDaRecompensa = (recompensa: Recompensa): keyof Personalizacao => recompensa.espaco || (recompensa.tipo === 'tema' ? 'tema' : 'cor');

const nivelDaMedalha = (progresso: Progresso, id: string) =>
  id === QUALQUER_MEDALHA
    ? Math.max(0, ...Object.values(progresso.medalhas).map((obtida) => obtida.nivel))
    : progresso.medalhas[id]?.nivel || 0;

const condicaoCumprida = (recompensa: Recompensa, progresso: Progresso, nivel: number) =>
  (!recompensa.nivel || nivel >= recompensa.nivel) &&
  (!recompensa.medalha || nivelDaMedalha(progresso, recompensa.medalha.id) >= recompensa.medalha.nivel);

export const recompensaLiberada = (recompensa: Recompensa, progresso: Progresso) =>
  progresso.recompensasLiberadas.includes(recompensa.id) || condicaoCumprida(recompensa, progresso, calcularNivel(progresso.xp).nivel);

export const recompensasLiberadas = (progresso: Progresso) => recompensas.filter((recompensa) => recompensaLiberada(recompensa, progresso));

export const idsLiberados = (progresso: Progresso) => recompensasLiberadas(progresso).map((recompensa) => recompensa.id);

export const idsLiberadosNaCurvaAnterior = (progresso: Progresso) => {
  const nivel = nivelNaCurvaAnterior(progresso.xp);
  return recompensas
    .filter((recompensa) => RECOMPENSAS_DA_CURVA_ANTERIOR.includes(recompensa.id) && condicaoCumprida(recompensa, progresso, nivel))
    .map((recompensa) => recompensa.id);
};

export const proximaRecompensa = (progresso: Progresso) => {
  const nivel = calcularNivel(progresso.xp).nivel;
  const proxima = recompensas
    .filter((recompensa) => recompensa.nivel && recompensa.nivel > nivel && !recompensa.medalha && !recompensaLiberada(recompensa, progresso))
    .sort((a, b) => (a.nivel || 0) - (b.nivel || 0))[0];

  return proxima && { recompensa: proxima, xpFaltando: xpTotalDoNivel(proxima.nivel || 0) - progresso.xp };
};

const salvarVistas = (ids: string[]) => {
  try {
    window.localStorage.setItem(STORAGE_RECOMPENSAS_VISTAS, JSON.stringify(ids));
  } catch {}
};

const lerVistas = (): string[] | null => {
  try {
    const vistas = JSON.parse(window.localStorage.getItem(STORAGE_RECOMPENSAS_VISTAS) || 'null');
    return Array.isArray(vistas) ? vistas : null;
  } catch {
    return null;
  }
};

export const recompensasNaoVistas = (progresso = lerProgresso()) => {
  const liberadas = recompensasLiberadas(progresso);
  const vistas = lerVistas();

  if (!vistas) {
    salvarVistas(liberadas.map((recompensa) => recompensa.id));
    return [];
  }

  return liberadas.filter((recompensa) => !vistas.includes(recompensa.id));
};

export const marcarRecompensasVistas = (progresso = lerProgresso(), tipo?: TipoRecompensa) => {
  const liberadas = recompensasLiberadas(progresso).filter((recompensa) => !tipo || recompensa.tipo === tipo).map((recompensa) => recompensa.id);
  salvarVistas(tipo ? Array.from(new Set([...(lerVistas() || []), ...liberadas])) : liberadas);
  window.dispatchEvent(new Event(EVENTO_RECOMPENSAS_VISTAS));
};

export const condicaoRecompensa = (recompensa: Recompensa, nivelAtual?: number) => {
  if (recompensa.nivel) {
    return nivelAtual ? `Nível ${recompensa.nivel} · você está no ${nivelAtual}` : `Chegue ao nível ${recompensa.nivel}`;
  }

  if (recompensa.medalha?.id === QUALQUER_MEDALHA) {
    return `Conquiste qualquer medalha no nível ${NIVEIS[recompensa.medalha.nivel - 1]}`;
  }

  const medalha = recompensa.medalha && buscarMedalha(recompensa.medalha.id);
  if (!medalha || !recompensa.medalha) {
    return '';
  }

  const nivel = nomeNivel(medalha, recompensa.medalha.nivel);
  return `Conquiste a medalha ${medalha.icone} ${medalha.nome}${nivel ? ` · ${nivel}` : ''}`;
};

export const lerPersonalizacao = (progresso = lerProgresso()): Personalizacao => {
  let salva: Partial<Personalizacao> & { acessorio?: string } = {};
  try {
    salva = JSON.parse(window.localStorage.getItem(STORAGE_PERSONALIZACAO) || '{}') || {};
  } catch {}

  const anterior = buscarRecompensa(salva.acessorio || '');
  if (anterior?.espaco && !salva[anterior.espaco]) {
    salva = { ...salva, [anterior.espaco]: anterior.id };
  }

  const escolher = (chave: keyof Personalizacao) => {
    const recompensa = buscarRecompensa(salva[chave] || '');
    return recompensa && chaveDaRecompensa(recompensa) === chave && recompensaLiberada(recompensa, progresso) ? recompensa.id : PERSONALIZACAO_PADRAO[chave];
  };

  return {
    cor: escolher('cor'),
    tema: escolher('tema'),
    cabeca: escolher('cabeca'),
    rosto: escolher('rosto'),
    pescoco: escolher('pescoco'),
    costas: escolher('costas'),
    mao: escolher('mao'),
  };
};

export const sortearPersonalizacao = (personalizacao: Personalizacao, progresso: Progresso, aleatorio = Math.random): Personalizacao => {
  const sortear = (opcoes: string[]) => opcoes[Math.floor(aleatorio() * opcoes.length)];
  const liberadas = recompensasLiberadas(progresso);

  return {
    ...personalizacao,
    cor: sortear(liberadas.filter((recompensa) => recompensa.tipo === 'cor').map((recompensa) => recompensa.id)),
    ...Object.fromEntries(ESPACOS.map((espaco) => [
      espaco.id,
      sortear(['', ...liberadas.filter((recompensa) => recompensa.espaco === espaco.id).map((recompensa) => recompensa.id)]),
    ])),
  };
};

export const salvarPersonalizacao = (personalizacao: Personalizacao) => {
  try {
    window.localStorage.setItem(STORAGE_PERSONALIZACAO, JSON.stringify(personalizacao));
  } catch {}

  window.dispatchEvent(new CustomEvent<Personalizacao>(EVENTO_PERSONALIZACAO, { detail: personalizacao }));
};
