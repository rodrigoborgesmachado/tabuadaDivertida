import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Table } from 'react-bootstrap';
import Config from '../../Config.json';
import PacmanLoader from '../../components/PacmanLoader/PacmanLoader';

function Ranking(){
    const navigate = useNavigate();

    const[lista, setLista] = useState([]);
    const[quantidade, setQuantidade] = useState([]);
    const[openQuantidades, setOpenQuantidades] = useState<Record<number, boolean>>({});
    const[quantidadeTetativas, setQuantidadeTentativas] = useState([]);
    const[type, setType] = useState('M');
    const[loadding, setLoadding] = useState(true);
    const [filtroNome, setFiltroNome] = useState('');
    
    useEffect(() => {
        async function CarregaLista(){
            await api.get(`ResultadosTabuadaDivertida/ranking`)
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
                navigate('/', {replace: true});
                return;
            });
        }

        CarregaLista();
    }, [navigate])

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
            <PacmanLoader dots={7} mouthAngle={40} pellets={[1, 2, 3, 4, 5, 6]} size={64}/>
        )
    }

    return(
        <div className='global-pageContainer-left options-preview'>
            <h1>
                Ranking
            </h1>
            <br/>
            <div className='rankingText'>
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
                <h2>Filtro</h2>
                <div className='global-mt'>
                    <input
                        type="text"
                        className="global-input"
                        placeholder="Filtrar por nome..."
                        value={filtroNome}
                        onChange={(e) => setFiltroNome(e.target.value)}
                    />
                </div>
                <br />
                <div className='rankingMultiplicacao'>
                    <h2>Ranking {retornaTextoTipo()}</h2>
                    <br/>
                    {
                    quantidade.map((q) =>{
                        return(
                            lista.filter(item =>
                                item.tipo === type &&
                                item.quantidade === q &&
                                item.nome.toLowerCase().includes(filtroNome.toLowerCase())
                            ).length === 0 ?
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
                                                className={localStorage.getItem(Config.NOME_PARAM) === item.nome ? 'posicao' : ''}
                                                style={{ display: filtroNome && !item.nome.toLowerCase().includes(filtroNome.toLowerCase()) ? 'none' : 'table-row' }}
                                            >
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
                                                <td>
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
            </div>
            <div className='botoes'>
                <a className='global-button global-button--full-width' href="/historico">Histórico</a>
                <a className='global-button global-button--full-width global-button--back' href="/">Voltar</a>
            </div>
        </div>
    )
}

export default Ranking;
