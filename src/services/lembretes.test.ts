import type { Mock } from 'vitest';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { desafioDoDia } from '../gamificacao/desafios';
import { criarProgresso, STORAGE_KEY, type Progresso } from '../gamificacao/progresso';
import {
  agendarLembretes,
  ativarLembrete,
  calcularLembretes,
  DIAS_AGENDADOS,
  HORA_PADRAO,
  lerLembrete,
  STORAGE_LEMBRETE,
  type Lembrete,
} from './lembretes';

vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: vi.fn() } }));
vi.mock('@capacitor/preferences', () => ({ Preferences: { set: vi.fn().mockResolvedValue(undefined) } }));
vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: { getPending: vi.fn(), cancel: vi.fn(), checkPermissions: vi.fn(), requestPermissions: vi.fn(), schedule: vi.fn() },
}));

const nativo = Capacitor.isNativePlatform as Mock;
const notificacoes = LocalNotifications as unknown as Record<'getPending' | 'cancel' | 'checkPermissions' | 'requestPermissions' | 'schedule', Mock>;
const agora = new Date(2026, 10, 3, 10, 0);
const ligado: Lembrete = { ativo: true, hora: HORA_PADRAO, perguntado: true };
const progresso = (dados: Partial<Progresso> = {}): Progresso => ({ ...criarProgresso(), ...dados });

describe('lembretes', () => {
  beforeEach(() => {
    window.localStorage.clear();
    nativo.mockReturnValue(true);
    notificacoes.getPending.mockResolvedValue({ notifications: [] });
    notificacoes.cancel.mockResolvedValue(undefined);
    notificacoes.checkPermissions.mockResolvedValue({ display: 'granted' });
    notificacoes.requestPermissions.mockResolvedValue({ display: 'granted' });
    notificacoes.schedule.mockResolvedValue({ notifications: [] });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('starts turned off at 18:00 and ignores invalid saved values', () => {
    expect(lerLembrete()).toEqual({ ativo: false, hora: '18:00', perguntado: false });

    window.localStorage.setItem(STORAGE_LEMBRETE, JSON.stringify({ ativo: true, hora: '25:00', perguntado: true }));
    expect(lerLembrete()).toEqual({ ativo: true, hora: '18:00', perguntado: true });

    window.localStorage.setItem(STORAGE_LEMBRETE, 'quebrado');
    expect(lerLembrete()).toEqual({ ativo: false, hora: '18:00', perguntado: false });
  });

  it('schedules one reminder a day at the chosen time with the challenge of the day', () => {
    const lista = calcularLembretes(ligado, progresso(), agora);

    expect(lista).toHaveLength(DIAS_AGENDADOS);
    expect(lista[0].id).toBe(20261103);
    expect(lista[0].data).toEqual(new Date(2026, 10, 3, 18, 0));
    expect(lista[6].data).toEqual(new Date(2026, 10, 9, 18, 0));
    expect(lista[0].texto).toBe(`${desafioDoDia(agora).icone} ${desafioDoDia(agora).texto}`);
    expect(lista[0].titulo).toContain('🎯');
  });

  it('skips today when the challenge of the day is already done', () => {
    const lista = calcularLembretes(ligado, progresso({ desafiosConcluidos: ['dia:2026-11-03'] }), agora);

    expect(lista).toHaveLength(DIAS_AGENDADOS - 1);
    expect(lista[0].data).toEqual(new Date(2026, 10, 4, 18, 0));
  });

  it('follows the chosen time and skips today when the time has passed', () => {
    expect(calcularLembretes({ ...ligado, hora: '19:30' }, progresso(), agora)[0].data).toEqual(new Date(2026, 10, 3, 19, 30));

    const lista = calcularLembretes({ ...ligado, hora: '08:15' }, progresso(), agora);
    expect(lista).toHaveLength(DIAS_AGENDADOS - 1);
    expect(lista[0].data).toEqual(new Date(2026, 10, 4, 8, 15));
  });

  it('reminds the streak of days on the reminder of today', () => {
    const lista = calcularLembretes(ligado, progresso({ ultimoDia: '2026-11-02', diasSeguidos: 7 }), agora);

    expect(lista[0].titulo).toBe('Não perca sua sequência de 7 dias! 🔥');
    expect(lista[1].titulo).not.toContain('sequência');
  });

  it('schedules nothing when turned off', () => {
    expect(calcularLembretes({ ...ligado, ativo: false }, progresso(), agora)).toEqual([]);
  });

  it('replaces the pending reminders when scheduling', async () => {
    window.localStorage.setItem(STORAGE_LEMBRETE, JSON.stringify(ligado));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progresso({ desafiosConcluidos: ['dia:2026-11-03'] })));
    notificacoes.getPending.mockResolvedValue({ notifications: [{ id: 20261103 }, { id: 20261104 }] });

    await agendarLembretes(agora);

    expect(notificacoes.cancel).toHaveBeenCalledWith({ notifications: [{ id: 20261103 }, { id: 20261104 }] });
    const agendadas = notificacoes.schedule.mock.calls[0][0].notifications;
    expect(agendadas).toHaveLength(DIAS_AGENDADOS - 1);
    expect(agendadas[0]).toMatchObject({ id: 20261104, schedule: { at: new Date(2026, 10, 4, 18, 0), allowWhileIdle: true } });
  });

  it('only cancels the reminders when turned off or without permission', async () => {
    notificacoes.getPending.mockResolvedValue({ notifications: [{ id: 20261103 }] });

    await agendarLembretes(agora);
    expect(notificacoes.cancel).toHaveBeenCalledTimes(1);

    window.localStorage.setItem(STORAGE_LEMBRETE, JSON.stringify(ligado));
    notificacoes.checkPermissions.mockResolvedValue({ display: 'denied' });
    await agendarLembretes(agora);

    expect(notificacoes.cancel).toHaveBeenCalledTimes(2);
    expect(notificacoes.schedule).not.toHaveBeenCalled();
  });

  it('does nothing on the site', async () => {
    nativo.mockReturnValue(false);
    window.localStorage.setItem(STORAGE_LEMBRETE, JSON.stringify(ligado));

    await agendarLembretes(agora);

    expect(notificacoes.getPending).not.toHaveBeenCalled();
    expect(notificacoes.schedule).not.toHaveBeenCalled();
  });

  it('turns on only when the permission is granted and remembers that it asked', async () => {
    expect(await ativarLembrete('20:00')).toBe(true);
    expect(lerLembrete()).toEqual({ ativo: true, hora: '20:00', perguntado: true });

    notificacoes.requestPermissions.mockResolvedValue({ display: 'denied' });
    notificacoes.checkPermissions.mockResolvedValue({ display: 'denied' });
    expect(await ativarLembrete('20:00')).toBe(false);
    expect(lerLembrete()).toEqual({ ativo: false, hora: '20:00', perguntado: true });
  });
});
