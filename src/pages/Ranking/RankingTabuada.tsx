import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Table } from 'react-bootstrap';
import PacmanLoader from '../../components/PacmanLoader/PacmanLoader';
import { TIMEOUT_ENVIO, TOP_RANKING } from '../../services/resultadosJogos';

interface RankingTabuadaProps {
    filtroNome: string;
    nomeJogador: string;
}

function RankingTabuada({ filtroNome, nomeJogador }: RankingTabuadaProps){
    const[lista, setLista] = useState([]);
    const[quantidade, setQuantidade] = useState([]);
    const[openQuantidades, setOpenQuantidades] = useState<Record<number, boolean>>({});
    const[quantidadeTetativas, setQuantidadeTentativas] = useState([]);
    const[type, setType] = useState('M');
    const[loadding, setLoadding] = useState(true);
    const[erro, setErro] = useState(false);
    const[tentativa, setTentativa] = useState(0);

    useEffect(() => {
        async function CarregaLista(){
            setErro(false);
            setLoadding(true);
            await api.get(`ResultadosTabuadaDivertida/ranking?top=${TOP_RANKING}`, { timeout: TIMEOUT_ENVIO })
            .then((response) => {
                setLista(response.data.object);
                const qs = response.data.object.map(obj => obj.quantidade).filter((value, index, array) => array.indexOf(value) === index);
                setQuantidade(qs);
                const openObj: Record<number, boolean> = {};
                qs.forEach((q: number) => {
                    openObj[q] = false;
                });
                setOpenQuantidades(openObj);
                setQuantidadeTentativas(response.data.total);
                setLoadding(false);
            }).catch(() => {
                setErro(true);
                setLoadding(false);
            });
        }

        CarregaLista();
    }, [tentativa])

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
        else if(type === 'E'){
            return 'Expressões Numéricas';
        }
    }

    if(loadding){
        return(
            <PacmanLoader />
        )
    }

    if(erro){
        return(
            <div className='ranking-mensagem' role='alert'>
                <p>😕 Não foi possível carregar o ranking agora. Tente novamente em instantes.</p>
                <button type='button' className='global-button' onClick={() => setTentativa((atual) => atual + 1)}>
                    Tentar novamente
                </button>
            </div>
        )
    }

    const itensDoTipo = lista.filter(item =>
        item.tipo === type &&
        item.nome.toLowerCase().includes(filtroNome.toLowerCase())
    );

    return(
        <>
            <h3>🔥Total de jogadores: {quantidadeTetativas}🔥</h3>
            <br/>
            <br/>
            <div className='botoesRanking'>
                <button className='global-button global-button--full-width' onClick={() => setType('M')}>Multiplicação</button>
                <button className='global-button global-button--full-width' onClick={() => setType('D')}>Divisão</button>
                <button className='global-button global-button--full-width' onClick={() => setType('A')}>Adição</button>
            </div>
            <div className='botoesRanking'>
                <button className='global-button global-button--full-width' onClick={() => setType('S')}>Subtração</button>
                <button className='global-button global-button--full-width' onClick={() => setType('E')}>Expressões Numéricas</button>
                <button className='global-button global-button--full-width' onClick={() => setType('R')}>Aleatório</button>
            </div>
            <div className='rankingMultiplicacao'>
                <h2>Ranking {retornaTextoTipo()}</h2>
                <br/>
                {
                itensDoTipo.length === 0 &&
                <p className='ranking-mensagem'>Nenhum resultado encontrado.</p>
                }
                {
                quantidade.map((q) =>{
                    return(
                        itensDoTipo.filter(item => item.quantidade === q).length === 0 ?
                        <>
                        </>
                            :
                        <div key={q} className='item-ranking-table'>
                            <div
                                className='quantidade'
                                onClick={() => setOpenQuantidades(prev => ({...prev, [q]: !prev[q]}))}
                                style={{cursor: 'pointer'}}
                            >
                                <h3>
                                    {q} Questões
                                </h3>
                                <h3>
                                    {openQuantidades[q] ? '▼' : '►'}
                                </h3>
                            </div>
                            {openQuantidades[q] && (
                            <>
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
                                        <th>
                                            <h4>
                                                Pontuação
                                            </h4>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                {
                                lista.filter((item) => item.tipo === type && item.quantidade === q).map((item, index) => {
                                    return(
                                        <tr
                                            key={index}
                                            className={nomeJogador === item.nome ? 'posicao' : ''}
                                            style={{ display: filtroNome && !item.nome.toLowerCase().includes(filtroNome.toLowerCase()) ? 'none' : 'table-row' }}
                                        >
                                            <td data-label='Posição'>
                                                {index === 0 ? <>🥇</> : <></>}
                                                {index === 1 ? <>🥈</> : <></>}
                                                {index === 2 ? <>🥉</> : <></>}
                                                {index > 2 ? <>{index + 1}</> : <></>}
                                            </td>
                                            <td data-label='Nome'>
                                                {index === 0 ? <>🏆</> : <></>}{item.nome}
                                            </td>
                                            <td data-label='Tempo'>
                                                {index === 0 ? <>🏆</> : <></>}{item.tempo}s
                                            </td>
                                            <td data-label='Pontuação'>
                                                {item.pontuacao}
                                            </td>
                                        </tr>
                                    );
                                })
                                }
                                </tbody>
                            </Table>
                            <br/>
                            </>
                            )}
                        </div>
                    )
                })
                }
            </div>
        </>
    )
}

export default RankingTabuada;
