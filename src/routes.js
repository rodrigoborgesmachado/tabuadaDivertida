import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Home from './pages/Home';
import Formulario from './pages/Formulario';
import TipoJogo from './pages/TipoJogo';
import Jogo from './pages/Jogo';
import Final from './pages/Final';
import Ranking from './pages/Ranking';
import Instrucoes from './pages/Instrucoes';
import Erro from './pages/Erro';
import Header from './components/Header';

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
                <Route path='*' element={<Erro/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default RoutesApp;