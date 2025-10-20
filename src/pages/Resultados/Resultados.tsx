import { useEffect, useMemo, useState } from 'react';
import configData from "../../Config.json";
import WalkingRobot from "../../components/WalkingRobot/WalkingRobot";
import HappyRobot from "../../components/HappyRobot/HappyRobot";

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
  tipo: 'M' | 'D' | 'A' | 'S' | 'R' | string;
  questoes?: Questao[] | null;
};

function Resultados() {
  const [nome, setNome] = useState<string>('');
  const [quantidade, setQuantidade] = useState<number>(0);
  const [acertos, setAcertos] = useState<number>(0);
  const [tempo, setTempo] = useState<number>(0);
  const [pontuacao, setPontuacao] = useState<number>(0);
  const [recorde, setRecorde] = useState<number>(0);
  const [questoes, setQuestoes] = useState<Questao[]>([]);

  const [historico, setHistorico] = useState<HistoricoItem[]>([]);

  useEffect(() => {
    try {
      setNome(localStorage.getItem(configData.NOME_PARAM) || '');
      setQuantidade(parseInt(localStorage.getItem(configData.QUANTIDADE_PARAM) || '0'));
      setAcertos(parseInt(localStorage.getItem(configData.QUANTIDADE_ACERTOS) || '0'));
      setTempo(parseInt(localStorage.getItem(configData.TEMPO_PARAM) || '0'));
      setPontuacao(parseInt(localStorage.getItem(configData.PONTUACAO) || '0'));
      setRecorde(parseInt(localStorage.getItem(configData.RECORDE) || '0'));
      const q = localStorage.getItem(configData.QUESTOES);
      setQuestoes(q ? JSON.parse(q) : []);
      const h = localStorage.getItem(configData.HISTORICO);
      setHistorico(h ? JSON.parse(h) : []);
    } catch {
    }
  }, []);

  const resumoGeral = useMemo(() => {
    const items = Array.isArray(historico) ? historico : [];
    let totalJogos = 0;
    let totalQuestoes = 0;
    let totalAcertos = 0;
    let tempoTotal = 0;

    const porTipo: Record<string, { jogos: number; questoes: number; acertos: number; tempoTotal: number }> = {};
    const errosPorQuestao: Record<string, number> = {};

    for (const it of items) {
      const qnt = parseInt(String(it.quantidadeQuestoes || '0')) || 0;
      const ac = parseInt(String(it.quantidadeAcertos || '0')) || 0;
      const t = parseInt(String(it.tempo || '0')) || 0;
      const tp = it.tipo || 'M';

      totalJogos += 1;
      totalQuestoes += qnt;
      totalAcertos += ac;
      tempoTotal += t;

      if (!porTipo[tp]) porTipo[tp] = { jogos: 0, questoes: 0, acertos: 0, tempoTotal: 0 };
      porTipo[tp].jogos += 1;
      porTipo[tp].questoes += qnt;
      porTipo[tp].acertos += ac;
      porTipo[tp].tempoTotal += t;

      const qs = it.questoes || [];
      for (const q of qs) {
        if (!q?.correta) {
          errosPorQuestao[q.questao] = (errosPorQuestao[q.questao] || 0) + 1;
        }
      }
    }

    const totalErros = Math.max(0, totalQuestoes - totalAcertos);
    const taxaAcerto = totalQuestoes > 0 ? (totalAcertos / totalQuestoes) : 0;
    const tempoMedio = totalJogos > 0 ? Math.round(tempoTotal / totalJogos) : 0;
    const qtdMedia = totalJogos > 0 ? (totalQuestoes / totalJogos) : 0;

    const topErros = Object.entries(errosPorQuestao)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return { totalJogos, totalQuestoes, totalAcertos, totalErros, taxaAcerto, tempoTotal, tempoMedio, qtdMedia, porTipo, topErros };
  }, [historico]);

  function labelTipo(t: string) {
    if (t === 'R') return 'Aleatório';
    if (t === 'D') return 'Divisão';
    if (t === 'S') return 'Subtração';
    if (t === 'A') return 'Adição';
    return 'Multiplicação';
  }

  const temResultados = quantidade > 0 || acertos > 0 || questoes.length > 0 || pontuacao > 0;

  return (
    <div className='global-pageContainer-left options-preview'>
      <WalkingRobot />
      <h1>Resultados</h1>

      <div  className='article-content'>
        <h2>Resumo geral</h2>
        {resumoGeral.totalJogos === 0 ? (
          <h3>Nenhum jogo encontrado no histórico.</h3>
        ) : (
          <>
          <div className='resumo-kpis-wrap'>
            <div>
              <h3>Jogos: {resumoGeral.totalJogos}</h3>
              <h3>Acertos: {resumoGeral.totalAcertos}/{resumoGeral.totalQuestoes}</h3>
              <h3>Erros: {resumoGeral.totalErros}</h3>
              <h3>Taxa de acerto: {(resumoGeral.taxaAcerto * 100).toFixed(1)}%</h3>
              <h3>Tempo médio: {resumoGeral.tempoMedio}s</h3>
              <h3>Quantidade média por jogo: {resumoGeral.qtdMedia.toFixed(1)} questões</h3>
            </div>
            <HappyRobot happy={true} />
          </div>

            <br/>
            <h2>Por tipo de jogo</h2>
            <table className='resultados-table'>
              <thead>
                <tr>
                  <th><h3>Tipo</h3></th>
                  <th><h3>Jogos</h3></th>
                  <th><h3>Acertos</h3></th>
                  <th><h3>Questões</h3></th>
                  <th><h3>Taxa</h3></th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(resumoGeral.porTipo).map(([tp, v]) => (
                  <tr key={tp}>
                    <td data-label='Tipo'><h4>{labelTipo(tp)}</h4></td>
                    <td data-label='Jogos'><h4>{v.jogos}</h4></td>
                    <td data-label='Acertos'><h4>{v.acertos}</h4></td>
                    <td data-label='Questões'><h4>{v.questoes}</h4></td>
                    <td data-label='Taxa'><h4>{v.questoes ? ((v.acertos / v.questoes) * 100).toFixed(1) : '0.0'}%</h4></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {resumoGeral.topErros.length > 0 && (
              <>
                <br/>
                <h2>Erros mais comuns</h2>
                <div className='resultados-lista'>
                  {resumoGeral.topErros.map(([quest, count], idx) => (
                    <div className='resultados-item' key={idx}>
                      <h3>
                        {quest} — {count}x
                      </h3>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <br/>
      <div  className='article-content'>
        <h2>Última sessão</h2>
        {!temResultados ? (
          <h3>Nenhum resultado salvo nesta sessão.</h3>
        ) : (
          <>
            <h3>Nome: {nome || '—'}</h3>
            <h3>Acertos: {acertos}/{quantidade}</h3>
            <h3>Tempo: {tempo}s</h3>
            <h3>Pontuação: {pontuacao} | Recorde: {recorde}</h3>

            {questoes && questoes.length > 0 && (
              <div className='respostasQuestoes'>
                <h2>Respostas</h2>
                <div className='resultados-lista'>
                  {questoes.map((q, idx) => (
                    <div className='resultados-item' key={idx}>
                      <h3>
                        {q.questao} = {q.resposta} {q.correta ? '✅' : '❌'}
                      </h3>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className='botoes'>
        <a className='global-button global-button--full-width' href='/historico'>
          <span className='option-link'>Ver histórico completo</span>
        </a>
        <a className='global-button global-button--full-width' href='/'>
          <span className='option-link'>Início</span>
        </a>
      </div>
    </div>
  );
}

export default Resultados;
