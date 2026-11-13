import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home/Home';
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
import Jogo2048 from './pages/Jogo2048/Jogo2048';
import Jogos from './pages/Jogos/Jogos';
import MemoriaTabuada from './pages/MemoriaTabuada/MemoriaTabuada';
import MaiorOuMenor from './pages/MaiorOuMenor/MaiorOuMenor';
import TesteQi from './pages/TesteQi/TesteQi';
import CorridaRobo from './pages/CorridaRobo/CorridaRobo';
import ContandoBichinhos from './pages/ContandoBichinhos/ContandoBichinhos';
import Sudoku from './pages/Sudoku/Sudoku';
import QueHorasSao from './pages/QueHorasSao/QueHorasSao';
import Progresso from './pages/Progresso/Progresso';
import Personalizar from './pages/Personalizar/Personalizar';
import AvisoConquista from './components/AvisoConquista/AvisoConquista';
import ComemoracaoNivel from './components/ComemoracaoNivel/ComemoracaoNivel';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import AppNativo from './components/AppNativo/AppNativo';
import BarraNavegacao from './components/BarraNavegacao/BarraNavegacao';
import Mais from './pages/Mais/Mais';
import { ehApp } from './services/plataforma';

function RoutesApp() {
    return(
        <BrowserRouter>
            <ScrollToTop/>
            <AppNativo/>
            <Header/>
            <Breadcrumbs />
            <AvisoConquista />
            <ComemoracaoNivel />
            <Routes>                
                <Route path='/' element={<Home/>}/>
                <Route path='/formulario' element={<Navigate to='/selecionarjogo' replace/>}/>
                <Route path='/selecionarjogo' element={<TipoJogo/>}/>
                <Route path='/contagem/:tipo' element={<Contagem/>}/>
                <Route path='/jogo/:tipo' element={<Jogo/>}/>
                <Route path='/ranking' element={<Ranking/>}/>
                <Route path='/progresso' element={<Progresso/>}/>
                <Route path='/resultados' element={<Navigate to='/progresso?aba=resultados' replace/>}/>
                <Route path='/jogo2048' element={<Jogo2048/>}/>
                <Route path='/jogos' element={<Jogos/>}/>
                <Route path='/jogos/memoria-da-tabuada' element={<MemoriaTabuada/>}/>
                <Route path='/jogos/maior-ou-menor' element={<MaiorOuMenor/>}/>
                <Route path='/jogos/teste-de-qi' element={<TesteQi/>}/>
                <Route path='/jogos/corrida-contra-o-robo' element={<CorridaRobo/>}/>
                <Route path='/jogos/contando-bichinhos' element={<ContandoBichinhos/>}/>
                <Route path='/jogos/sudoku' element={<Sudoku/>}/>
                <Route path='/jogos/que-horas-sao' element={<QueHorasSao/>}/>
                <Route path='/conquistas' element={<Navigate to='/progresso?aba=conquistas' replace/>}/>
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
                {ehApp() && <Route path='/mais' element={<Mais/>}/>}
                <Route path='*' element={<Erro/>}/>
            </Routes>
            <BarraNavegacao/>
        </BrowserRouter>
    )
}

export default RoutesApp;
