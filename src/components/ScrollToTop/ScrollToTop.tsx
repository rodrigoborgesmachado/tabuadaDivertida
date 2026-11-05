import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const tipoNavegacao = useNavigationType();
  const anterior = useRef({ pathname, hash });

  useEffect(() => {
    if (anterior.current.pathname === pathname && anterior.current.hash === hash) {
      return;
    }

    anterior.current = { pathname, hash };
    if (tipoNavegacao === 'POP') {
      return;
    }

    const destino = hash && document.getElementById(decodeURIComponent(hash.slice(1)));
    if (destino) {
      destino.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash, tipoNavegacao]);

  return null;
}

export default ScrollToTop;
