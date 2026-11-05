import { dicaMostre, ELOGIOS, embaralhar, estrelas, gerarDesafio, gerarOpcoes, gerarPartida, instrucao, MAXIMO_LIGUE, NIVEIS, nomeDoBicho, respostaDoDesafio, sortearElogio, TIPOS, TOTAL_DESAFIOS, type Desafio } from './logic';

const GERACOES = 200;
const patinho = { emoji: '🦆', nome: 'patinho', plural: 'patinhos' };

const quantidades = (desafio: Desafio) => {
  if (desafio.tipo === 'quantos' || desafio.tipo === 'mostre') return [desafio.grupo.quantidade];
  return desafio.grupos.map((grupo) => grupo.quantidade);
};

describe('Contando bichinhos logic', () => {
  NIVEIS.forEach((nivel) => {
    it(`creates a match with ${TOTAL_DESAFIOS} challenges and every type up to ${nivel}`, () => {
      for (let i = 0; i < GERACOES; i++) {
        const partida = gerarPartida(nivel);

        expect(partida).toHaveLength(TOTAL_DESAFIOS);
        expect(new Set(partida.map((desafio) => desafio.tipo))).toEqual(new Set(TIPOS));
        partida.forEach((desafio) => {
          quantidades(desafio).forEach((quantidade) => {
            expect(quantidade).toBeGreaterThanOrEqual(1);
            expect(quantidade).toBeLessThanOrEqual(nivel);
          });
        });
      }
    });

    it(`offers three different options with the right answer up to ${nivel}`, () => {
      for (let i = 0; i < GERACOES; i++) {
        ['quantos', 'junte'].forEach((tipo) => {
          const desafio = gerarDesafio(tipo as 'quantos' | 'junte', nivel);
          if (desafio.tipo !== 'quantos' && desafio.tipo !== 'junte') return;

          expect(desafio.opcoes).toHaveLength(3);
          expect(new Set(desafio.opcoes).size).toBe(3);
          expect(desafio.opcoes).toContain(respostaDoDesafio(desafio));
          desafio.opcoes.forEach((opcao) => {
            expect(opcao).toBeGreaterThanOrEqual(1);
            expect(opcao).toBeLessThanOrEqual(nivel);
          });
        });
      }
    });

    it(`keeps the sum of the groups up to ${nivel}`, () => {
      for (let i = 0; i < GERACOES; i++) {
        const desafio = gerarDesafio('junte', nivel);
        if (desafio.tipo !== 'junte') return;

        expect(desafio.grupos[0].bicho).toBe(desafio.grupos[1].bicho);
        expect(respostaDoDesafio(desafio)).toBeLessThanOrEqual(nivel);
      }
    });

    it(`shows more animals than asked up to ${nivel}`, () => {
      for (let i = 0; i < GERACOES; i++) {
        const desafio = gerarDesafio('mostre', nivel);
        if (desafio.tipo !== 'mostre') return;

        expect(desafio.alvo).toBeGreaterThanOrEqual(1);
        expect(desafio.grupo.quantidade).toBeGreaterThan(desafio.alvo);
        expect(desafio.grupo.quantidade).toBeLessThanOrEqual(nivel);
      }
    });

    it(`compares groups with different sizes up to ${nivel}`, () => {
      for (let i = 0; i < GERACOES; i++) {
        const desafio = gerarDesafio('mais', nivel);
        if (desafio.tipo !== 'mais') return;

        const [a, b] = desafio.grupos;
        expect(a.quantidade).not.toBe(b.quantidade);
        expect(desafio.grupos[respostaDoDesafio(desafio) as number].quantidade).toBe(Math.max(a.quantidade, b.quantidade));
      }
    });

    it(`links three different groups to their numbers up to ${nivel}`, () => {
      for (let i = 0; i < GERACOES; i++) {
        const desafio = gerarDesafio('ligue', nivel);
        if (desafio.tipo !== 'ligue') return;

        const valores = desafio.grupos.map((grupo) => grupo.quantidade);
        expect(new Set(valores).size).toBe(3);
        expect(new Set(desafio.grupos.map((grupo) => grupo.bicho)).size).toBe(3);
        expect([...desafio.numeros].sort((x, y) => x - y)).toEqual([...valores].sort((x, y) => x - y));
        expect(Math.max(...valores)).toBeLessThanOrEqual(Math.min(nivel, MAXIMO_LIGUE));
        expect(respostaDoDesafio(desafio)).toBeNull();
      }
    });
  });

  it('keeps the options inside the level when the answer is at the edge', () => {
    expect(Math.min(...gerarOpcoes(1, 5))).toBe(1);
    expect(Math.max(...gerarOpcoes(5, 5))).toBe(5);
  });

  it('shuffles without losing items', () => {
    expect(embaralhar([1, 2, 3, 4, 5]).sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('uses the singular for one animal', () => {
    expect(nomeDoBicho(patinho, 1)).toBe('patinho');
    expect(nomeDoBicho(patinho, 2)).toBe('patinhos');
  });

  it('describes each challenge to be read aloud', () => {
    expect(instrucao({ tipo: 'quantos', grupo: { bicho: patinho, quantidade: 3 }, opcoes: [2, 3, 4] })).toBe('Quantos patinhos tem? Toque no número certo.');
    expect(instrucao({ tipo: 'mostre', grupo: { bicho: patinho, quantidade: 6 }, alvo: 4 })).toBe('Toque em 4 patinhos. Depois toque no botão verde.');
    expect(instrucao({ tipo: 'mostre', grupo: { bicho: patinho, quantidade: 3 }, alvo: 1 })).toBe('Toque em 1 patinho. Depois toque no botão verde.');
    expect(instrucao({ tipo: 'junte', grupos: [{ bicho: patinho, quantidade: 2 }, { bicho: patinho, quantidade: 1 }], opcoes: [2, 3, 4] }))
      .toBe('Junte os grupos: 2 patinhos mais 1 patinho. Quantos ficam ao todo?');
    expect(instrucao({ tipo: 'mais', grupos: [{ bicho: patinho, quantidade: 2 }, { bicho: patinho, quantidade: 5 }] })).toBe('Qual grupo tem mais bichinhos? Toque no grupo.');
    expect(instrucao({ tipo: 'ligue', grupos: [], numeros: [] })).toContain('Ligue cada grupo');
  });

  it('gives a kind hint when the count is wrong', () => {
    expect(dicaMostre(2, 4)).toBe('Faltou um pouquinho! Vamos contar de novo?');
    expect(dicaMostre(5, 4)).toBe('Passou um pouquinho! Vamos contar de novo?');
  });

  it('always gives at least one star', () => {
    expect(estrelas(0)).toBe(3);
    expect(estrelas(1)).toBe(3);
    expect(estrelas(2)).toBe(2);
    expect(estrelas(4)).toBe(2);
    expect(estrelas(5)).toBe(1);
    expect(estrelas(50)).toBe(1);
  });

  it('only says nice things', () => {
    expect(ELOGIOS).toContain(sortearElogio());
  });
});
