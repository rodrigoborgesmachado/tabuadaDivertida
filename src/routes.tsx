import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Formulario from './pages/Formulario/Formulario';
import TipoJogo from './pages/TipoJogo/TipoJogo';
import Contagem from './pages/Contagem/Contagem';
import Jogo from './pages/Jogo/Jogo';
import Final from './pages/Final/Final';
import Ranking from './pages/Ranking/Ranking';
import Instrucoes from './pages/Instrucoes/Instrucoes';
import Erro from './pages/Erro/Erro';
import Historico from './pages/Historico/Historico';
import PoliticaPrivacidade from './pages/PoliticaPrivacidade/PoliticaPrivacidade';
import Sobre from './pages/Sobre/Sobre';
import Contato from './pages/Contato/Contato';
import Header from './components/Header/index';

interface RoutesAppProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

function RoutesApp({ theme, toggleTheme }: RoutesAppProps) {
    return(
        <BrowserRouter>
            <Header theme={theme} toggleTheme={toggleTheme}/>
            <Routes>
                <Route path='/' element={<Home/>}/>
                <Route path='/formulario' element={<Formulario/>}/>
                <Route path='/selecionarjogo' element={<TipoJogo/>}/>
                <Route path='/contagem/:tipo' element={<Contagem/>}/>
                <Route path='/jogo/:tipo' element={<Jogo/>}/>
                <Route path='/ranking' element={<Ranking/>}/>
                <Route path='/final/:tipo' element={<Final/>}/>
                <Route path='/instrucoes' element={<Instrucoes/>}/>
                <Route path='/historico' element={<Historico/>}/>
                <Route path='/privacidade' element={<PoliticaPrivacidade/>}/>
                <Route path='/sobre' element={<Sobre/>}/>
                <Route path='/contato' element={<Contato/>}/>
                <Route path='*' element={<Erro/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default RoutesApp;