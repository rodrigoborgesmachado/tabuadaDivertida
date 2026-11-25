import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { aplicarMetadados } from '../../services/metadados';

function Metadados() {
  const { pathname } = useLocation();

  useEffect(() => {
    aplicarMetadados(document, pathname);
  }, [pathname]);

  return null;
}

export default Metadados;
