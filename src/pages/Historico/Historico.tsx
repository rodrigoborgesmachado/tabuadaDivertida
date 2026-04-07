import { useEffect, useState } from 'react';
import configData from "../../Config.json";
import WalkingRobot from '../../components/WalkingRobot/WalkingRobot';
import HappyRobot from '../../components/HappyRobot/HappyRobot';

type Questao = {
  questao: string;
  resposta: string;
  correta: boolean;
};

type HistoricoItem = {
  quantidadeQuestoes: number | string;
  quantidadeAcertos: number | string;
  tempo: number | string;
  nome: string;
  tipo: 'M' | 'D' | 'A' | 'S' | 'R' | 'E' | string;
  questoes?: Questao[] | null;
};

function Historico(){
    const [historico, setHistorico] = useState<HistoricoItem[]>([]);
    const [questoesModal, setQuestoesModal] = useState<Questao[]>([]);
    const [detail, setDetail] = useState(false);
    const [itemSelecionado, setItemSelecionado] = useState<HistoricoItem | null>(null);

    useEffect(() =>{
        try {
            const raw = localStorage.getItem(configData.HISTORICO);
            const temp = raw ? JSON.parse(raw) : [];
            setHistorico(Array.isArray(temp) ? temp.reverse() : []);
        } catch {
            setHistorico([]);
        }
    }, []);

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
        else if (tipo === 'E'){
            retorno = 'Expressões Numéricas';
        }

        return retorno;
    }

    function OpenModal(questoes?: Questao[] | null, item?: HistoricoItem){
        setQuestoesModal(questoes || []);
        setItemSelecionado(item || null);
        setDetail(true);
    }

    if(detail){
        return(
            <div className='global-pageContainer-left  options-preview'>
                <WalkingRobot />
                <div className='article-content'>
                    {itemSelecionado && (
                        <div className='resumo-kpis-wrap'>
                            <div>
                                <h2>Resultado:</h2>
                                <h3>Nome: {itemSelecionado.nome || '—'}</h3>
                                <h3>
                                    Acertos: {parseInt(String(itemSelecionado.quantidadeAcertos || '0'))}/{parseInt(String(itemSelecionado.quantidadeQuestoes || '0'))}
                                </h3>
                                <h3>Tempo: {itemSelecionado.tempo || 0}s</h3>
                                <h3>Tipo: {RetornaTipo(String(itemSelecionado.tipo))}</h3>
                            </div>
                            <HappyRobot happy={true} />
                        </div>
                    )}
                </div>

                {questoesModal && questoesModal.length > 0 && (
                    <div className='respostasQuestoes'>
                        <h2>Respostas</h2>
                        <div className='resultados-lista'>
                            {questoesModal.map((q, idx) => (
                                <div className='resultados-item' key={idx}>
                                    <h3>
                                        {q.questao} = {q.resposta} {q.correta ? '✓' : '✗'}
                                    </h3>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className='botoes'>
                    <button className='global-button global-button--full-width' onClick={() => setDetail(false)}>Histórico</button>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className='pageContainer options-preview'>
                <h1>Seus Jogos📍</h1>
                <table className='admin-table'>
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
                                <h3>
                                Taxa
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
                                        <td key={item.nome} data-label='Nome'>
                                            <h4>
                                                {item.nome}
                                            </h4>
                                        </td>
                                        <td data-label='Quantidade'>
                                            <h4>
                                                {item.quantidadeQuestoes}
                                            </h4>
                                        </td>
                                        <td data-label='Acertos'>
                                            <h4>
                                                {item.quantidadeAcertos}
                                            </h4>
                                        </td>
                                        <td data-label='Tempo'>
                                            <h4>
                                                {item.tempo}
                                            </h4>
                                        </td>
                                        <td data-label='Tipo'>
                                            <h4>
                                                {RetornaTipo(item.tipo)}
                                            </h4>
                                        </td>
                                        <td data-label='Taxa'>
                                            <h4>
                                                {(() => {
                                                    const q = parseInt(String(item.quantidadeQuestoes || '0')) || 0;
                                                    const a = parseInt(String(item.quantidadeAcertos || '0')) || 0;
                                                    return q > 0 ? `${((a / q) * 100).toFixed(1)}%` : '0.0%';
                                                })()}
                                            </h4>
                                        </td>
                                        <td>
                                            {
                                                item.questoes != null ?
                                                <button className='global-button global-button--full-width' onClick={() => OpenModal(item.questoes, item)}>
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
                </table>
                <div className='botoes'>
                    <a className='global-button global-button--full-width global-button--back' href="/resultados">
                        <span className='option-link'>
                            Voltar
                        </span>
                    </a>
                </div>
            </div>
        </div>
    )
}

export default Historico;
