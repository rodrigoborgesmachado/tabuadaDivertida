export const URL_SITE = 'https://www.tabuadadivertida.com';

export interface Metadados {
  titulo: string;
  descricao: string;
}

export const METADADOS_PADRAO: Metadados = {
  titulo: 'Tabuada Divertida',
  descricao: 'Site para prática de tabuda de multiplicação, adição, subtração e divisão. Um jogo online, para resolver o máximo de questões em menos tempo possível.',
};

export const PAGINAS: Record<string, Metadados> = {
  '/': {
    titulo: 'Tabuada Divertida: jogos de matemática para crianças',
    descricao: 'Jogos de matemática online e gratuitos para todas as idades: tabuada, contagem, lógica, sudoku, horas e muito mais, com medalhas, níveis e ranking.',
  },
  '/selecionarjogo': {
    titulo: 'Jogo da tabuada: multiplicação, divisão, adição e subtração | Tabuada Divertida',
    descricao: 'Escolha a operação e pratique a tabuada contra o relógio: multiplicação, divisão, adição, subtração, expressões e o modo aleatório.',
  },
  '/jogos': {
    titulo: 'Jogos de matemática online e gratuitos | Tabuada Divertida',
    descricao: 'Todos os jogos da Tabuada Divertida: tabuada, 2048, memória, maior ou menor, teste de QI, corrida contra o robô, contando bichinhos, sudoku e que horas são.',
  },
  '/jogo2048': {
    titulo: 'Jogo 2048 online: combine os números | Tabuada Divertida',
    descricao: 'Jogue 2048 online: combine números iguais e crie blocos cada vez maiores até chegar ao 2048. Funciona no celular e no computador.',
  },
  '/jogos/memoria-da-tabuada': {
    titulo: 'Jogo da memória da tabuada | Tabuada Divertida',
    descricao: 'Vire as cartas e junte cada conta da tabuada com o seu resultado. Jogo da memória para treinar a tabuada brincando.',
  },
  '/jogos/maior-ou-menor': {
    titulo: 'Maior ou menor: compare contas, frações e decimais | Tabuada Divertida',
    descricao: 'Compare contas, frações e decimais e escolha o maior valor antes do tempo acabar. Treine cálculo mental de forma divertida.',
  },
  '/jogos/teste-de-qi': {
    titulo: 'Teste de QI com Números: desafio de lógica | Tabuada Divertida',
    descricao: 'Faça o Teste de QI com Números: 15 questões de sequências, grades, analogias e pirâmides em dificuldade crescente. Estilo teste de QI, só por diversão.',
  },
  '/jogos/corrida-contra-o-robo': {
    titulo: 'Corrida contra o robô: jogo de tabuada | Tabuada Divertida',
    descricao: 'Aposte corrida contra o robô: cada conta certa da tabuada faz o seu robô avançar uma casa até a linha de chegada.',
  },
  '/jogos/contando-bichinhos': {
    titulo: 'Contando bichinhos: jogo de contagem infantil | Tabuada Divertida',
    descricao: 'Jogo de contagem para crianças pequenas: conte os bichinhos, junte os grupos e descubra qual tem mais, com instruções faladas.',
  },
  '/jogos/sudoku': {
    titulo: 'Sudoku online para crianças e adultos | Tabuada Divertida',
    descricao: 'Jogue sudoku online: do 4×4 e 6×6 para os pequenos ao 9×9 clássico nos níveis fácil, médio e difícil, com dicas.',
  },
  '/jogos/que-horas-sao': {
    titulo: 'Que horas são? Jogo para aprender as horas | Tabuada Divertida',
    descricao: 'Aprenda a ler o relógio de ponteiros, acerte os ponteiros na hora pedida e calcule intervalos de tempo neste jogo educativo.',
  },
  '/ranking': {
    titulo: 'Ranking dos jogos | Tabuada Divertida',
    descricao: 'Veja o ranking dos melhores jogadores da tabuada e dos jogos da Tabuada Divertida e tente chegar ao topo.',
  },
  '/instrucoes': {
    titulo: 'Como jogar a tabuada | Tabuada Divertida',
    descricao: 'Instruções do jogo da tabuada: como escolher a operação, responder as contas, ganhar pontos e entrar no ranking.',
  },
  '/artigos': {
    titulo: 'Artigos sobre tabuada e matemática | Tabuada Divertida',
    descricao: 'Artigos sobre a tabuada, expressões numéricas e dicas para ensinar matemática às crianças de forma divertida.',
  },
  '/artigos/aprender-matematica-com-jogos': {
    titulo: 'Por que aprender matemática com jogos funciona | Tabuada Divertida',
    descricao: 'Entenda por que os jogos ajudam as crianças a aprender matemática e como usar a brincadeira a favor do aprendizado.',
  },
  '/artigos/historia-da-tabuada': {
    titulo: 'A história da tabuada | Tabuada Divertida',
    descricao: 'Conheça a história da tabuada, da Antiguidade à sala de aula de hoje, e como ela se tornou base do ensino da matemática.',
  },
  '/artigos/tabuada': {
    titulo: 'Tabuada de multiplicação e divisão de 1 a 10 | Tabuada Divertida',
    descricao: 'Consulte e pratique a tabuada de multiplicação e divisão de 1 a 10 para reforçar o raciocínio e a memorização das contas básicas.',
  },
  '/artigos/beneficios-jogos-educacionas': {
    titulo: 'Os benefícios dos jogos educacionais na infância | Tabuada Divertida',
    descricao: 'Veja os benefícios dos jogos educacionais para o desenvolvimento das crianças: raciocínio, memória, concentração e motivação.',
  },
  '/artigos/dicas-para-ensinar-matematica-em-casa': {
    titulo: 'Dicas para ensinar matemática em casa | Tabuada Divertida',
    descricao: 'Dicas práticas para ensinar matemática em casa com diversão, usando situações do dia a dia, jogos e brincadeiras.',
  },
  '/artigos/expressoes-numericas': {
    titulo: 'Expressões numéricas: ordem das operações e exemplos | Tabuada Divertida',
    descricao: 'Aprenda a resolver expressões numéricas: ordem das operações, parênteses, colchetes e chaves, com exemplos resolvidos.',
  },
  '/artigos/tabuada-metodos-antigos-x-modernos': {
    titulo: 'Tabuada: métodos antigos x métodos modernos | Tabuada Divertida',
    descricao: 'Compare as formas tradicionais de ensinar a tabuada com as abordagens modernas, veja prós e contras de cada uma e como combiná-las no aprendizado.',
  },
  '/sobre': {
    titulo: 'Sobre | Tabuada Divertida',
    descricao: 'Conheça a Tabuada Divertida, um site gratuito de jogos de matemática para crianças, pais e professores.',
  },
  '/contato': {
    titulo: 'Contato | Tabuada Divertida',
    descricao: 'Fale com a Tabuada Divertida: envie sugestões, dúvidas ou relate problemas nos jogos.',
  },
  '/contribua': {
    titulo: 'Contribua com o projeto | Tabuada Divertida',
    descricao: 'Ajude a manter a Tabuada Divertida gratuita e com novos jogos de matemática para as crianças.',
  },
  '/privacidade': {
    titulo: 'Política de privacidade | Tabuada Divertida',
    descricao: 'Política de privacidade da Tabuada Divertida: quais dados são usados, como são guardados e os seus direitos.',
  },
};

export const ROTAS_INDEXADAS = Object.keys(PAGINAS);

export const metadadosDaRota = (pathname: string) => {
  const rota = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const pagina = PAGINAS[rota];
  return {
    ...(pagina ?? METADADOS_PADRAO),
    canonical: pagina ? `${URL_SITE}${rota}` : null,
    noindex: !pagina,
  };
};

const buscarOuCriar = (documento: Document, seletor: string, tag: string, atributos: Record<string, string>) => {
  let elemento = documento.head.querySelector(seletor);
  if (!elemento) {
    elemento = documento.createElement(tag);
    Object.entries(atributos).forEach(([nome, valor]) => elemento.setAttribute(nome, valor));
    documento.head.appendChild(elemento);
  }
  return elemento;
};

export const aplicarMetadados = (documento: Document, pathname: string) => {
  const { titulo, descricao, canonical, noindex } = metadadosDaRota(pathname);

  documento.title = titulo;
  buscarOuCriar(documento, 'meta[name="description"]', 'meta', { name: 'description' }).setAttribute('content', descricao);

  if (canonical) {
    buscarOuCriar(documento, 'link[rel="canonical"]', 'link', { rel: 'canonical' }).setAttribute('href', canonical);
  } else {
    documento.head.querySelector('link[rel="canonical"]')?.remove();
  }

  if (noindex) {
    buscarOuCriar(documento, 'meta[name="robots"]', 'meta', { name: 'robots' }).setAttribute('content', 'noindex');
  } else {
    documento.head.querySelector('meta[name="robots"]')?.remove();
  }
};
