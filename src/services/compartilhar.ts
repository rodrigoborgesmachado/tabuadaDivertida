import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { createElement } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { toast } from 'react-toastify';
import RoboPersonalizado from '../components/RoboPersonalizado/RoboPersonalizado';
import { desafioDaSemana, desafioDoDia } from '../gamificacao/desafios';
import { buscarMedalha, nomeNivel } from '../gamificacao/medalhas';
import type { Progresso } from '../gamificacao/progresso';
import { calcularNivel } from '../gamificacao/xp';
import { lerNome } from './jogador';
import { ehApp, urlDoSite } from './plataforma';

export const MAXIMO_CONQUISTAS = 3;
export const TAMANHO_IMAGEM = 1080;
export const NOME_IMAGEM = 'tabuada-divertida.png';

export interface ConquistaPartida {
  icone: string;
  texto: string;
}

export interface ResultadoCompartilhado {
  jogo: string;
  linhas: string[];
  convite: string;
  resumo: string;
  conquistas?: ConquistaPartida[];
}

const paraBase64 = (arquivo: Blob) => new Promise<string>((resolve, reject) => {
  const leitor = new FileReader();
  leitor.onload = () => resolve(String(leitor.result).split(',')[1] || '');
  leitor.onerror = reject;
  leitor.readAsDataURL(arquivo);
});

const imagemNoCache = async (imagem: File) => {
  try {
    const { uri } = await Filesystem.writeFile({ path: NOME_IMAGEM, data: await paraBase64(imagem), directory: Directory.Cache });
    return [uri];
  } catch {
    return undefined;
  }
};

const compartilharNoApp = async (title: string, text: string, imagem?: File | null) => {
  try {
    await Share.share({ title, text, files: imagem ? await imagemNoCache(imagem) : undefined });
  } catch {}
};

export const compartilhar = async (title: string, text: string) => {
  if (ehApp()) {
    await compartilharNoApp(title, text);
    return;
  }

  try {
    if (navigator.share) {
      await navigator.share({ title, text });
      return;
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      toast.success('Texto copiado para compartilhar.');
      return;
    }

    window.prompt('Copie para compartilhar:', text);
  } catch {}
};

export const conquistaDaMedalha = (id: string, nivel: number): ConquistaPartida[] => {
  const medalha = buscarMedalha(id);
  const nome = medalha ? nomeNivel(medalha, nivel) : '';
  return medalha ? [{ icone: medalha.icone, texto: `${medalha.nome}${nome ? ` · ${nome}` : ''}` }] : [];
};

export const conquistasDaPartida = (anterior: Progresso, atual: Progresso, data = new Date()): ConquistaPartida[] => {
  const medalhas = Object.entries(atual.medalhas)
    .filter(([id, obtida]) => obtida.nivel > (anterior.medalhas[id]?.nivel || 0))
    .flatMap(([id, obtida]) => conquistaDaMedalha(id, obtida.nivel));
  const nivel = calcularNivel(atual.xp, atual.nivelDoTitulo);
  const subiu = nivel.nivel > calcularNivel(anterior.xp).nivel ? [{ icone: '🆙', texto: `Subi para o nível ${nivel.nivel}: ${nivel.titulo}` }] : [];
  const desafios = [desafioDoDia(data), desafioDaSemana(data)]
    .filter((desafio) => atual.desafiosConcluidos.includes(desafio.id) && !anterior.desafiosConcluidos.includes(desafio.id))
    .map((desafio) => ({ icone: desafio.icone, texto: `Desafio ${desafio.tipo === 'dia' ? 'do dia' : 'da semana'} concluído: ${desafio.texto}` }));

  return [...medalhas, ...subiu, ...desafios];
};

export const linhasDasConquistas = (conquistas: ConquistaPartida[]) => {
  const restantes = conquistas.length - MAXIMO_CONQUISTAS;

  return conquistas.length === 0 ? [] : [
    '🏅 Conquistas desta partida:',
    ...conquistas.slice(0, MAXIMO_CONQUISTAS).map((conquista) => `${conquista.icone} ${conquista.texto}`),
    ...(restantes > 0 ? [`+${restantes} ${restantes === 1 ? 'conquista' : 'conquistas'}`] : []),
  ];
};

export const montarTextoResultado = ({ linhas, convite, conquistas = [] }: ResultadoCompartilhado) =>
  [...linhas, ...linhasDasConquistas(conquistas), '', convite].join('\n');

export const resultadoDaConquista = (conquista: ConquistaPartida): ResultadoCompartilhado => ({
  jogo: 'Tabuada Divertida',
  linhas: ['Ganhei uma nova conquista no Tabuada Divertida!'],
  convite: `Duvido você me superar 👉 ${urlDoSite()}`,
  resumo: 'Nova conquista!',
  conquistas: [conquista],
});

export const podeCompartilharArquivos = () => {
  if (ehApp()) {
    return true;
  }

  try {
    return typeof File !== 'undefined' && 'canShare' in navigator &&
      (navigator as any).canShare({ files: [new File([''], NOME_IMAGEM, { type: 'image/png' })] });
  } catch {
    return false;
  }
};

const carregarImagem = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const imagem = new Image();
  imagem.onload = () => resolve(imagem);
  imagem.onerror = reject;
  imagem.src = src;
});

const imagemDoRobo = () => {
  const elemento = document.createElement('div');
  const raiz = createRoot(elemento);
  flushSync(() => raiz.render(createElement(RoboPersonalizado, { titulo: '' })));
  const svg = elemento.innerHTML
    .replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="280"')
    .replace('viewBox="0 0 100 100"', 'viewBox="-30 -30 160 140"')
    .replace('class="robo-brilho"', 'class="robo-brilho" opacity="0.35"');
  raiz.unmount();

  return carregarImagem(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
};

const retangulo = (contexto: CanvasRenderingContext2D, x: number, y: number, largura: number, altura: number, raio: number) => {
  contexto.beginPath();
  contexto.moveTo(x + raio, y);
  contexto.arcTo(x + largura, y, x + largura, y + altura, raio);
  contexto.arcTo(x + largura, y + altura, x, y + altura, raio);
  contexto.arcTo(x, y + altura, x, y, raio);
  contexto.arcTo(x, y, x + largura, y, raio);
  contexto.closePath();
};

const escrever = (contexto: CanvasRenderingContext2D, texto: string, y: number, tamanho: number, fonte: string, cor: string, peso = '700') => {
  let tamanhoFinal = tamanho;
  contexto.font = `${peso} ${tamanhoFinal}px ${fonte}`;
  while (tamanhoFinal > 24 && contexto.measureText(texto).width > TAMANHO_IMAGEM - 200) {
    tamanhoFinal -= 2;
    contexto.font = `${peso} ${tamanhoFinal}px ${fonte}`;
  }

  contexto.fillStyle = cor;
  contexto.fillText(texto, TAMANHO_IMAGEM / 2, y);
};

export const gerarImagemResultado = async (resultado: ResultadoCompartilhado): Promise<Blob | null> => {
  const canvas = document.createElement('canvas');
  canvas.width = TAMANHO_IMAGEM;
  canvas.height = TAMANHO_IMAGEM;
  const contexto = canvas.getContext('2d');
  if (!contexto) {
    return null;
  }

  const estilo = getComputedStyle(document.body);
  const cor = (nome: string, padrao: string) => estilo.getPropertyValue(nome).trim() || padrao;
  const titulo = cor('--font-title', 'sans-serif');
  const corpo = cor('--font-body', 'sans-serif');
  const texto = cor('--text-color-primary', '#24324a');
  const nome = lerNome();
  const conquistas = linhasDasConquistas(resultado.conquistas || []).slice(1);

  await (document as any).fonts?.ready;
  const robo = await imagemDoRobo();

  const fundo = contexto.createLinearGradient(0, 0, TAMANHO_IMAGEM, TAMANHO_IMAGEM);
  fundo.addColorStop(0, cor('--background-color', '#fff7d7'));
  fundo.addColorStop(1, cor('--background-color-alt', '#dff8ff'));
  contexto.fillStyle = fundo;
  contexto.fillRect(0, 0, TAMANHO_IMAGEM, TAMANHO_IMAGEM);

  retangulo(contexto, 60, 60, TAMANHO_IMAGEM - 120, TAMANHO_IMAGEM - 120, 48);
  contexto.fillStyle = cor('--block-color', '#ffffff');
  contexto.fill();
  contexto.lineWidth = 6;
  contexto.strokeStyle = cor('--panel-border-color', '#d7e2ef');
  contexto.stroke();

  contexto.textAlign = 'center';
  contexto.textBaseline = 'middle';
  escrever(contexto, resultado.jogo, 150, 64, titulo, cor('--button-color-primary', '#ff7f50'), '800');
  contexto.drawImage(robo, 360, 195, 360, 315);
  escrever(contexto, nome || 'Jogador', 565, 52, titulo, texto);
  escrever(contexto, resultado.resumo, 645, 56, titulo, cor('--button-color-back', '#2d9cdb'), '800');
  conquistas.forEach((linha, indice) => escrever(contexto, linha, 730 + indice * 58, 40, corpo, texto));
  escrever(contexto, urlDoSite().replace(/^https?:\/\/(www\.)?/, ''), 985, 34, corpo, cor('--text-color-secondary', '#627489'));

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
};

export const arquivoDoResultado = async (resultado: ResultadoCompartilhado) => {
  try {
    const imagem = await gerarImagemResultado(resultado);
    return imagem ? new File([imagem], NOME_IMAGEM, { type: 'image/png' }) : null;
  } catch {
    return null;
  }
};

export const compartilharResultado = async (resultado: ResultadoCompartilhado, arquivo?: File | null) => {
  const texto = montarTextoResultado(resultado);
  const imagem = arquivo === undefined && podeCompartilharArquivos() ? await arquivoDoResultado(resultado) : arquivo;

  if (ehApp()) {
    await compartilharNoApp(resultado.jogo, texto, imagem);
    return;
  }

  if (imagem && (navigator as any).canShare?.({ files: [imagem] })) {
    try {
      await (navigator as any).share({ title: resultado.jogo, text: texto, files: [imagem] });
      return;
    } catch (erro) {
      if ((erro as Error)?.name === 'AbortError') {
        return;
      }
    }
  }

  await compartilhar(resultado.jogo, texto);
};

export const baixarImagem = async (resultado: ResultadoCompartilhado) => {
  const imagem = await arquivoDoResultado(resultado);
  if (!imagem) {
    toast.error('Não foi possível gerar a imagem.');
    return;
  }

  const url = URL.createObjectURL(imagem);
  const link = document.createElement('a');
  link.href = url;
  link.download = NOME_IMAGEM;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};
