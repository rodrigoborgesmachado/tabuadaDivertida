import { registerPlugin, type PluginListenerHandle } from '@capacitor/core';
import { imagemDoRobo } from './compartilhar';
import { ehAndroid } from './plataforma';

interface IconeAppPlugin {
  iconeAtual(): Promise<{ icone: string; suportado: boolean }>;
  trocarIcone(opcoes: { icone: string }): Promise<void>;
  atalho(): Promise<{ suportado: boolean; criado: boolean }>;
  criarAtalho(opcoes: { imagem: string }): Promise<{ sucesso: boolean; atualizado: boolean }>;
  addListener(evento: 'atalhoAberto', ouvinte: () => void): Promise<PluginListenerHandle>;
}

export const IconeApp = registerPlugin<IconeAppPlugin>('IconeApp');

export const ICONES_APP = [
  'cor-prata', 'cor-azul', 'cor-vermelho', 'cor-verde', 'cor-laranja',
  'cor-roxa', 'cor-dourada', 'cor-verde-neon', 'cor-rosa-neon', 'cor-azul-eletrico',
];

export const TAMANHO_ATALHO = 432;

export const temIconeDoApp = (id: string) => ehAndroid() && ICONES_APP.includes(id);

export const imagemDoAtalho = async () => {
  const canvas = document.createElement('canvas');
  canvas.width = TAMANHO_ATALHO;
  canvas.height = TAMANHO_ATALHO;
  const contexto = canvas.getContext('2d');
  if (!contexto) {
    return '';
  }

  const estilo = getComputedStyle(document.body);
  const cor = (nome: string, padrao: string) => estilo.getPropertyValue(nome).trim() || padrao;
  const fundo = contexto.createLinearGradient(0, 0, TAMANHO_ATALHO, TAMANHO_ATALHO);
  fundo.addColorStop(0, cor('--background-color', '#fff7d7'));
  fundo.addColorStop(1, cor('--background-color-alt', '#dff8ff'));
  contexto.fillStyle = fundo;
  contexto.fillRect(0, 0, TAMANHO_ATALHO, TAMANHO_ATALHO);
  contexto.drawImage(await imagemDoRobo(), 91, 106, 250, 219);

  return canvas.toDataURL('image/png').split(',')[1] || '';
};
