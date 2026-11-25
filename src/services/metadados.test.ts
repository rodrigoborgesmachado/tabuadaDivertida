import sitemap from '../../public/sitemap.xml?raw';
import { aplicarMetadados, metadadosDaRota, PAGINAS, ROTAS_INDEXADAS, URL_SITE } from './metadados';

const conteudo = (seletor: string, atributo: string) => document.head.querySelector(seletor)?.getAttribute(atributo);

describe('metadados', () => {
  beforeEach(() => {
    document.head.innerHTML = '<meta name="description" content="Descrição padrão" />';
    document.title = 'Tabuada Divertida';
  });

  it('gives each public page its own title and description', () => {
    const titulos = ROTAS_INDEXADAS.map((rota) => PAGINAS[rota].titulo);
    const descricoes = ROTAS_INDEXADAS.map((rota) => PAGINAS[rota].descricao);

    expect(new Set(titulos).size).toBe(ROTAS_INDEXADAS.length);
    expect(new Set(descricoes).size).toBe(ROTAS_INDEXADAS.length);
  });

  it('applies the title, description and canonical of the IQ test', () => {
    aplicarMetadados(document, '/jogos/teste-de-qi');

    expect(document.title).toBe('Teste de QI com Números: desafio de lógica | Tabuada Divertida');
    expect(conteudo('meta[name="description"]', 'content')).toMatch(/^Faça o Teste de QI com Números/);
    expect(conteudo('link[rel="canonical"]', 'href')).toBe(`${URL_SITE}/jogos/teste-de-qi`);
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
  });

  it.each(['/contagem/M', '/jogo/M', '/final/M', '/historico', '/formulario', '/resultados', '/rota-inexistente'])('marks %s with noindex and without canonical', (rota) => {
    aplicarMetadados(document, '/sobre');
    aplicarMetadados(document, rota);

    expect(metadadosDaRota(rota).noindex).toBe(true);
    expect(conteudo('meta[name="robots"]', 'content')).toBe('noindex');
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.title).toBe('Tabuada Divertida');
  });

  it('ignores the trailing slash of the address', () => {
    aplicarMetadados(document, '/jogos/teste-de-qi/');

    expect(conteudo('link[rel="canonical"]', 'href')).toBe(`${URL_SITE}/jogos/teste-de-qi`);
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
  });

  it('removes the noindex when going back to a public page', () => {
    aplicarMetadados(document, '/jogo/M');
    aplicarMetadados(document, '/');

    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
    expect(conteudo('link[rel="canonical"]', 'href')).toBe(`${URL_SITE}/`);
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
  });

  it('lists in the sitemap only the public pages', () => {
    const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);

    expect(urls.sort()).toEqual(ROTAS_INDEXADAS.map((rota) => `${URL_SITE}${rota}`).sort());
  });
});
