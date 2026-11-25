import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const PASTA_BUILD = 'build';
const PASTA_SSR = 'build-ssr';

const { window } = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', { url: 'https://www.tabuadadivertida.com/' });
Object.defineProperties(globalThis, {
  window: { value: window, configurable: true },
  document: { value: window.document, configurable: true },
  navigator: { value: window.navigator, configurable: true },
  localStorage: { value: window.localStorage, configurable: true },
});

const { renderizar, aplicarMetadados, ROTAS_INDEXADAS } = await import(`../${PASTA_SSR}/entry-server.js`);
const modelo = fs.readFileSync(path.join(PASTA_BUILD, 'index.html'), 'utf8');

const gerarPagina = (rota, conteudo, arquivo) => {
  const pagina = new JSDOM(modelo);
  aplicarMetadados(pagina.window.document, rota);
  pagina.window.document.getElementById('root').innerHTML = conteudo;
  const destino = path.join(PASTA_BUILD, arquivo);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, pagina.serialize());
};

gerarPagina('/fallback.html', '', 'fallback.html');
ROTAS_INDEXADAS.forEach((rota) => {
  window.localStorage.clear();
  gerarPagina(rota, renderizar(rota), path.join(rota, 'index.html'));
});

fs.rmSync(PASTA_SSR, { recursive: true, force: true });
console.log(`${ROTAS_INDEXADAS.length} páginas prerenderizadas.`);
