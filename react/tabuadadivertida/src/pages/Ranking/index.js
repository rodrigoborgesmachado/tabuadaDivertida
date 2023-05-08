import './style.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {Link} from 'react-router-dom';
import api from '../../services/api';

function Ranking(){
    const navigate = useNavigate();

    const[lista, setLista] = useState([]);
    const[loadding, setLoadding] = useState(true);
    let contadorMultiplicacao = 1;
    let contadorAdicao = 1;
    let contadorSubtracao = 1;

    useEffect(() => {
        async function loadFilme(){
            await api.get(`ResultadosTabuadaDivertida/ranking`)
            .then((response) => {
                setLista(response.data.object);
                setLoadding(false);
            }).catch(() => {
                navigate('/', {replace: true});
                return;
            });
        }

        loadFilme();

        return () =>{

        }
    }, [navigate])

    if(loadding){
        return(
            <div className='loaddingDiv'>
                <img src={require('../../assets/hug.gif')} alt="Loading..." />
            </div>
        )
    }

    return(
        <div className='container'>
            <h1>
                Ranking
            </h1>
            <br/>
            <div className='rankingMultiplicacao'>
                <h3>Ranking Multiplicação</h3>
                <br/>
                {
                lista.filter((item) => item.tipo === 'M').map((item) => {
                    return(
                        <div key={item.nome+item.quantidade}>
                            <div className='divDescricao'>
                                <h4>
                                    {contadorMultiplicacao++}
                                </h4>
                                <h4>
                                    Nome: {item.nome}
                                </h4>
                                <h4>
                                    Tempo: {item.tempo}s
                                </h4>
                                <h4>
                                    Quantidade: {item.quantidade}
                                </h4>
                            </div>
                        </div>
                    );
                })
                }
            </div>
            <hr/>
            <br/>
            <div className='rankingMultiplicacao'>
                <h3>Ranking Adicao</h3>
                <br/>
                {
                lista.filter((item) => item.tipo === 'A').map((item) => {
                    return(
                        <div key={item.nome+item.quantidade}>
                            <div className='divDescricao'>
                                <h4>
                                    {contadorAdicao++}
                                </h4>
                                <h4>
                                    Nome: {item.nome}
                                </h4>
                                <h4>
                                    Tempo: {item.tempo}s   
                                </h4>
                                <h4>
                                Quantidade: {item.quantidade}
                                </h4>
                            </div>
                        </div>
                    );
                })
                }
            </div>
            <hr/>
            <br/>
            <div className='rankingMultiplicacao'>
                <h3>Ranking Subtração</h3>
                <br/>
                {
                lista.filter((item) => item.tipo === 'S').map((item) => {
                    return(
                        <div key={item.nome+item.quantidade}>
                            <div className='divDescricao'>
                                <h4>
                                    {contadorSubtracao++}
                                </h4>
                                <h4>
                                    Nome: {item.nome}
                                </h4>
                                <h4>
                                    Tempo: {item.tempo}s   
                                </h4>
                                <h4>
                                Quantidade: {item.quantidade}
                                </h4>
                            </div>
                        </div>
                    );
                })
                }
            </div>
            <br/>
            <br/>
            <br/>
            <br/>
            <div className='opcao'>
                <Link to="/">Home</Link>
            </div>
        </div>
    )
}

export default Ranking;