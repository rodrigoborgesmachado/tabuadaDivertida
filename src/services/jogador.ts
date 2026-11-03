import { useEffect, useState } from 'react';
import configData from '../Config.json';
import { CASAS_CORRIDA } from '../pages/CorridaRobo/logic';
import { normalizarNome } from './resultadosJogos';

export const QUANTIDADES = [10, 20, 30, 50, 100];
export const QUANTIDADE_PADRAO = 20;
export const TAMANHO_NOME = 15;
export const STORAGE_QUANTIDADE = 'tabuada-divertida-quantidade';
export const STORAGE_PERFIL_VISTO = 'tabuada-divertida-perfil-visto';
export const EVENTO_JOGADOR = 'tabuada-divertida-jogador';

export const opcaoMaisProxima = (valor: number, opcoes: number[]) =>
  opcoes.reduce((maisProxima, opcao) => (Math.abs(opcao - valor) < Math.abs(maisProxima - valor) ? opcao : maisProxima));

const ler = (chave: string) => {
  try {
    return window.localStorage.getItem(chave);
  } catch {
    return null;
  }
};

const gravar = (chave: string, valor: string) => {
  try {
    window.localStorage.setItem(chave, valor);
  } catch {}
  window.dispatchEvent(new Event(EVENTO_JOGADOR));
};

export const lerNome = () => normalizarNome(ler(configData.NOME_PARAM) || '');

export const salvarNome = (nome: string) => gravar(configData.NOME_PARAM, normalizarNome(nome).slice(0, TAMANHO_NOME));

export const lerQuantidade = () => {
  const salva = parseInt(ler(STORAGE_QUANTIDADE) || ler(configData.QUANTIDADE_PARAM) || '', 10);
  return Number.isNaN(salva) ? QUANTIDADE_PADRAO : opcaoMaisProxima(salva, QUANTIDADES);
};

export const salvarQuantidade = (quantidade: number) => gravar(STORAGE_QUANTIDADE, String(opcaoMaisProxima(quantidade, QUANTIDADES)));

export const casasDaCorrida = (quantidade = lerQuantidade()) => opcaoMaisProxima(quantidade, CASAS_CORRIDA);

export const perfilVisto = () => ler(STORAGE_PERFIL_VISTO) === '1' || !!lerNome();

export const marcarPerfilVisto = () => {
  try {
    window.localStorage.setItem(STORAGE_PERFIL_VISTO, '1');
  } catch {}
};

const lerJogador = () => ({ nome: lerNome(), quantidade: lerQuantidade() });

export const useJogador = () => {
  const [jogador, setJogador] = useState(lerJogador);

  useEffect(() => {
    const atualizar = () => setJogador(lerJogador());

    window.addEventListener(EVENTO_JOGADOR, atualizar);
    return () => window.removeEventListener(EVENTO_JOGADOR, atualizar);
  }, []);

  return jogador;
};
