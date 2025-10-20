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
import Contribua from './pages/Contribua/Contribua';
import Header from './components/Header/index';
import Breadcrumbs from './components/Breadcrumbs';
import AprenderMatematicaJogos from './pages/Artigos/AprenderMatematicaJogos';
import TabuadaPage from './pages/Artigos/TabuadaPage';
import HistoriaTabuada from './pages/Artigos/HistoriaTabuada';
import Artigos from './pages/Artigos/Artigos';
import BeneficiosJogosEducacionais from './pages/Artigos/BeneficiosJogosEducacionais';
import DicasParaEnsinarMatematicaEmCasa from './pages/Artigos/DicasParaEnsinarMatematicaEmCasa';

interface RoutesAppProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

function RoutesApp({ theme, toggleTheme }: RoutesAppProps) {
    return(
        <BrowserRouter>
            <Header theme={theme} toggleTheme={toggleTheme}/>
            <Breadcrumbs />
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
                <Route path='/artigos' element={<Artigos/>}/>
                <Route path='/artigos/aprender-matematica-com-jogos' element={<AprenderMatematicaJogos/>}/>
                <Route path='/artigos/historia-da-tabuada' element={<HistoriaTabuada/>}/>
                <Route path='/artigos/tabuada' element={<TabuadaPage/>}/>
                <Route path='/artigos/beneficios-jogos-educacionas' element={<BeneficiosJogosEducacionais/>}/>
                <Route path='/artigos/dicas-para-ensinar-matematica-em-casa' element={<DicasParaEnsinarMatematicaEmCasa/>}/>
                <Route path='/contribua' element={<Contribua/>}/>
                <Route path='*' element={<Erro/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default RoutesApp;
