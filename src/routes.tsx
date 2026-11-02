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
import ExpressoesNumericas from './pages/Artigos/ExpressoesNumericas';
import TabuadaMetodosAntigosModernos from './pages/Artigos/TabuadaMetodosAntigosModernos';
import Resultados from './pages/Resultados/Resultados';
import Jogo2048 from './pages/Jogo2048/Jogo2048';
import Jogos from './pages/Jogos/Jogos';
import MemoriaTabuada from './pages/MemoriaTabuada/MemoriaTabuada';
import MaiorOuMenor from './pages/MaiorOuMenor/MaiorOuMenor';
import Conquistas from './pages/Conquistas/Conquistas';
import Personalizar from './pages/Personalizar/Personalizar';
import AvisoConquista from './components/AvisoConquista/AvisoConquista';

interface RoutesAppProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

function RoutesApp({ theme, toggleTheme }: RoutesAppProps) {
    return(
        <BrowserRouter>
            <Header theme={theme} toggleTheme={toggleTheme}/>
            <Breadcrumbs />
            <AvisoConquista />
            <Routes>                
                <Route path='/' element={<Home/>}/>
                <Route path='/formulario' element={<Formulario/>}/>
                <Route path='/selecionarjogo' element={<TipoJogo/>}/>
                <Route path='/contagem/:tipo' element={<Contagem/>}/>
                <Route path='/jogo/:tipo' element={<Jogo/>}/>
                <Route path='/ranking' element={<Ranking/>}/>
                <Route path='/resultados' element={<Resultados/>}/>
                <Route path='/jogo2048' element={<Jogo2048/>}/>
                <Route path='/jogos' element={<Jogos/>}/>
                <Route path='/jogos/memoria-da-tabuada' element={<MemoriaTabuada/>}/>
                <Route path='/jogos/maior-ou-menor' element={<MaiorOuMenor/>}/>
                <Route path='/conquistas' element={<Conquistas/>}/>
                <Route path='/personalizar' element={<Personalizar/>}/>
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
                <Route path='/artigos/expressoes-numericas' element={<ExpressoesNumericas/>}/>
                <Route path='/artigos/tabuada-metodos-antigos-x-modernos' element={<TabuadaMetodosAntigosModernos/>}/>
                <Route path='/contribua' element={<Contribua/>}/>
                <Route path='*' element={<Erro/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default RoutesApp;
