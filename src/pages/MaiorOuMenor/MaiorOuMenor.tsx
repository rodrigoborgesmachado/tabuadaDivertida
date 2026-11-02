import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import configData from '../../Config.json';
import { playError, playSuccess } from '../../services/sons';
import { salvarPartida, type Questao } from '../../services/historico';
import { compartilhar } from '../../services/compartilhar';
import { lerProgresso, partidaFinalizada } from '../../gamificacao/progresso';
import BarraXp from '../../components/BarraXp/BarraXp';
import { comparar, CONFIG_NIVEL, explicarRodada, gerarRodada, PENALIDADE_SEGUNDOS, PONTOS_POR_ACERTO, type Modalidade, type Nivel, type Resposta, type Rodada } from './logic';
import '../Contagem/Contagem.css';
import './MaiorOuMenor.css';

type Fase = 'config' | 'contagem' | 'jogando' | 'fim';

interface Feedback {
  escolha: Resposta;
  correta: Resposta;
}

const STORAGE_KEY = 'tabuada-divertida-maior-ou-menor-recordes';
const TEMPO_FEEDBACK = 1200;

const MODALIDADES: { modalidade: Modalidade; label: string }[] = [
  { modalidade: 'tabuada', label: '✖️ Tabuada' },
  { modalidade: 'fracoes', label: '🍕 Frações' },
  { modalidade: 'decimais', label: '🔟 Decimais' },
  { modalidade: 'misturado', label: '🔀 Misturado' },
];

const NIVEIS: { nivel: Nivel; label: string }[] = [
  { nivel: 'facil', label: 'Fácil' },
  { nivel: 'medio', label: 'Médio' },
  { nivel: 'dificil', label: 'Difícil' },
];

const TECLAS: Record<string, Resposta> = {
  ArrowLeft: 'esquerda',
  ArrowRight: 'direita',
  ArrowDown: 'iguais',
};

const labelModalidade = (modalidade: Modalidade) => MODALIDADES.find((item) => item.modalidade === modalidade)?.label || '';

const labelNivel = (nivel: Nivel) => NIVEIS.find((item) => item.nivel === nivel)?.label || '';

const readRecordes = (): Record<string, number> => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveRecordes = (recordes: Record<string, number>) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recordes));
  } catch {}
};

function MaiorOuMenor() {
  const [modalidade, setModalidade] = useState<Modalidade>('tabuada');
  const [nivel, setNivel] = useState<Nivel>('facil');
  const [fase, setFase] = useState<Fase>('config');
  const [contagem, setContagem] = useState(3);
  const [rodada, setRodada] = useState<Rodada | null>(null);
  const [tempo, setTempo] = useState(0);
  const [segundos, setSegundos] = useState(0);
  const [pontos, setPontos] = useState(0);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [recordes, setRecordes] = useState<Record<string, number>>(() => readRecordes());
  const [resultadoFinal, setResultadoFinal] = useState<{ novoRecorde: boolean; ganhoXp: number } | null>(null);
  const feedbackRef = useRef<number | null>(null);

  const chave = `${modalidade}-${nivel}`;
  const acertos = questoes.filter((questao) => questao.correta).length;

  const limparFeedback = () => {
    if (feedbackRef.current) {
      window.clearTimeout(feedbackRef.current);
      feedbackRef.current = null;
    }
    setFeedback(null);
  };

  useEffect(() => () => {
    if (feedbackRef.current) {
      window.clearTimeout(feedbackRef.current);
    }
  }, []);

  useEffect(() => {
    if (fase !== 'contagem') {
      return;
    }

    if (contagem === 0) {
      setRodada(gerarRodada(modalidade, nivel));
      setFase('jogando');
      return;
    }

    const timer = window.setTimeout(() => setContagem((atual) => atual - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [fase, contagem, modalidade, nivel]);

  useEffect(() => {
    if (fase !== 'jogando') {
      return;
    }

    const interval = window.setInterval(() => {
      setTempo((atual) => Math.max(0, atual - 1));
      setSegundos((atual) => atual + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [fase]);

  useEffect(() => {
    if (fase !== 'jogando' || tempo > 0) {
      return;
    }

    if (feedbackRef.current) {
      window.clearTimeout(feedbackRef.current);
      feedbackRef.current = null;
    }

    const novoRecorde = pontos > (recordes[chave] || 0);
    if (novoRecorde) {
      const novosRecordes = { ...recordes, [chave]: pontos };
      setRecordes(novosRecordes);
      saveRecordes(novosRecordes);
    }

    let ganhoXp = 0;
    if (questoes.length > 0) {
      salvarPartida({
        quantidadeQuestoes: questoes.length,
        quantidadeAcertos: questoes.filter((questao) => questao.correta).length,
        tempo: segundos,
        nome: localStorage.getItem(configData.NOME_PARAM),
        tipo: 'MM',
        questoes,
        data: new Date().toISOString(),
        pontuacao: pontos,
      });

      const xpAnterior = lerProgresso().xp;
      partidaFinalizada({ jogo: 'maior-ou-menor', pontuacao: pontos, contas: questoes.map((questao) => ({ correta: questao.correta })) });
      ganhoXp = lerProgresso().xp - xpAnterior;
    }

    setResultadoFinal({ novoRecorde, ganhoXp });
    setFase('fim');
  }, [fase, tempo, pontos, questoes, segundos, recordes, chave]);

  const iniciarJogo = () => {
    limparFeedback();
    setRodada(null);
    setTempo(CONFIG_NIVEL[nivel].segundos);
    setSegundos(0);
    setPontos(0);
    setQuestoes([]);
    setResultadoFinal(null);
    setContagem(3);
    setFase('contagem');
  };

  const mudarConfiguracao = () => {
    limparFeedback();
    setResultadoFinal(null);
    setFase('config');
  };

  const responder = useCallback((escolha: Resposta) => {
    if (fase !== 'jogando' || !rodada || feedback) {
      return;
    }

    const correta = comparar(rodada.esquerda, rodada.direita);
    setQuestoes((atuais) => [...atuais, {
      questao: `${rodada.esquerda.texto} ou ${rodada.direita.texto}`,
      resposta: escolha === 'iguais' ? 'iguais' : rodada[escolha].texto,
      correta: escolha === correta,
    }]);

    if (escolha === correta) {
      playSuccess();
      setPontos((atual) => atual + PONTOS_POR_ACERTO);
      setRodada(gerarRodada(modalidade, nivel));
      return;
    }

    playError();
    setTempo((atual) => Math.max(0, atual - PENALIDADE_SEGUNDOS));
    setFeedback({ escolha, correta });
    feedbackRef.current = window.setTimeout(() => {
      feedbackRef.current = null;
      setFeedback(null);
      setRodada(gerarRodada(modalidade, nivel));
    }, TEMPO_FEEDBACK);
  }, [fase, rodada, feedback, modalidade, nivel]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const escolha = TECLAS[event.key];
      if (escolha && fase === 'jogando') {
        event.preventDefault();
        responder(escolha);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [fase, responder]);

  const handleShare = () => {
    const url = `${window.location.origin || 'https://www.tabuadadivertida.com'}/jogos/maior-ou-menor`;

    compartilhar('Maior ou menor', [
      'Este foi meu resultado no Maior ou menor!',
      `🧮 ${labelModalidade(modalidade)}`,
      `🎚️ Nível: ${labelNivel(nivel)}`,
      `⭐ Pontos: ${pontos}`,
      `✅ Acertos: ${acertos}/${questoes.length}`,
      '',
      `Você consegue fazer melhor? ${url}`,
    ].join('\n'));
  };

  const explicacao = rodada && feedback ? explicarRodada(rodada) : null;

  const classeOpcao = (opcao: Resposta) => {
    if (!feedback) return '';
    if (opcao === feedback.correta) return ' maior-menor-valor--correta';
    if (opcao === feedback.escolha) return ' maior-menor-valor--errada';
    return '';
  };

  return (
    <div className='center'>
      <div className='global-pageContainer-left options-preview maior-menor-page'>
        <div className='maior-menor-card'>
          <div className='maior-menor-header'>
            <div>
              <h2 className='paragrafo2'>⚖️ Maior ou menor</h2>
              <p className='paragrafo3'>Qual valor é maior? Responda rápido antes do tempo acabar!</p>
            </div>
            {fase === 'jogando' && (
              <div className='maior-menor-badges'>
                <span className='maior-menor-badge'>⏱️ {tempo}s</span>
                <span className='maior-menor-badge'>⭐ Pontos: {pontos}</span>
                <span className='maior-menor-badge'>✅ Acertos: {acertos}</span>
              </div>
            )}
          </div>

          {fase === 'config' && (
            <div className='maior-menor-config'>
              <div className='maior-menor-config__grupo'>
                <h3>Escolha o que comparar</h3>
                <div className='maior-menor-opcoes'>
                  {MODALIDADES.map((item) => (
                    <button
                      key={item.modalidade}
                      type='button'
                      className={`maior-menor-opcao${modalidade === item.modalidade ? ' maior-menor-opcao--ativa' : ''}`}
                      aria-pressed={modalidade === item.modalidade}
                      onClick={() => setModalidade(item.modalidade)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className='maior-menor-config__grupo'>
                <h3>Escolha o nível</h3>
                <div className='maior-menor-opcoes'>
                  {NIVEIS.map((item) => (
                    <button
                      key={item.nivel}
                      type='button'
                      className={`maior-menor-opcao maior-menor-opcao--nivel${nivel === item.nivel ? ' maior-menor-opcao--ativa' : ''}`}
                      aria-pressed={nivel === item.nivel}
                      onClick={() => setNivel(item.nivel)}
                    >
                      <strong>{item.label}</strong>
                      <span>{CONFIG_NIVEL[item.nivel].segundos} segundos</span>
                    </button>
                  ))}
                </div>
                <p className='maior-menor-recorde'>🏆 Recorde: {recordes[chave] ? `${recordes[chave]} pontos` : 'ainda não há'}</p>
              </div>

              <div className='maior-menor-toolbar'>
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
            <div className='maior-menor-contagem'>
              <h2 className='countdown-text'>Prepare-se!</h2>
              {contagem > 0 && (
                <div key={contagem} className='countdown-number'>{contagem}</div>
              )}
            </div>
          )}

          {(fase === 'jogando' || fase === 'fim') && rodada && (
            <>
              <div className='maior-menor-rodada' aria-label='Valores para comparar'>
                <button type='button' className={`maior-menor-valor${classeOpcao('esquerda')}`} disabled={!!feedback || fase !== 'jogando'} onClick={() => responder('esquerda')}>
                  <span className='maior-menor-valor__texto'>{rodada.esquerda.texto}</span>
                  {explicacao && <span className='maior-menor-valor__explicacao'>{explicacao.esquerda}</span>}
                </button>
                <span className='maior-menor-sinal' aria-hidden='true'>{explicacao ? explicacao.sinal : '?'}</span>
                <button type='button' className={`maior-menor-valor${classeOpcao('direita')}`} disabled={!!feedback || fase !== 'jogando'} onClick={() => responder('direita')}>
                  <span className='maior-menor-valor__texto'>{rodada.direita.texto}</span>
                  {explicacao && <span className='maior-menor-valor__explicacao'>{explicacao.direita}</span>}
                </button>
              </div>
              <button type='button' className={`maior-menor-valor maior-menor-valor--iguais${classeOpcao('iguais')}`} disabled={!!feedback || fase !== 'jogando'} onClick={() => responder('iguais')}>
                = Iguais
              </button>
              <p className='maior-menor-feedback' aria-live='polite'>
                {explicacao ? `Ops! ${explicacao.esquerda} ${explicacao.sinal} ${explicacao.direita}` : ''}
              </p>

              <div className='maior-menor-toolbar'>
                <button type='button' className='global-button global-button--basic' onClick={iniciarJogo}>
                  Reiniciar
                </button>
                <button type='button' className='global-button global-button--basic' onClick={mudarConfiguracao}>
                  Mudar configuração
                </button>
              </div>

              <p className='maior-menor-help'>Dica: toque no maior valor ou em "Iguais". No teclado, use ← se o maior estiver à esquerda, → se estiver à direita e ↓ se forem iguais. Cada erro tira {PENALIDADE_SEGUNDOS} segundos.</p>
            </>
          )}

          {fase === 'fim' && resultadoFinal && (
            <div className='maior-menor-modal' role='dialog' aria-modal='true'>
              <div className='maior-menor-modal__content'>
                <h3>⏰ Tempo esgotado!</h3>
                <p>Você fez {pontos} pontos, com {acertos} {acertos === 1 ? 'acerto' : 'acertos'} em {questoes.length} {questoes.length === 1 ? 'resposta' : 'respostas'}.</p>
                <p className='maior-menor-modal__recorde'>
                  {resultadoFinal.novoRecorde
                    ? `🏆 Novo recorde no nível ${labelNivel(nivel).toLowerCase()}!`
                    : `🏆 Recorde: ${recordes[chave] || 0} pontos`}
                </p>
                <BarraXp ganho={resultadoFinal.ganhoXp} />
                <div className='maior-menor-modal__actions'>
                  <button type='button' className='global-button' onClick={iniciarJogo}>
                    Jogar de novo
                  </button>
                  <button type='button' className='global-button global-button--basic' onClick={handleShare}>
                    Compartilhar
                  </button>
                  <button type='button' className='global-button global-button--back' onClick={mudarConfiguracao}>
                    Mudar configuração
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MaiorOuMenor;
