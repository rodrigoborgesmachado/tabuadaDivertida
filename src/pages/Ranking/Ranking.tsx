import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Config from '../../Config.json';
import RankingTabuada from './RankingTabuada';
import RankingJogo from './RankingJogo';
import { abasRanking, buscarJogoRanking } from './rankingConfig';
import './Ranking.css';

function Ranking(){
    const [searchParams, setSearchParams] = useSearchParams();
    const [filtroNome, setFiltroNome] = useState('');
    const jogo = buscarJogoRanking(searchParams.get('jogo'));
    const abaAtiva = jogo ? jogo.id : 'tabuada';
    const modoParam = searchParams.get('modo');
    const modo = jogo && jogo.modos.length > 0 ? (jogo.modos.find((item) => item.id === modoParam) || jogo.modos[0]).id : null;
    const nomeJogador = localStorage.getItem(Config.NOME_PARAM) || '';

    return(
        <div className='global-pageContainer-left options-preview ranking-page'>
            <h1>
                Ranking
            </h1>
            <div className='ranking-abas' role='tablist' aria-label='Jogos do ranking'>
                {abasRanking.map((aba) => (
                    <button
                        key={aba.id}
                        type='button'
                        role='tab'
                        aria-selected={abaAtiva === aba.id}
                        className={`ranking-aba${abaAtiva === aba.id ? ' ranking-aba--ativa' : ''}`}
                        onClick={() => setSearchParams({ jogo: aba.id }, { replace: true })}
                    >
                        <span aria-hidden='true'>{aba.icone}</span> {aba.nome}
                    </button>
                ))}
            </div>
            <div className='rankingText'>
                {jogo && modo && (
                    <label className='ranking-modo'>
                        Modo
                        <select
                            className='global-input'
                            value={modo}
                            onChange={(e) => setSearchParams({ jogo: jogo.id, modo: e.target.value }, { replace: true })}
                        >
                            {jogo.modos.map((item) => (
                                <option key={item.id} value={item.id}>{item.label}</option>
                            ))}
                        </select>
                    </label>
                )}
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
                {jogo
                    ? <RankingJogo key={`${jogo.id}-${modo}`} jogo={jogo} modo={modo} filtroNome={filtroNome} nomeJogador={nomeJogador}/>
                    : <RankingTabuada filtroNome={filtroNome} nomeJogador={nomeJogador}/>}
            </div>
            <div className='botoes'>
                <a className='global-button global-button--full-width' href="/historico">Histórico</a>
                <a className='global-button global-button--full-width global-button--back' href="/">Voltar</a>
            </div>
        </div>
    )
}

export default Ranking;
