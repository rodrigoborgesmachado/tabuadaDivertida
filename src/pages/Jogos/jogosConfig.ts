export interface JogoConfig {
  path: string;
  nome: string;
  icone: string;
  descricao: string;
  habilidade: string;
  idade: string;
}

export const jogos: JogoConfig[] = [
  {
    path: '/selecionarjogo',
    nome: 'Tabuada Divertida',
    icone: '✖️',
    descricao: 'Responda contas de multiplicação, divisão, adição e subtração contra o relógio.',
    habilidade: 'Tabuada',
    idade: '6+ anos',
  },
  {
    path: '/jogo2048',
    nome: '2048',
    icone: '🎲',
    descricao: 'Combine números iguais e crie blocos cada vez maiores até chegar ao 2048.',
    habilidade: 'Lógica e soma',
    idade: '8+ anos',
  },
];

export const isJogoPath = (pathname: string) =>
  jogos.some((jogo) => pathname === jogo.path || pathname.startsWith(`${jogo.path}/`));
