import regras from './xp.json';
import type { TipoDesafio } from './desafios';
import { buscarMedalha } from './medalhas';
import type { Progresso } from './progresso';

export interface NivelXp {
  nivel: number;
  titulo: string;
  xpNoNivel: number;
  xpDoNivel: number;
}

const somar = (valores: number[]) => valores.reduce((total, valor) => total + valor, 0);

export const xpDaPartida = (acertos: number, perfeita: boolean) =>
  regras.partidaConcluida + Math.min(acertos * regras.porAcerto, regras.maximoPorAcertos) + (perfeita ? regras.partidaPerfeita : 0);

export const xpDoDesafio = (tipo: TipoDesafio) => (tipo === 'dia' ? regras.desafioDoDia : regras.desafioDaSemana);

export const xpDasMedalhas = (obtidas: Progresso['medalhas']) =>
  somar(Object.entries(obtidas).map(([id, { nivel }]) => {
    const medalha = buscarMedalha(id);
    if (!medalha) {
      return 0;
    }

    return medalha.metas.length > 1 ? somar(regras.medalhaPorNivel.slice(0, nivel)) : regras.medalhaUnica;
  }));

export const xpInicial = (progresso: Progresso) =>
  progresso.partidas * regras.partidaConcluida +
  progresso.acertos * regras.porAcerto +
  progresso.partidasPerfeitas * regras.partidaPerfeita +
  somar(progresso.desafiosConcluidos.map((id) => xpDoDesafio(id.startsWith('dia:') ? 'dia' : 'semana'))) +
  xpDasMedalhas(progresso.medalhas);

export const xpParaSubir = (nivel: number) => regras.primeiroNivel + regras.aumentoPorNivel * (nivel - 1);

export const tituloDoNivel = (nivel: number) =>
  regras.titulos.reduce((titulo, item) => (nivel >= item.nivel ? item.titulo : titulo), regras.titulos[0].titulo);

export const xpTotalDoNivel = (nivel: number) => somar(Array.from({ length: Math.max(nivel - 1, 0) }, (_, indice) => xpParaSubir(indice + 1)));

const nivelDoXp = (xp: number, paraSubir: (nivel: number) => number) => {
  let nivel = 1;
  let inicio = 0;

  while (xp >= inicio + paraSubir(nivel)) {
    inicio += paraSubir(nivel);
    nivel += 1;
  }

  return { nivel, inicio };
};

export const nivelNaCurvaAnterior = (xp: number) => nivelDoXp(xp, (nivel) => 100 + 50 * (nivel - 1)).nivel;

export const calcularNivel = (xp: number, nivelDoTitulo = 0): NivelXp => {
  const { nivel, inicio } = nivelDoXp(xp, xpParaSubir);

  return { nivel, titulo: tituloDoNivel(Math.max(nivel, nivelDoTitulo)), xpNoNivel: Math.max(xp - inicio, 0), xpDoNivel: xpParaSubir(nivel) };
};
