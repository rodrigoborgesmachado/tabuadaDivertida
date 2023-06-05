import './historico.css';
import { useEffect, useState } from 'react';
import configData from "./../../Config.json";
import { Table } from 'react-bootstrap';

function Historico(){
    const [historico, setHistorico] = useState(new Array());

    useEffect(() =>{
        var temp = JSON.parse(localStorage.getItem(configData.HISTORICO));
        console.log(temp);
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

    return (
        <div className='container'>
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
                    </tr>
                </thead>
                <tbody>
                    {
                    historico?.map((item, index) => {
                            return(
                                <tr key={item.nome}>
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
                                </tr>
                            )
                        })
                    }
                </tbody>
            </Table>
        </div>
    )
}

export default Historico;