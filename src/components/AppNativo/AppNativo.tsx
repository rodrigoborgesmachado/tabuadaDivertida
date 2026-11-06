import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { LocalNotifications } from '@capacitor/local-notifications';
import { SplashScreen } from '@capacitor/splash-screen';
import { EVENTO_DESAFIOS } from '../../gamificacao/progresso';
import { agendarLembretes, ROTA_DESAFIO_DO_DIA } from '../../services/lembretes';
import { IconeApp } from '../../services/iconeApp';
import { ehAndroid, ehApp, linkExterno } from '../../services/plataforma';

function AppNativo() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const rota = useRef(pathname);

  useEffect(() => {
    rota.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!ehApp()) {
      return;
    }

    SplashScreen.hide().catch(() => {});

    const voltar = App.addListener('backButton', ({ canGoBack }) => {
      if (rota.current === '/') {
        App.exitApp();
      } else if (canGoBack) {
        navigate(-1);
      } else {
        navigate('/', { replace: true });
      }
    });

    const abrirLink = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.('a');
      if (link && linkExterno(link.href)) {
        event.preventDefault();
        Browser.open({ url: link.href }).catch(() => {});
      }
    };

    const abrirDesafio = LocalNotifications.addListener('localNotificationActionPerformed', () => navigate(ROTA_DESAFIO_DO_DIA));
    const reagendar = () => agendarLembretes();

    agendarLembretes();

    const atalho = ehAndroid() ? IconeApp.addListener('atalhoAberto', () => navigate('/')) : undefined;

    document.addEventListener('click', abrirLink);
    window.addEventListener(EVENTO_DESAFIOS, reagendar);
    return () => {
      voltar.then((ouvinte) => ouvinte.remove());
      abrirDesafio.then((ouvinte) => ouvinte.remove());
      atalho?.then((ouvinte) => ouvinte.remove());
      document.removeEventListener('click', abrirLink);
      window.removeEventListener(EVENTO_DESAFIOS, reagendar);
    };
  }, [navigate]);

  return null;
}

export default AppNativo;
