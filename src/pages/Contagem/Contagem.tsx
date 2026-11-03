import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import configData from '../../Config.json';
import { lerQuantidade } from '../../services/jogador';
import './Contagem.css';

function Contagem(){
    const { tipo } = useParams();
    const navigate = useNavigate();
    const [contador, setContador] = useState(3);

    useEffect(() => {
        if (tipo !== 'T') {
            localStorage.setItem(configData.QUANTIDADE_PARAM, String(lerQuantidade()));
        }
    }, [tipo]);

    useEffect(() => {
        const timer = setInterval(() => {
            setContador((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (contador === 0) {
            navigate(`/jogo/${tipo}`);
        }
    }, [contador, navigate, tipo]);

    return (
        <div className='global-pageContainer-left options-preview'>
            <h2 className='countdown-text'>Prepare-se!</h2>
            {contador > 0 && (
                <div key={contador} className='countdown-number'>{contador}</div>
            )}
        </div>
    );
}

export default Contagem;
