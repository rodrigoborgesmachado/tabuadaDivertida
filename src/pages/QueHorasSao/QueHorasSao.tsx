import { PointerEvent, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { playError, playSuccess } from '../../services/sons';
import { conquistasDaPartida, type ConquistaPartida } from '../../services/compartilhar';
import { urlDoSite } from '../../services/plataforma';
import { lerProgresso, partidaFinalizada } from '../../gamificacao/progresso';
import BarraXp from '../../components/BarraXp/BarraXp';
import BotaoSom from '../../components/BotaoSom/BotaoSom';
import CompartilharResultado from '../../components/CompartilharResultado/CompartilharResultado';
import ComoJogar from '../../components/ComoJogar/ComoJogar';
import { formatarTempo } from '../MemoriaTabuada/logic';
import { acertou, anguloDoPonteiroDasHoras, anguloDoPonteiroDosMinutos, anguloDoPonto, explicar, formatar, gerarPartida, inicioDosPonteiros, moverHoras, moverMinutos, normalizar, PASSO_ARRASTE, pergunta, TOTAL_QUESTOES, type Formato, type Modo, type Nivel, type Questao } from './logic';
import './QueHorasSao.css';

type Fase = 'config' | 'jogando' | 'fim';

type Ponteiro = 'horas' | 'minutos';

interface Feedback {
  correta: boolean;
  escolha: number;
}

interface Resultado {
  acertos: number;
  tempo: number;
  ganhoXp: number;
  conquistas: ConquistaPartida[];
}

const TEMPO_ACERTO = 1000;

const MODOS: { modo: Modo; label: string; descricao: string }[] = [
  { modo: 'ler', label: '🕒 Ler o relógio', descricao: 'Veja o relógio e escolha a hora' },
  { modo: 'acertar', label: '✋ Acertar os ponteiros', descricao: 'Arraste os ponteiros até a hora' },
];

const NIVEIS: { nivel: Nivel; label: string; descricao: string }[] = [
  { nivel: 'facil', label: 'Fácil', descricao: 'Horas cheias e meias horas' },
  { nivel: 'medio', label: 'Médio', descricao: 'De 5 em 5 minutos' },
  { nivel: 'dificil', label: 'Difícil', descricao: 'Qualquer minuto e intervalos' },
];

const FORMATOS: { formato: Formato; label: string }[] = [
  { formato: 'digital', label: '🔢 Digital (07:45)' },
  { formato: 'extenso', label: '🔤 Por extenso (quinze para as oito)' },
];

const MARCAS = Array.from({ length: 60 }, (_, indice) => indice);
const NUMEROS = Array.from({ length: 12 }, (_, indice) => indice + 1);

interface RelogioProps {
  minutos: number;
  rotulo: string;
  passo?: number;
  estado?: 'certo' | 'errado';
  onMudar?: (minutos: number) => void;
}

function Relogio({ minutos, rotulo, passo = 1, estado, onMudar }: RelogioProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const atualRef = useRef(minutos);
  const [arrastando, setArrastando] = useState<Ponteiro | null>(null);

  atualRef.current = minutos;

  const posicao = (event: PointerEvent<SVGSVGElement>) => {
    const caixa = (svgRef.current as SVGSVGElement).getBoundingClientRect();
    const dx = event.clientX - (caixa.left + caixa.width / 2);
    const dy = event.clientY - (caixa.top + caixa.height / 2);
    return { angulo: anguloDoPonto(dx, dy), distancia: Math.hypot(dx, dy) / (caixa.width / 2 || 1) };
  };

  const mover = (ponteiro: Ponteiro, angulo: number) => {
    const novo = ponteiro === 'minutos' ? moverMinutos(atualRef.current, angulo, passo) : moverHoras(atualRef.current, angulo);
    if (novo !== atualRef.current && onMudar) {
      atualRef.current = novo;
      onMudar(novo);
    }
  };

  const iniciar = (event: PointerEvent<SVGSVGElement>) => {
    if (!onMudar) {
      return;
    }

    event.preventDefault();
    const { angulo, distancia } = posicao(event);
    const alvo = event.target as Element;
    const ponteiro: Ponteiro = alvo.getAttribute('data-ponteiro') === 'horas' || (!alvo.getAttribute('data-ponteiro') && distancia < 0.5) ? 'horas' : 'minutos';
    svgRef.current?.setPointerCapture?.(event.pointerId);
    setArrastando(ponteiro);
    mover(ponteiro, angulo);
  };

  const arrastar = (event: PointerEvent<SVGSVGElement>) => {
    if (arrastando) {
      mover(arrastando, posicao(event).angulo);
    }
  };

  const soltar = () => setArrastando(null);

  const classe = `que-horas-relogio${onMudar ? ' que-horas-relogio--interativo' : ''}${estado ? ` que-horas-relogio--${estado}` : ''}`;

  return (
    <svg
      ref={svgRef}
      className={classe}
      viewBox='0 0 200 200'
      role='img'
      aria-label={rotulo}
      onPointerDown={iniciar}
      onPointerMove={arrastar}
      onPointerUp={soltar}
      onPointerCancel={soltar}
    >
      <circle className='que-horas-relogio__aro' cx='100' cy='100' r='94' />
      <circle className='que-horas-relogio__mostrador' cx='100' cy='100' r='88' />
      {MARCAS.map((marca) => (
        <line
          key={marca}
          className={`que-horas-relogio__marca${marca % 5 === 0 ? ' que-horas-relogio__marca--hora' : ''}`}
          x1='100'
          y1='16'
          x2='100'
          y2={marca % 5 === 0 ? 26 : 21}
          transform={`rotate(${marca * 6} 100 100)`}
        />
      ))}
      {NUMEROS.map((numero) => {
        const angulo = (numero * 30 * Math.PI) / 180;
        return (
          <text key={numero} className='que-horas-relogio__numero' x={100 + 63 * Math.sin(angulo)} y={100 - 63 * Math.cos(angulo)} textAnchor='middle' dominantBaseline='central'>
            {numero}
          </text>
        );
      })}
      <g transform={`rotate(${anguloDoPonteiroDasHoras(minutos)} 100 100)`}>
        <line className='que-horas-relogio__ponteiro que-horas-relogio__ponteiro--horas' x1='100' y1='112' x2='100' y2='52' />
        <line className='que-horas-relogio__alca' data-ponteiro='horas' x1='100' y1='100' x2='100' y2='48' />
      </g>
      <g transform={`rotate(${anguloDoPonteiroDosMinutos(minutos)} 100 100)`}>
        <line className='que-horas-relogio__ponteiro que-horas-relogio__ponteiro--minutos' x1='100' y1='116' x2='100' y2='26' />
        <line className='que-horas-relogio__alca' data-ponteiro='minutos' x1='100' y1='70' x2='100' y2='22' />
      </g>
      <circle className='que-horas-relogio__centro' cx='100' cy='100' r='6' />
    </svg>
  );
}

function QueHorasSao() {
  const [modo, setModo] = useState<Modo>('ler');
  const [nivel, setNivel] = useState<Nivel>('facil');
  const [formato, setFormato] = useState<Formato>('digital');
  const [fase, setFase] = useState<Fase>('config');
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState<boolean[]>([]);
  const [ponteiros, setPonteiros] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [segundos, setSegundos] = useState(0);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const proximoRef = useRef<number | null>(null);
  const inicioRef = useRef(0);

  const questao = fase === 'jogando' ? questoes[indice] : undefined;
  const acertos = respostas.filter(Boolean).length;
  const passo = PASSO_ARRASTE[nivel];

  const cancelarProximo = () => {
    if (proximoRef.current) {
      window.clearTimeout(proximoRef.current);
      proximoRef.current = null;
    }
  };

  useEffect(() => () => {
    if (proximoRef.current) {
      window.clearTimeout(proximoRef.current);
    }
  }, []);

  useEffect(() => {
    if (fase !== 'jogando') {
      return;
    }

    const interval = window.setInterval(() => setSegundos((atual) => atual + 1), 1000);
    return () => window.clearInterval(interval);
  }, [fase]);

  const iniciarJogo = () => {
    const novas = gerarPartida(nivel);
    cancelarProximo();
    setQuestoes(novas);
    setIndice(0);
    setRespostas([]);
    setPonteiros(inicioDosPonteiros(novas[0]));
    setFeedback(null);
    setSegundos(0);
    setResultado(null);
    inicioRef.current = Date.now();
    setFase('jogando');
  };

  const mudarConfiguracao = () => {
    cancelarProximo();
    setFeedback(null);
    setResultado(null);
    setFase('config');
  };

  const finalizar = (finais: boolean[]) => {
    const tempo = Math.round((Date.now() - inicioRef.current) / 1000);
    const anterior = lerProgresso();
    partidaFinalizada({ jogo: 'que-horas-sao', modo: `relogio-${nivel}`, tempo, contas: finais.map((correta) => ({ correta })) });
    const atual = lerProgresso();
    setResultado({ acertos: finais.filter(Boolean).length, tempo, ganhoXp: atual.xp - anterior.xp, conquistas: conquistasDaPartida(anterior, atual) });
    setFase('fim');
  };

  const avancar = (finais: boolean[]) => {
    cancelarProximo();
    setFeedback(null);

    if (finais.length >= questoes.length) {
      finalizar(finais);
      return;
    }

    setIndice(finais.length);
    setPonteiros(inicioDosPonteiros(questoes[finais.length]));
  };

  const responder = (escolha: number) => {
    if (!questao || feedback) {
      return;
    }

    const correta = acertou(questao, escolha);
    const finais = [...respostas, correta];
    setRespostas(finais);
    setFeedback({ correta, escolha: normalizar(escolha) });

    if (correta) {
      playSuccess();
      proximoRef.current = window.setTimeout(() => avancar(finais), TEMPO_ACERTO);
      return;
    }

    playError();
  };

  const ajustar = (minutos: number) => setPonteiros((atual) => normalizar(atual + minutos));

  const classeOpcao = (opcao: number) => {
    if (!feedback || !questao) return '';
    if (opcao === questao.resposta) return ' que-horas-resposta--correta';
    if (opcao === feedback.escolha) return ' que-horas-resposta--errada';
    return '';
  };

  const labelModo = MODOS.find((item) => item.modo === modo)?.label || '';
  const labelNivel = NIVEIS.find((item) => item.nivel === nivel)?.label || '';

  const buildShareResult = () => ({
    jogo: 'Que horas são?',
    linhas: [
      'Este foi meu resultado no Que horas são?',
      labelModo,
      `🎚️ Nível: ${labelNivel}`,
      `✅ Acertos: ${resultado?.acertos || 0}/${TOTAL_QUESTOES}`,
      `⏱️ Tempo: ${formatarTempo(resultado?.tempo || 0)}`,
    ],
    convite: `Você consegue fazer melhor? ${urlDoSite()}/jogos/que-horas-sao`,
    resumo: `${resultado?.acertos || 0}/${TOTAL_QUESTOES} acertos em ${formatarTempo(resultado?.tempo || 0)}`,
    conquistas: resultado?.conquistas,
  });

  const relogioDaQuestao = (atual: Questao) => {
    if (modo === 'ler') {
      return <Relogio minutos={atual.inicio} rotulo='Relógio de ponteiros' estado={feedback && !atual.intervalo ? (feedback.correta ? 'certo' : 'errado') : undefined} />;
    }

    return (
      <>
        <Relogio
          minutos={ponteiros}
          rotulo='Relógio para acertar os ponteiros'
          passo={passo}
          estado={feedback ? (feedback.correta ? 'certo' : 'errado') : undefined}
          onMudar={feedback ? undefined : setPonteiros}
        />
        <div className='que-horas-ajustes'>
          <button type='button' className='que-horas-ajuste' disabled={!!feedback} onClick={() => ajustar(-60)}>− 1 hora</button>
          <button type='button' className='que-horas-ajuste' disabled={!!feedback} onClick={() => ajustar(-passo)}>− {passo} min</button>
          <button type='button' className='que-horas-ajuste' disabled={!!feedback} onClick={() => ajustar(passo)}>+ {passo} min</button>
          <button type='button' className='que-horas-ajuste' disabled={!!feedback} onClick={() => ajustar(60)}>+ 1 hora</button>
        </div>
      </>
    );
  };

  return (
    <div className='center'>
      <div className='global-pageContainer-left options-preview que-horas-page'>
        <BotaoSom />
        <div className='que-horas-card'>
          <div className='que-horas-header'>
            <div>
              <h2 className='paragrafo2'>🕒 Que horas são?</h2>
              <p className='paragrafo3'>Leia o relógio de ponteiros e acerte as horas!</p>
            </div>
            {fase === 'jogando' && (
              <div className='que-horas-badges'>
                <span className='que-horas-badge'>❓ {indice + 1}/{questoes.length}</span>
                <span className='que-horas-badge'>✅ Acertos: {acertos}</span>
                <span className='que-horas-badge'>⏱️ {formatarTempo(segundos)}</span>
              </div>
            )}
          </div>

          {fase === 'config' && (
            <div className='que-horas-config'>
              <ComoJogar jogo='que-horas-sao' />
              <div className='que-horas-config__grupo'>
                <h3>Escolha o modo</h3>
                <div className='que-horas-opcoes'>
                  {MODOS.map((item) => (
                    <button
                      key={item.modo}
                      type='button'
                      className={`que-horas-opcao${modo === item.modo ? ' que-horas-opcao--ativa' : ''}`}
                      aria-pressed={modo === item.modo}
                      onClick={() => setModo(item.modo)}
                    >
                      <strong>{item.label}</strong>
                      <span>{item.descricao}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className='que-horas-config__grupo'>
                <h3>Escolha o nível</h3>
                <div className='que-horas-opcoes'>
                  {NIVEIS.map((item) => (
                    <button
                      key={item.nivel}
                      type='button'
                      className={`que-horas-opcao${nivel === item.nivel ? ' que-horas-opcao--ativa' : ''}`}
                      aria-pressed={nivel === item.nivel}
                      onClick={() => setNivel(item.nivel)}
                    >
                      <strong>{item.label}</strong>
                      <span>{item.descricao}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className='que-horas-config__grupo'>
                <h3>Mostrar as horas</h3>
                <div className='que-horas-opcoes'>
                  {FORMATOS.map((item) => (
                    <button
                      key={item.formato}
                      type='button'
                      className={`que-horas-opcao${formato === item.formato ? ' que-horas-opcao--ativa' : ''}`}
                      aria-pressed={formato === item.formato}
                      onClick={() => setFormato(item.formato)}
                    >
                      <strong>{item.label}</strong>
                    </button>
                  ))}
                </div>
              </div>

              <div className='que-horas-toolbar'>
                <button type='button' className='global-button' onClick={iniciarJogo}>
                  Começar
                </button>
                <Link to='/#jogos' className='global-button global-button--back'>
                  Voltar aos jogos
                </Link>
              </div>
            </div>
          )}

          {questao && (
            <div className='que-horas-jogo'>
              <p className='que-horas-pergunta'>{pergunta(questao, modo, formato)}</p>
              <div className='que-horas-area'>
                {relogioDaQuestao(questao)}
              </div>

              {modo === 'ler' ? (
                <div className='que-horas-respostas'>
                  {questao.opcoes.map((opcao) => (
                    <button key={opcao} type='button' className={`que-horas-resposta${classeOpcao(opcao)}`} disabled={!!feedback} onClick={() => responder(opcao)}>
                      {formatar(opcao, formato)}
                    </button>
                  ))}
                </div>
              ) : (
                <div className='que-horas-toolbar'>
                  <button type='button' className='global-button' disabled={!!feedback} onClick={() => responder(ponteiros)}>
                    Confirmar
                  </button>
                </div>
              )}

              <div aria-live='polite'>
                {feedback?.correta && <p className='que-horas-feedback que-horas-feedback--certo'>🎉 Isso! A hora certa é {formatar(questao.resposta, formato)}.</p>}
                {feedback && !feedback.correta && (
                  <div className='que-horas-correcao'>
                    {(modo === 'acertar' || !!questao.intervalo) && (
                      <Relogio minutos={questao.resposta} rotulo={`Relógio marcando ${formatar(questao.resposta, 'digital')}`} estado='certo' />
                    )}
                    <p className='que-horas-feedback'>Ops! A hora certa é {formatar(questao.resposta, formato)}.</p>
                    <p className='que-horas-explicacao'>{explicar(questao)}</p>
                    <button type='button' className='global-button' onClick={() => avancar(respostas)}>
                      Continuar
                    </button>
                  </div>
                )}
              </div>

              <div className='que-horas-toolbar'>
                <button type='button' className='global-button global-button--basic' onClick={iniciarJogo}>
                  Reiniciar
                </button>
                <button type='button' className='global-button global-button--basic' onClick={mudarConfiguracao}>
                  Mudar configuração
                </button>
              </div>

              {modo === 'acertar' && (
                <p className='que-horas-help'>Dica: arraste o ponteiro grande para os minutos e o pequeno para as horas. Quando o grande dá a volta, o pequeno anda junto, como num relógio de verdade.</p>
              )}
            </div>
          )}

          {fase === 'fim' && resultado && (
            <div className='que-horas-modal' role='dialog' aria-modal='true'>
              <div className='que-horas-modal__content'>
                <h3>🕒 Fim da partida!</h3>
                <p>Você acertou {resultado.acertos} de {TOTAL_QUESTOES} questões em {formatarTempo(resultado.tempo)}.</p>
                <BarraXp ganho={resultado.ganhoXp} />
                <div className='que-horas-modal__actions'>
                  <button type='button' className='global-button' onClick={iniciarJogo}>
                    Jogar de novo
                  </button>
                  <CompartilharResultado resultado={buildShareResult()} className='global-button global-button--basic' />
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

export default QueHorasSao;
