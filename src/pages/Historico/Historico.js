import { useEffect, useState } from 'react';
import configData from "../../Config.json";
import { Table } from 'react-bootstrap';
import {Link} from 'react-router-dom';

function Historico(){
    const [historico, setHistorico] = useState(new Array());
    const [questoesModal, setQuestoesModal] = useState();
    const [detail, setDetail] = useState(false);

    useEffect(() =>{
        var temp = JSON.parse(localStorage.getItem(configData.HISTORICO));
        setHistorico(temp);
    }, {});

    function RetornaTipo(tipo){
        var retorno = 'Multiplicação';

        if(tipo === 'R'){
            retorno = 'Aleatório';
        }
        else if(tipo === 'D'){
            retorno = 'Divisão';
        }
        else if (tipo === 'S'){
            retorno = 'Subtração';
        }
        else if (tipo === 'A'){
            retorno = 'Adição';
        }

        return retorno;
    }

    function OpenModal(questoes){
        setQuestoesModal(questoes);
        setDetail(true);
    }

    if(detail){
        return(
            <div className='global-pageContainer-left'>
                <h3>Respostas</h3>
                <h3>
                    {
                        questoesModal.map((questao, index) => {
                            return(
                                <>
                                    {questao.questao} = {questao.resposta} {questao.correta ? '🎉' : '😫'}
                                    <br/>
                                </>
                            )
                        })
                    }
                </h3>
                <div className='botoes'>
                    <button className='global-button global-button--full-width' onClick={() => setDetail(false)}>Histórico</button>
                </div>
            </div>
        )
    }

    return (
        <div className='global-pageContainer-left'>
            <h1>Histórico</h1>
            <Table>
                <thead>
                    <tr>
                        <th>
                            <h3>
                            Nome
                            </h3>
                        </th>
                        <th>
                            <h3>
                            Nº questões Tentadas
                            </h3>
                        </th>
                        <th>
                            <h3>
                            Nº questões Acertadas
                            </h3>
                        </th>
                        <th>
                            <h3>
                            Tempo
                            </h3>
                        </th>
                        <th>
                            <h3>
                            Tipo
                            </h3>
                        </th>
                        <th>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {
                    historico?.map((item, index) => {
                            return(
                                <tr key={index}>
                                    <td key={item.nome}>
                                        <h4>
                                            {item.nome}
                                        </h4>
                                    </td>
                                    <td>
                                        <h4>
                                            {item.quantidadeQuestoes}
                                        </h4>
                                    </td>
                                    <td>
                                        <h4>
                                            {item.quantidadeAcertos}
                                        </h4>
                                    </td>
                                    <td>
                                        <h4>
                                            {item.tempo}
                                        </h4>
                                    </td>
                                    <td>
                                        <h4>
                                            {RetornaTipo(item.tipo)}
                                        </h4>
                                    </td>
                                    <td>
                                        {
                                            item.questoes != null ?
                                            <button className='global-button global-button--full-width' onClick={() => OpenModal(item.questoes)}>
                                                Respostas
                                            </button>
                                            :
                                            <h4>
                                                Histórico não disponível
                                            </h4>
                                        }
                                    </td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </Table>
            <div className='botoes'>
                <Link className='global-button global-button--full-width' to="/">Home</Link>
            </div>
        </div>
    )
}

export default Historico;