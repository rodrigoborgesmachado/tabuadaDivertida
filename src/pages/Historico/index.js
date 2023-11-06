import './historico.css';
import { useEffect, useState } from 'react';
import configData from "./../../Config.json";
import { Table } from 'react-bootstrap';
import Modal from 'react-modal';

const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      border: 0,
      background: '#424242',
      marginRight: '-50%',
      'border-radius': '20px',
      transform: 'translate(-50%, -50%)',
    },
  };

function Historico(){
    const [historico, setHistorico] = useState(new Array());
    const [modalIsOpen, setIsOpen] = useState(false);
    const [questoesModal, setQuestoesModal] = useState([]);

    function openModal() {
        setIsOpen(true);
    }

    function closeModal() {
        setIsOpen(false);
    }

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
        openModal();
    }

    return (
        <div className='global-pageContainer-left'>
            <Modal
              isOpen={modalIsOpen}
              onRequestClose={closeModal}
              style={customStyles}
              contentLabel="Respostas"
            >
                <div className='contextModal'>
                    <div className='bodymodal'>
                        <h3>Respostas</h3>
                        <h3>
                            {
                                questoesModal.map((questao, index) => {
                                    return(
                                        <>
                                            {questao.questao} = {questao.resposta} {questao.correta ? '🎉' : '😫'}
                                            {(index > 0) && index%10 == 0 ? <br/> : ' | '}
                                        </>
                                    )
                                })
                            }
                        </h3>
                    </div>
                </div>
            </Modal>
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
        </div>
    )
}

export default Historico;