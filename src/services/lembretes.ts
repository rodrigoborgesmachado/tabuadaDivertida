import { LocalNotifications } from '@capacitor/local-notifications';
import { desafioConcluido, desafioDoDia } from '../gamificacao/desafios';
import { lerProgresso, type Progresso } from '../gamificacao/progresso';
import { chaveDia, diasSeguidosAtuais } from '../gamificacao/sequenciaDias';
import { gravarItem } from './armazenamento';
import { ehApp } from './plataforma';

export const STORAGE_LEMBRETE = 'tabuada-divertida-lembrete';
export const HORA_PADRAO = '18:00';
export const DIAS_AGENDADOS = 7;
export const ROTA_DESAFIO_DO_DIA = '/#desafio-do-dia';

export interface Lembrete {
  ativo: boolean;
  hora: string;
  perguntado: boolean;
}

export interface Notificacao {
  id: number;
  titulo: string;
  texto: string;
  data: Date;
}

const TITULOS = [
  'Seu desafio de hoje está esperando! 🎯',
  'Bora treinar a tabuada? 🧮',
  'O robô está esperando você para jogar! 🤖',
];

const horaValida = (hora: unknown): hora is string => typeof hora === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(hora);

export const lerLembrete = (): Lembrete => {
  try {
    const dados = JSON.parse(window.localStorage.getItem(STORAGE_LEMBRETE) || '{}');
    return {
      ativo: dados?.ativo === true,
      hora: horaValida(dados?.hora) ? dados.hora : HORA_PADRAO,
      perguntado: dados?.perguntado === true,
    };
  } catch {
    return { ativo: false, hora: HORA_PADRAO, perguntado: false };
  }
};

export const salvarLembrete = (lembrete: Lembrete) => {
  try {
    gravarItem(STORAGE_LEMBRETE, JSON.stringify(lembrete));
  } catch {}
};

export const concluiuDesafioDoDia = (progresso: Progresso) => progresso.desafiosConcluidos.some((id) => id.startsWith('dia:'));

export const calcularLembretes = (lembrete: Lembrete, progresso: Progresso, agora: Date): Notificacao[] => {
  if (!lembrete.ativo) {
    return [];
  }

  const [hora, minuto] = lembrete.hora.split(':').map(Number);
  const dias = diasSeguidosAtuais(progresso, agora);
  const notificacoes: Notificacao[] = [];

  for (let dia = 0; dia < DIAS_AGENDADOS; dia++) {
    const data = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + dia, hora, minuto);
    const desafio = desafioDoDia(data);

    if (data <= agora || desafioConcluido(progresso, desafio)) {
      continue;
    }

    notificacoes.push({
      id: Number(chaveDia(data).replace(/-/g, '')),
      titulo: dia === 0 && dias >= 2 ? `Não perca sua sequência de ${dias} dias! 🔥` : TITULOS[data.getDate() % TITULOS.length],
      texto: `${desafio.icone} ${desafio.texto}`,
      data,
    });
  }

  return notificacoes;
};

export const agendarLembretes = async (agora = new Date()) => {
  if (!ehApp()) {
    return;
  }

  try {
    const { notifications } = await LocalNotifications.getPending();
    if (notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: notifications.map(({ id }) => ({ id })) });
    }

    const lembrete = lerLembrete();
    if (!lembrete.ativo || (await LocalNotifications.checkPermissions()).display !== 'granted') {
      return;
    }

    const notificacoes = calcularLembretes(lembrete, lerProgresso(), agora);
    if (notificacoes.length > 0) {
      await LocalNotifications.schedule({
        notifications: notificacoes.map(({ id, titulo, texto, data }) => ({
          id,
          title: titulo,
          body: texto,
          schedule: { at: data, allowWhileIdle: true },
        })),
      });
    }
  } catch {}
};

export const ativarLembrete = async (hora: string) => {
  let ativo = false;
  try {
    ativo = (await LocalNotifications.requestPermissions()).display === 'granted';
  } catch {}

  salvarLembrete({ ativo, hora, perguntado: true });
  await agendarLembretes();
  return ativo;
};

export const desativarLembrete = async (hora: string) => {
  salvarLembrete({ ativo: false, hora, perguntado: true });
  await agendarLembretes();
};
