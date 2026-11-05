import RoutesApp from "./routes";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from './components/footer';
import { useEffect, useState } from 'react';
import { buscarRecompensa } from './gamificacao/recompensas';
import { usePersonalizacao } from './gamificacao/usePersonalizacao';
import { TemaContext } from './components/ThemeSwitcher/temaContext';
import { ajustarBarraDeStatus } from './services/plataforma';

function App() {
  const { tema } = usePersonalizacao();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const cor = buscarRecompensa(tema)?.valor;
    if (cor) {
      document.body.setAttribute('data-cor', cor);
    } else {
      document.body.removeAttribute('data-cor');
    }
  }, [tema]);

  useEffect(() => {
    ajustarBarraDeStatus(theme === 'dark');
  }, [theme, tema]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="app">
      <ToastContainer autoClose={1000} />
      <TemaContext.Provider value={{ theme, toggleTheme }}>
        <RoutesApp />
      </TemaContext.Provider>
      <Footer />
    </div>
  );
}

export default App;
