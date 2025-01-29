import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Home from './pages/Home/Home';
import Formulario from './pages/Formulario/Formulario';
import TipoJogo from './pages/TipoJogo/TipoJogo';
import Jogo from './pages/Jogo/Jogo';
import Final from './pages/Final/Final';
import Ranking from './pages/Ranking/Ranking';
import Instrucoes from './pages/Instrucoes/Instrucoes';
import Erro from './pages/Erro/Erro';
import Historico from './pages/Historico/Historico';
import Header from './components/Header/index';

function RoutesApp(){
    return(
        <BrowserRouter>
            <Header/>
            <Routes>
                <Route path='/' element={<Home/>}/>
                <Route path='/formulario' element={<Formulario/>}/>
                <Route path='/selecionarjogo' element={<TipoJogo/>}/>
                <Route path='/jogo/:tipo' element={<Jogo/>}/>
                <Route path='/ranking' element={<Ranking/>}/>
                <Route path='/final/:tipo' element={<Final/>}/>
                <Route path='/instrucoes' element={<Instrucoes/>}/>
                <Route path='/historico' element={<Historico/>}/>
                <Route path='*' element={<Erro/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default RoutesApp;