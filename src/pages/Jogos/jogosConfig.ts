export interface JogoConfig {
  id: string;
  path: string;
  nome: string;
  icone: string;
  descricao: string;
  habilidade: string;
  idade: string;
  inicio?: string;
  novoAte?: string;
  comoJogar?: string[];
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
    comoJogar: [
      'Use as setas do teclado, deslize o dedo ou toque nos botões para mover todos os blocos.',
      'Quando dois blocos com o mesmo número se encontram, eles viram um só com a soma dos dois.',
      'Junte os blocos até chegar ao 2048. Se errar, você pode desfazer um passo.',
    ],
  },
  {
    id: 'memoria',
    path: '/jogos/memoria-da-tabuada',
    nome: 'Memória da tabuada',
    icone: '🧠',
    descricao: 'Vire as cartas e junte cada conta da tabuada com o seu resultado.',
    habilidade: 'Tabuada e memória',
    idade: '5+ anos',
    comoJogar: [
      'Escolha a tabuada e o nível e comece o jogo.',
      'Vire duas cartas por vez e tente juntar cada conta com o seu resultado.',
      'Encontre todos os pares com o menor número de jogadas e no menor tempo.',
    ],
  },
  {
    id: 'maior-ou-menor',
    path: '/jogos/maior-ou-menor',
    nome: 'Maior ou menor',
    icone: '⚖️',
    descricao: 'Compare contas, frações e decimais e escolha o maior valor antes do tempo acabar.',
    habilidade: 'Cálculo mental, frações e decimais',
    idade: '7+ anos',
    comoJogar: [
      'Escolha o tipo de valores e o nível e comece o jogo.',
      'Compare os dois valores e escolha o maior ou diga que são iguais.',
      'Cada acerto vale pontos e cada erro tira segundos do relógio. Acerte o máximo antes do tempo acabar!',
    ],
  },
  {
    id: 'teste-qi',
    path: '/jogos/teste-de-qi',
    nome: 'Teste de QI com Números',
    icone: '🧩',
    descricao: 'Desafio estilo teste de QI: descubra o padrão de sequências, grades, analogias e pirâmides de números.',
    habilidade: 'Lógica e padrões numéricos',
    idade: '8+ anos',
  },
  {
    id: 'corrida-robo',
    path: '/jogos/corrida-contra-o-robo',
    nome: 'Corrida contra o robô',
    icone: '🏁',
    descricao: 'Aposte corrida contra o robô do site: cada conta certa faz o seu robô avançar uma casa até a linha de chegada.',
    habilidade: 'Tabuada e agilidade',
    idade: '6+ anos',
    novoAte: '2026-12-31',
  },
  {
    id: 'contando-bichinhos',
    path: '/jogos/contando-bichinhos',
    nome: 'Contando bichinhos',
    icone: '🐥',
    descricao: 'Conte os bichinhos, junte os grupos e descubra qual tem mais, tocando nos números e ouvindo as instruções.',
    habilidade: 'Contagem e primeiras somas',
    idade: '4+ anos',
    novoAte: '2026-12-31',
    comoJogar: [
      'Escolha até quanto contar: 5, 10 ou 20.',
      'Ouça a instrução (toque em 🔊 para ouvir de novo) e responda tocando nos bichinhos, nos grupos ou nos números.',
      'São 8 desafios sem relógio. Ao final, ganhe até 3 estrelas!',
    ],
  },
  {
    id: 'sudoku',
    path: '/jogos/sudoku',
    nome: 'Sudoku',
    icone: '🔢',
    descricao: 'Preencha a grade sem repetir números nas linhas, colunas e blocos, do 4×4 para os pequenos ao 9×9 clássico.',
    habilidade: 'Lógica e concentração',
    idade: '5+ anos',
    novoAte: '2026-12-31',
    comoJogar: [
      'Escolha o tamanho: 4×4 ou 6×6 para começar, ou o 9×9 clássico nos níveis fácil, médio e difícil.',
      'Toque numa casa vazia e escolha o número no teclado da tela. No computador, use as setas e as teclas numéricas.',
      'Cada número só pode aparecer uma vez em cada linha, coluna e bloco. Se travar, use uma dica!',
    ],
  },
  {
    id: 'que-horas-sao',
    path: '/jogos/que-horas-sao',
    nome: 'Que horas são?',
    icone: '🕒',
    descricao: 'Aprenda a ler o relógio de ponteiros, acerte os ponteiros na hora pedida e calcule intervalos de tempo.',
    habilidade: 'Leitura de horas e cálculo de tempo',
    idade: '7+ anos',
    novoAte: '2026-12-31',
    comoJogar: [
      'Escolha o modo: ler o relógio ou acertar os ponteiros, o nível e se quer ver as horas em digital ou por extenso.',
      'Toque na hora certa ou arraste os ponteiros: o grande marca os minutos e o pequeno marca as horas.',
      'São 10 questões. Se errar, veja o relógio com a hora certa e a explicação!',
    ],
  },
];

export const isJogoPath = (pathname: string) =>
  jogos.some((jogo) => pathname === jogo.path || pathname.startsWith(`${jogo.path}/`));
