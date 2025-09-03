import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Contagem.css';

function Contagem(){
    const { tipo } = useParams();
    const navigate = useNavigate();
    const [contador, setContador] = useState(3);

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
        <div className='countdown-container global-pageContainer-left'>
            <h2 className='countdown-text'>Prepare-se!</h2>
            {contador > 0 && (
                <div key={contador} className='countdown-number'>{contador}</div>
            )}
        </div>
    );
}

export default Contagem;
