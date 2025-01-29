import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {Link} from 'react-router-dom';
import api from '../../services/api';
import { Table } from 'react-bootstrap';
import Config from '../../Config.json';

function Ranking(){
    const navigate = useNavigate();

    const[lista, setLista] = useState([]);
    const[quantidade, setQuantidade] = useState([]);
    const[quantidadeTetativas, setQuantidadeTentativas] = useState([]);
    const[quantidadeRanking, setQuantidadeRanking] = useState([]);
    const[type, setType] = useState('M');
    const[loadding, setLoadding] = useState(true);

    
    useEffect(() => {
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

        CarregaLista();
    }, [lista, quantidade, quantidadeTetativas, quantidadeRanking, loadding, navigate])

    function retornaTextoTipo(){
        if(type === 'M'){
            return 'Multiplicação';
        }
        else if(type === 'D'){
            return 'Divisão';
        }
        else if(type === 'A'){
            return 'Adição';
        }
        else if(type === 'S'){
            return 'Subtração';
        }
        else if(type === 'R'){
            return 'Aleatório';
        }
    }

    if(loadding){
        return(
            <div className='loaddingDiv'>
                <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
            </div>
        )
    }

    return(
        <div className='global-pageContainer-left'>
            <h1>
                Ranking
            </h1>
            <br/>
            <div className='rankingText'>
                <h3>🔥Apenas {quantidadeRanking} de {quantidadeTetativas} jogadores conseguiram entrar no ranking!!🔥</h3>
                <br/>
                <br/>
                <div className='botoesRanking'>
                    <button className='global-button global-button--full-width' onClick={() => setType('M')}>Multiplicação</button>
                    <button className='global-button global-button--full-width' onClick={() => setType('D')}>Divisão</button>
                    <button className='global-button global-button--full-width' onClick={() => setType('A')}>Adição</button>
                </div>
                <div className='botoesRanking'>
                    <button className='global-button global-button--full-width' onClick={() => setType('S')}>Subtração</button>
                    <button className='global-button global-button--full-width' onClick={() => setType('R')}>Aleatório</button>
                </div>
                <div className='rankingMultiplicacao'>
                    <h2>Ranking {retornaTextoTipo()}</h2>
                    <br/>
                    {
                    quantidade.map((q) =>{
                        return(
                            lista.filter((item) => item.tipo === type && item.quantidade === q).length === 0 ?
                            <>
                            </>
                                :
                            <div key={q}>
                                <div className='quantidade'>
                                    Quantidade: {q}
                                </div>
                                <br/>
                                <Table className='tableRanking'>
                                    <thead>
                                        <tr>
                                            <th>
                                                <h4>
                                                    Posição
                                                </h4>
                                            </th>
                                            <th>
                                                <h4>
                                                    Nome
                                                </h4>
                                            </th>
                                            <th>
                                                <h4>
                                                    Tempo
                                                </h4>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {
                                    lista.filter((item) => item.tipo === type && item.quantidade === q).map((item, index) => {
                                        return(
                                            <tr key={index} className={localStorage.getItem(Config.NOME_PARAM) === item.nome ? 'posicao' : ''}>
                                                <td>
                                                    {index === 0 ? <>🥇</> : <></>}
                                                    {index === 1 ? <>🥈</> : <></>}
                                                    {index === 2 ? <>🥉</> : <></>}
                                                    {index > 2 ? <>{index + 1}</> : <></>}
                                                </td>
                                                <td>
                                                    {index === 0 ? <>🏆</> : <></>}{item.nome}
                                                </td>
                                                <td>
                                                    {index === 0 ? <>🏆</> : <></>}{item.tempo}s
                                                </td>
                                            </tr>
                                        );
                                    })
                                    }
                                    </tbody>
                                </Table>
                                <br/>
                            </div>
                        )
                    })
                    }
                </div>
            </div>
            <div className='botoes'>
                <Link className='global-button global-button--full-width' to="/">Home</Link>
                <Link className='global-button global-button--full-width' to="/historico">Histórico</Link>
            </div>
        </div>
    )
}

export default Ranking;