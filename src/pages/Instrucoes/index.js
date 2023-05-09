import './style.css';
import {Link} from 'react-router-dom';

function Instrucoes(){
    return(
    <div className='container'>
        Preencha com seu nome, selecione qual tipo de tabuada deseja e se divirta! Consegue ficar no top 10 do ranking?
        <Link to="/">Home</Link>
    </div>
    )
}

export default Instrucoes;