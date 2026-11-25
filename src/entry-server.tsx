import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './App';

export { aplicarMetadados, ROTAS_INDEXADAS } from './services/metadados';

export const renderizar = (url: string) => renderToString(
  <StaticRouter location={url}>
    <App />
  </StaticRouter>
);
