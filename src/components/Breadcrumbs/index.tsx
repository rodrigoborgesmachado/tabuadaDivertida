import { useLocation } from 'react-router-dom';
import './style.css';

function Breadcrumbs() {
  const location = useLocation();

  const path = location.pathname;

  if (path === '/') return null;

  const segments = path.split('/').filter(Boolean);
  const first = segments[0];
  if (['contagem', 'jogo', 'final'].includes(first)) return null;

  const labelMap: Record<string, string> = {
    '': 'Início',
    'formulario': 'Formulário',
    'selecionarjogo': 'Selecionar Jogo',
    'ranking': 'Ranking',
    'resultados': 'Resultados',
    'instrucoes': 'Instruções',
    'historico': 'Histórico',
    'privacidade': 'Privacidade',
    'sobre': 'Sobre',
    'contato': 'Contato',
    'contribua': 'Contribua',
    'artigos': 'Artigos',
  };

  const artigosLabelMap: Record<string, string> = {
    'aprender-matematica-com-jogos': 'Aprender matemática com jogos',
    'historia-da-tabuada': 'História da tabuada',
    'tabuada': 'Tabuada',
    'beneficios-jogos-educacionas': 'Benefícios dos jogos educacionais',
    'dicas-para-ensinar-matematica-em-casa': 'Dicas para ensinar matemática em casa',
  };

  const parts = segments.map((seg, idx) => {
    const href = '/' + segments.slice(0, idx + 1).join('/');
    let label = labelMap[seg];

    if (!label && segments[0] === 'artigos' && idx === 1) {
      label = artigosLabelMap[seg];
    }

    if (!label) {
      label = decodeURIComponent(seg).replace(/-/g, ' ');
      label = label.charAt(0).toUpperCase() + label.slice(1);
    }

    return { href, label };
  });

  const homeCrumb = { href: '/', label: 'Início' };

  return (
    <nav className="breadcrumbs" aria-label="breadcrumb">
      <div className="breadcrumbs__container">
        <a className="breadcrumbs__link" href={homeCrumb.href}>{homeCrumb.label}</a>
        {parts.map((p, i) => (
          <span className="breadcrumbs__item" key={p.href}>
            <span className="breadcrumbs__separator">›</span>
            {i === parts.length - 1 ? (
              <span className="breadcrumbs__current" aria-current="page">{p.label}</span>
            ) : (
              <a className="breadcrumbs__link" href={p.href}>{p.label}</a>
            )}
          </span>
        ))}
      </div>
    </nav>
  );
}

export default Breadcrumbs;
