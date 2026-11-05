import type { Mock } from 'vitest';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { CHAVE_MIGRADO, gravarItem, iniciarArmazenamento } from './armazenamento';

vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: vi.fn() } }));
vi.mock('@capacitor/preferences', () => ({ Preferences: { get: vi.fn(), set: vi.fn(), keys: vi.fn() } }));

const nativo = Capacitor.isNativePlatform as Mock;
const preferencias = Preferences as unknown as Record<'get' | 'set' | 'keys', Mock>;
let salvas: Record<string, string>;

describe('armazenamento', () => {
  beforeEach(() => {
    window.localStorage.clear();
    salvas = {};
    nativo.mockReturnValue(true);
    preferencias.get.mockImplementation(async ({ key }) => ({ value: key in salvas ? salvas[key] : null }));
    preferencias.set.mockImplementation(async ({ key, value }) => {
      salvas[key] = value;
    });
    preferencias.keys.mockImplementation(async () => ({ keys: Object.keys(salvas) }));
  });

  it('keeps only localStorage on the site', async () => {
    nativo.mockReturnValue(false);

    gravarItem('progresso', '1');
    await iniciarArmazenamento(['progresso']);

    expect(window.localStorage.getItem('progresso')).toBe('1');
    expect(preferencias.set).not.toHaveBeenCalled();
    expect(preferencias.keys).not.toHaveBeenCalled();
  });

  it('saves in localStorage and in the app preferences', () => {
    gravarItem('progresso', '1');

    expect(window.localStorage.getItem('progresso')).toBe('1');
    expect(salvas.progresso).toBe('1');
  });

  it('migrates the localStorage data on the first opening', async () => {
    window.localStorage.setItem('progresso', '{"xp":10}');
    window.localStorage.setItem('theme', 'dark');

    await iniciarArmazenamento(['progresso', 'historico']);

    expect(salvas).toEqual({ progresso: '{"xp":10}', [CHAVE_MIGRADO]: '1' });
  });

  it('restores the saved data when the app opens again', async () => {
    salvas = { progresso: '{"xp":20}', [CHAVE_MIGRADO]: '1' };
    window.localStorage.setItem('progresso', '{"xp":10}');

    await iniciarArmazenamento(['progresso', 'historico']);

    expect(window.localStorage.getItem('progresso')).toBe('{"xp":20}');
    expect(window.localStorage.getItem('historico')).toBeNull();
    expect(window.localStorage.getItem(CHAVE_MIGRADO)).toBeNull();
  });

  it('opens the app even when the preferences fail', async () => {
    preferencias.keys.mockRejectedValue(new Error('falha'));

    await expect(iniciarArmazenamento(['progresso'])).resolves.toBeUndefined();
  });
});
