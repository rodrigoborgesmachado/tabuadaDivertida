import './style.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {Link} from 'react-router-dom';
import api from '../../services/api';

function Ranking(){
    const navigate = useNavigate();

    const[lista, setLista] = useState([]);
    const[quantidade, setQuantidade] = useState([]);
    const[quantidadeTetativas, setQuantidadeTentativas] = useState([]);
    const[quantidadeRanking, setQuantidadeRanking] = useState([]);
    const[loadding, setLoadding] = useState(true);

    async function CarregaLista(){
        await api.get(`ResultadosTabuadaDivertida/ranking`)
        .then((response) => {
            setLista(response.data.object);
            setQuantidade(response.data.object.map(obj => obj.quantidade).filter((value, index, array) => array.indexOf(value) === index));
            setQuantidadeTentativas(response.data.total);
            setQuantidadeRanking(response.data.quantity);
            setLoadding(false);
        }).catch(() => {
            navigate('/', {replace: true});
            return;
        });
    }

    useEffect(() => {
        CarregaLista();

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
            <div className='rankingText'>
                <h3>🔥Apenas {quantidadeRanking} de {quantidadeTetativas} jogadores conseguiram entrar no ranking!!🔥</h3>
                <br/>
                <br/>
                <div className='rankingMultiplicacao'>
                    <h3>Ranking Multiplicação</h3>
                    <br/>
                    {
                    quantidade.map((q) =>{
                        return(
                            lista.filter((item) => item.tipo === 'M' && item.quantidade == q).length == 0 ?
                            <>
                            </>
                                :
                            <div key={q}>
                                <div className='quantidade'>
                                    Quantidade: {q}
                                </div>
                                <br/>
                                {
                                lista.filter((item) => item.tipo === 'M' && item.quantidade == q).map((item, index) => {
                                    return(
                                        <div key={index}>
                                            <div className='divDescricao'>
                                                <h4>
                                                    {index == 0 ? <>🥇</> : <></>}
                                                    {index == 1 ? <>🥈</> : <></>}
                                                    {index == 2 ? <>🥉</> : <></>}
                                                    {index > 2 ? <>{index + 1}</> : <></>}
                                                </h4>
                                                <h4>
                                                    {index == 0 ? <>🏆</> : <></>}{item.nome}
                                                </h4>
                                                <h4>
                                                    {index == 0 ? <>🏆</> : <></>}{item.tempo}s
                                                </h4>
                                            </div>
                                        </div>
                                    );
                                })
                                }
                                <hr/>
                                <br/>
                            </div>
                        )
                    })
                    }
                </div>
                <br/>
                <div className='rankingMultiplicacao'>
                    <h3>Ranking Adicao</h3>
                    <br/>
                    {
                    quantidade.map((q) =>{
                        return(
                            lista.filter((item) => item.tipo === 'A' && item.quantidade == q).length == 0 ?
                            <>
                            </>
                                :
                            <div key={q}>
                                <div className='quantidade'>
                                    Quantidade: {q}
                                </div>
                                <br/>
                                {
                                lista.filter((item) => item.tipo === 'A' && item.quantidade == q).map((item, index) => {
                                    return(
                                        <div key={index}>
                                            <div className='divDescricao'>
                                                <h4>
                                                    {index == 0 ? <>🥇</> : <></>}
                                                    {index == 1 ? <>🥈</> : <></>}
                                                    {index == 2 ? <>🥉</> : <></>}
                                                    {index > 2 ? <>{index + 1}</> : <></>}
                                                </h4>
                                                <h4>
                                                    {index == 0 ? <>🏆</> : <></>}{item.nome}
                                                </h4>
                                                <h4>
                                                    {index == 0 ? <>🏆</> : <></>}{item.tempo}s
                                                </h4>
                                            </div>
                                        </div>
                                    );
                                })
                                }
                                <hr/>
                                <br/>
                            </div>
                        )
                    })
                    }
                </div>
                <br/>
                <div className='rankingMultiplicacao'>
                    <h3>Ranking Subtração</h3>
                    <br/>
                    {
                    quantidade.map((q) =>{
                        return(
                            lista.filter((item) => item.tipo === 'S' && item.quantidade == q).length == 0 ?
                            <>
                            </>
                                :
                            <div key={q}>
                                <div className='quantidade'>
                                    Quantidade: {q}
                                </div>
                                <br/>
                                {
                                lista.filter((item) => item.tipo === 'S' && item.quantidade == q).map((item, index) => {
                                    return(
                                        <div key={index}>
                                            <div className='divDescricao'>
                                                <h4>
                                                    {index == 0 ? <>🥇</> : <></>}
                                                    {index == 1 ? <>🥈</> : <></>}
                                                    {index == 2 ? <>🥉</> : <></>}
                                                    {index > 2 ? <>{index + 1}</> : <></>}
                                                </h4>
                                                <h4>
                                                    {index == 0 ? <>🏆</> : <></>}{item.nome}
                                                </h4>
                                                <h4>
                                                    {index == 0 ? <>🏆</> : <></>}{item.tempo}s
                                                </h4>
                                            </div>
                                        </div>
                                    );
                                })
                                }
                                <hr/>
                                <br/>
                            </div>
                        )
                    })
                    }
                </div>
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