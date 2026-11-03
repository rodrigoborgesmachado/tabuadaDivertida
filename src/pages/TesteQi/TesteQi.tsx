import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { lerNome } from '../../services/jogador';
import { playError, playSuccess } from '../../services/sons';
import { salvarPartida } from '../../services/historico';
import { compartilhar } from '../../services/compartilhar';
import { lerProgresso, partidaFinalizada } from '../../gamificacao/progresso';
import BarraXp from '../../components/BarraXp/BarraXp';
import RankingFinal from '../../components/RankingFinal/RankingFinal';
import Keypad from '../../components/Keypad/Keypad';
import { desempenhoPorTipo, gerarPartida, perguntaDoTipo, pontuacaoQi, SEGUNDOS_POR_DIFICULDADE, textoQuestao, TIPOS, tituloQi, TOTAL_QUESTOES, type Celula, type Dificuldade, type Questao } from './logic';
import '../Contagem/Contagem.css';
import './TesteQi.css';

type Fase = 'inicio' | 'contagem' | 'jogando' | 'fim';

interface Resposta {
  questao: Questao;
  valor: number | null;
  correta: boolean;
  segundos: number;
}

interface Recorde {
  acertos: number;
  qi: number;
}

const STORAGE_KEY = 'tabuada-divertida-teste-qi-recorde';
const TITULO = 'Teste de QI com Números: desafio de lógica | Tabuada Divertida';
const DESCRICAO = 'Faça o Teste de QI com Números: 15 questões de sequências, grades, analogias e pirâmides em dificuldade crescente. Estilo teste de QI, só por diversão.';
const AVISO = 'Estilo teste de QI, só por diversão. Não é um teste científico.';
const MAXIMO_DIGITOS = 5;

const DIFICULDADES: Record<Dificuldade, string> = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' };

const readRecorde = (): Recorde | null => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const saveRecorde = (recorde: Recorde) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recorde));
  } catch {}
};

function TesteQi() {
  const [fase, setFase] = useState<Fase>('inicio');
  const [contagem, setContagem] = useState(3);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState<Resposta[]>([]);
  const [digitado, setDigitado] = useState('');
  const [tempo, setTempo] = useState(0);
  const [feedback, setFeedback] = useState<Resposta | null>(null);
  const [recorde, setRecorde] = useState<Recorde | null>(() => readRecorde());
  const [resultadoFinal, setResultadoFinal] = useState<{ qi: number; tempo: number; novoRecorde: boolean; ganhoXp: number } | null>(null);

  const questao = questoes[indice];
  const acertos = respostas.filter((resposta) => resposta.correta).length;

  useEffect(() => {
    const tituloAnterior = document.title;
    const meta = document.querySelector('meta[name="description"]');
    const descricaoAnterior = meta?.getAttribute('content');

    document.title = TITULO;
    meta?.setAttribute('content', DESCRICAO);

    return () => {
      document.title = tituloAnterior;
      if (descricaoAnterior) {
        meta?.setAttribute('content', descricaoAnterior);
      }
    };
  }, []);

  useEffect(() => {
    if (fase !== 'contagem') {
      return;
    }

    if (contagem === 0) {
      setFase('jogando');
      return;
    }

    const timer = window.setTimeout(() => setContagem((atual) => atual - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [fase, contagem]);

  useEffect(() => {
    if (fase !== 'jogando' || feedback) {
      return;
    }

    const interval = window.setInterval(() => setTempo((atual) => Math.max(0, atual - 1)), 1000);
    return () => window.clearInterval(interval);
  }, [fase, feedback]);

  const finalizar = useCallback((todas: Resposta[]) => {
    const qi = pontuacaoQi(todas.map((resposta) => ({ ...resposta.questao, correta: resposta.correta })));
    const totalAcertos = todas.filter((resposta) => resposta.correta).length;
    const tempoTotal = todas.reduce((total, resposta) => total + resposta.segundos, 0);
    const novoRecorde = !recorde || qi > recorde.qi;

    if (novoRecorde) {
      const melhor = { acertos: totalAcertos, qi };
      setRecorde(melhor);
      saveRecorde(melhor);
    }

    salvarPartida({
      quantidadeQuestoes: todas.length,
      quantidadeAcertos: totalAcertos,
      tempo: tempoTotal,
      nome: lerNome(),
      tipo: 'QI',
      questoes: todas.map((resposta) => ({
        questao: textoQuestao(resposta.questao),
        resposta: resposta.valor === null ? '' : String(resposta.valor),
        correta: resposta.correta,
      })),
      data: new Date().toISOString(),
      pontuacao: qi,
    });

    const xpAnterior = lerProgresso().xp;
    partidaFinalizada({ jogo: 'teste-qi', pontuacao: qi, tempo: tempoTotal, contas: todas.map((resposta) => ({ correta: resposta.correta })) });

    setResultadoFinal({ qi, tempo: tempoTotal, novoRecorde, ganhoXp: lerProgresso().xp - xpAnterior });
    setFase('fim');
  }, [recorde]);

  const irParaProxima = useCallback((todas: Resposta[]) => {
    setFeedback(null);
    setDigitado('');

    if (todas.length >= questoes.length) {
      finalizar(todas);
      return;
    }

    setIndice(todas.length);
    setTempo(SEGUNDOS_POR_DIFICULDADE[questoes[todas.length].dificuldade]);
  }, [questoes, finalizar]);

  const responder = useCallback((valor: number | null) => {
    if (fase !== 'jogando' || !questao || feedback) {
      return;
    }

    const resposta: Resposta = { questao, valor, correta: valor === questao.resposta, segundos: SEGUNDOS_POR_DIFICULDADE[questao.dificuldade] - tempo };
    const todas = [...respostas, resposta];
    setRespostas(todas);

    if (resposta.correta) {
      playSuccess();
      irParaProxima(todas);
      return;
    }

    playError();
    setFeedback(resposta);
  }, [fase, questao, feedback, tempo, respostas, irParaProxima]);

  const confirmar = useCallback(() => {
    if (digitado !== '') {
      responder(Number(digitado));
    }
  }, [digitado, responder]);

  useEffect(() => {
    if (fase === 'jogando' && !feedback && tempo === 0 && questao) {
      responder(null);
    }
  }, [fase, feedback, tempo, questao, responder]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (fase !== 'jogando' || !questao) {
        return;
      }

      if (feedback) {
        if (event.key === 'Enter') {
          event.preventDefault();
          irParaProxima(respostas);
        }
        return;
      }

      if (questao.opcoes) {
        const opcao = questao.opcoes[Number(event.key) - 1];
        if (opcao !== undefined) {
          event.preventDefault();
          responder(opcao);
        }
        return;
      }

      if (/^\d$/.test(event.key)) {
        event.preventDefault();
        setDigitado((atual) => (atual.length < MAXIMO_DIGITOS ? atual + event.key : atual));
      } else if (event.key === 'Backspace') {
        event.preventDefault();
        setDigitado((atual) => atual.slice(0, -1));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        confirmar();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [fase, questao, feedback, respostas, responder, confirmar, irParaProxima]);

  const iniciarJogo = () => {
    const novas = gerarPartida();
    setQuestoes(novas);
    setIndice(0);
    setRespostas([]);
    setDigitado('');
    setFeedback(null);
    setResultadoFinal(null);
    setTempo(SEGUNDOS_POR_DIFICULDADE[novas[0].dificuldade]);
    setContagem(3);
    setFase('contagem');
  };

  const handleShare = () => {
    const url = `${window.location.origin || 'https://www.tabuadadivertida.com'}/jogos/teste-de-qi`;
    const qi = resultadoFinal?.qi || 0;

    compartilhar('Teste de QI com Números', [
      `Fiz ${acertos}/${TOTAL_QUESTOES} no Teste de QI com Números do Tabuada Divertida, e você?`,
      `🧩 Pontuação estilo QI: ${qi} (${tituloQi(qi)}), só por diversão!`,
      '',
      url,
    ].join('\n'));
  };

  const renderCelula = (celula: Celula, chave: string) => {
    if (celula !== null) {
      return <span key={chave} className='teste-qi-celula'>{celula}</span>;
    }

    const classe = feedback ? ' teste-qi-celula--correta' : ' teste-qi-celula--faltando';
    return (
      <span key={chave} className={`teste-qi-celula${classe}`} aria-label='Número que falta'>
        {feedback ? feedback.questao.resposta : digitado || '?'}
      </span>
    );
  };

  const renderQuestao = (atual: Questao) => {
    if (atual.tipo === 'analogia') {
      return (
        <div className='teste-qi-analogia'>
          {atual.linhas.map((linha, r) => (
            <div key={r} className='teste-qi-linha'>
              {renderCelula(linha[0], `${r}-0`)}
              <span className='teste-qi-seta' aria-hidden='true'>→</span>
              {renderCelula(linha[1], `${r}-1`)}
            </div>
          ))}
        </div>
      );
    }

    if (atual.tipo === 'grade' || atual.tipo === 'piramide') {
      return (
        <div className={`teste-qi-${atual.tipo}`}>
          {atual.linhas.map((linha, r) => (
            <div key={r} className='teste-qi-linha'>
              {linha.map((celula, c) => renderCelula(celula, `${r}-${c}`))}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className='teste-qi-linha teste-qi-linha--sequencia'>
        {atual.linhas[0].map((celula, c) => renderCelula(celula, `0-${c}`))}
      </div>
    );
  };

  const desempenho = desempenhoPorTipo(respostas.map((resposta) => ({ ...resposta.questao, correta: resposta.correta })));
  const erradas = respostas.filter((resposta) => !resposta.correta);

  return (
    <div className='center'>
      <div className='global-pageContainer-left options-preview teste-qi-page'>
        <div className='teste-qi-card'>
          <div className='teste-qi-header'>
            <div>
              <h1 className='paragrafo2'>🧩 Teste de QI com Números</h1>
              <p className='paragrafo3'>Descubra o padrão e encontre o número que falta.</p>
              <p className='teste-qi-aviso'>{AVISO}</p>
            </div>
            {fase === 'jogando' && questao && (
              <div className='teste-qi-badges'>
                <span className='teste-qi-badge'>❓ {indice + 1}/{TOTAL_QUESTOES}</span>
                <span className='teste-qi-badge'>🎚️ {DIFICULDADES[questao.dificuldade]}</span>
                <span className='teste-qi-badge'>⏱️ {tempo}s</span>
                <span className='teste-qi-badge'>✅ Acertos: {acertos}</span>
              </div>
            )}
          </div>

          {fase === 'inicio' && (
            <div className='teste-qi-inicio'>
              <p>São {TOTAL_QUESTOES} questões só com números, do fácil ao difícil. Cada uma tem um tempo para responder:</p>
              <ul className='teste-qi-tipos'>
                {TIPOS.map((item) => (
                  <li key={item.tipo}>{item.pergunta}</li>
                ))}
              </ul>
              <p>Nas questões fáceis você escolhe entre 4 opções. Nas médias e difíceis, digite a resposta no teclado da tela ou do computador.</p>
              <p className='teste-qi-recorde'>🏆 Melhor resultado: {recorde ? `${recorde.acertos}/${TOTAL_QUESTOES} (QI de brincadeira ${recorde.qi})` : 'ainda não há'}</p>
              <div className='teste-qi-toolbar'>
                <button type='button' className='global-button' onClick={iniciarJogo}>
                  Começar
                </button>
                <Link to='/jogos' className='global-button global-button--back'>
                  Voltar aos jogos
                </Link>
              </div>
            </div>
          )}

          {fase === 'contagem' && (
            <div className='teste-qi-contagem'>
              <h2 className='countdown-text'>Prepare-se!</h2>
              {contagem > 0 && (
                <div key={contagem} className='countdown-number'>{contagem}</div>
              )}
            </div>
          )}

          {fase === 'jogando' && questao && (
            <div className='teste-qi-jogo'>
              <h2 className='teste-qi-pergunta'>{perguntaDoTipo(questao.tipo)}</h2>
              <div className='teste-qi-questao'>{renderQuestao(questao)}</div>

              {feedback ? (
                <div className='teste-qi-feedback' aria-live='polite'>
                  <p className='teste-qi-feedback__titulo'>
                    {feedback.valor === null ? '⏰ O tempo acabou!' : 'Ops! Não foi dessa vez.'} A resposta é {feedback.questao.resposta}.
                  </p>
                  <p>{feedback.questao.explicacao}</p>
                  <button type='button' className='global-button' onClick={() => irParaProxima(respostas)}>
                    {respostas.length >= TOTAL_QUESTOES ? 'Ver resultado' : 'Próxima'}
                  </button>
                </div>
              ) : questao.opcoes ? (
                <div className='teste-qi-opcoes'>
                  {questao.opcoes.map((opcao) => (
                    <button key={opcao} type='button' className='teste-qi-opcao' onClick={() => responder(opcao)}>
                      {opcao}
                    </button>
                  ))}
                </div>
              ) : (
                <Keypad
                  value={digitado}
                  onChange={(valor) => setDigitado(valor.slice(0, MAXIMO_DIGITOS))}
                  onEnter={confirmar}
                />
              )}

              <p className='teste-qi-help'>
                {questao.opcoes
                  ? 'Dica: toque na resposta certa ou use as teclas 1 a 4.'
                  : 'Dica: use o teclado da tela ou digite no teclado e aperte Enter.'}
              </p>
            </div>
          )}

          {fase === 'fim' && resultadoFinal && (
            <div className='teste-qi-resultado'>
              <h2 className='teste-qi-resultado__titulo'>{tituloQi(resultadoFinal.qi)}</h2>
              <p className='teste-qi-resultado__qi'>
                <span>Pontuação estilo QI</span>
                <strong>{resultadoFinal.qi}</strong>
              </p>
              <p>Você acertou {acertos} de {TOTAL_QUESTOES} questões.</p>
              <p className='teste-qi-aviso'>{AVISO}</p>
              <p className='teste-qi-recorde'>
                {resultadoFinal.novoRecorde
                  ? '🏆 Novo melhor resultado!'
                  : `🏆 Melhor resultado: ${recorde?.acertos}/${TOTAL_QUESTOES} (QI de brincadeira ${recorde?.qi})`}
              </p>
              <BarraXp ganho={resultadoFinal.ganhoXp} />
              <RankingFinal jogo='teste-qi' modo={null} resultado={{ acertos, total: respostas.length, tempo: resultadoFinal.tempo, extras: { qi: resultadoFinal.qi } }} />

              <h3>Desempenho por tipo de questão</h3>
              <ul className='teste-qi-desempenho'>
                {desempenho.map((item) => (
                  <li key={item.tipo}>
                    <span>{item.nome}</span>
                    <strong>{item.acertos}/{item.total}</strong>
                  </li>
                ))}
              </ul>

              {erradas.length > 0 && (
                <>
                  <h3>Revisão das questões erradas</h3>
                  <ul className='teste-qi-revisao'>
                    {erradas.map((resposta, i) => (
                      <li key={i}>
                        <strong>{textoQuestao(resposta.questao)}</strong>
                        <span>Sua resposta: {resposta.valor === null ? 'sem resposta' : resposta.valor} · Resposta certa: {resposta.questao.resposta}</span>
                        <span>{resposta.questao.explicacao}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <div className='teste-qi-toolbar'>
                <button type='button' className='global-button' onClick={iniciarJogo}>
                  Jogar de novo
                </button>
                <button type='button' className='global-button global-button--basic' onClick={handleShare}>
                  Compartilhar
                </button>
                <Link to='/jogos' className='global-button global-button--back'>
                  Voltar aos jogos
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TesteQi;
