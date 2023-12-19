import './style.css';
import {Link} from 'react-router-dom';

function Instrucoes(){
    return(
    <div className='global-pageContainer-left'>
        <h3>
        Prepare-se para uma aventura matemágica! 🎩✨<br/><br/>

        📝 Digite o seu nome, escolha o tipo de tabuada e mergulhe nessa diversão! 🚀💡<br/><br/>

        💪 Desafie-se a acertar todas as respostas no menor tempo possível. Você será um verdadeiro mestre da matemágica! ⏱️⚡️<br/><br/>

        ⭐ Será que você consegue conquistar um lugar no tão desejado Top 10 do ranking? 🏆🔝<br/><br/>

        Vamos lá, mostre suas habilidades e deixe todos boquiabertos com seu conhecimento matemágico! 💥 <br/><br/>   
        </h3>    
        <Link className='global-button global-button--full-width' to="/">Voltar</Link>
    </div>
    )
}

export default Instrucoes;