import {Link} from 'react-router-dom';

function Erro(){
    return(
        <div className="global-pageContainer-left">
            <h1>404</h1>
            <h2>Página não encontrada</h2>
            <Link to="/">Home</Link>
        </div>
    )
}

export default Erro;