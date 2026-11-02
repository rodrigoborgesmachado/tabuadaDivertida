import type { Progresso } from './progresso';

export const MAX_FOLGAS = 2;
export const DIAS_POR_FOLGA = 7;

const doisDigitos = (valor: number) => String(valor).padStart(2, '0');

export const chaveDia = (data: Date) => `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`;

export const chaveSemana = (data: Date) => {
  const quinta = new Date(Date.UTC(data.getFullYear(), data.getMonth(), data.getDate()));
  quinta.setUTCDate(quinta.getUTCDate() + 4 - (quinta.getUTCDay() || 7));
  const semana = Math.ceil(((quinta.getTime() - Date.UTC(quinta.getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7);
  return `${quinta.getUTCFullYear()}-S${doisDigitos(semana)}`;
};

const paraUtc = (chave: string) => {
  const [ano, mes, dia] = chave.split('-').map(Number);
  return Date.UTC(ano, mes - 1, dia);
};

export const diasEntre = (de: string, ate: string) => Math.round((paraUtc(ate) - paraUtc(de)) / 86400000);

export const registrarDia = (progresso: Progresso, data: Date): Progresso => {
  const hoje = chaveDia(data);
  const diferenca = progresso.ultimoDia ? diasEntre(progresso.ultimoDia, hoje) : 1;

  if (diferenca <= 0) {
    return progresso;
  }

  const faltas = diferenca - 1;
  const continua = progresso.diasSeguidos > 0 && faltas <= progresso.folgas;
  const diasSeguidos = continua ? progresso.diasSeguidos + 1 : 1;
  const folgas = continua ? progresso.folgas - faltas : 0;

  return {
    ...progresso,
    ultimoDia: hoje,
    diasSeguidos,
    melhorDiasSeguidos: Math.max(progresso.melhorDiasSeguidos, diasSeguidos),
    folgas: diasSeguidos % DIAS_POR_FOLGA === 0 ? Math.min(folgas + 1, MAX_FOLGAS) : folgas,
  };
};

export const diasSeguidosAtuais = (progresso: Progresso, data = new Date()) => {
  if (!progresso.ultimoDia) {
    return 0;
  }

  return diasEntre(progresso.ultimoDia, chaveDia(data)) - 1 <= progresso.folgas ? progresso.diasSeguidos : 0;
};
