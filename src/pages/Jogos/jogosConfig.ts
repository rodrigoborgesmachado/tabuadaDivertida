export interface JogoConfig {
  id: string;
  path: string;
  nome: string;
  icone: string;
  descricao: string;
  habilidade: string;
  idade: string;
}

export const jogos: JogoConfig[] = [
  {
    id: 'tabuada',
    path: '/selecionarjogo',
    nome: 'Tabuada Divertida',
    icone: '✖️',
    descricao: 'Responda contas de multiplicação, divisão, adição e subtração contra o relógio.',
    habilidade: 'Tabuada',
    idade: '6+ anos',
  },
  {
    id: '2048',
    path: '/jogo2048',
    nome: '2048',
    icone: '🎲',
    descricao: 'Combine números iguais e crie blocos cada vez maiores até chegar ao 2048.',
    habilidade: 'Lógica e soma',
    idade: '8+ anos',
  },
  {
    id: 'memoria',
    path: '/jogos/memoria-da-tabuada',
    nome: 'Memória da tabuada',
    icone: '🧠',
    descricao: 'Vire as cartas e junte cada conta da tabuada com o seu resultado.',
    habilidade: 'Tabuada e memória',
    idade: '5+ anos',
  },
];

export const isJogoPath = (pathname: string) =>
  jogos.some((jogo) => pathname === jogo.path || pathname.startsWith(`${jogo.path}/`));
