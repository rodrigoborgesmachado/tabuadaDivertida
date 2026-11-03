import { KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import configData from '../../Config.json';
import { playError, playSuccess } from '../../services/sons';
import { salvarPartida, type Questao } from '../../services/historico';
import { compartilhar } from '../../services/compartilhar';
import { contasDaTabuada, lerProgresso, partidaFinalizada } from '../../gamificacao/progresso';
import BarraXp from '../../components/BarraXp/BarraXp';
import RankingFinal from '../../components/RankingFinal/RankingFinal';
import Keypad from '../../components/Keypad/Keypad';
import RoboPersonalizado from '../../components/RoboPersonalizado/RoboPersonalizado';
import happyRobot from '../../assets/robot-happy.svg';
import neutralRobot from '../../assets/robot-neutral.svg';
import sadRobot from '../../assets/robot-sad.svg';
import { formatarTempo, gerarConta, NIVEIS_ROBO, PENALIDADE_MS, posicaoRobo, tempoDoRobo, TOTAL_CASAS, vencedor, type Conta, type NivelRobo, type Operacao, type Vencedor } from './logic';
import '../Contagem/Contagem.css';
import './CorridaRobo.css';

type Fase = 'config' | 'contagem' | 'correndo' | 'fim';

interface Erro {
  conta: Conta;
  ate: number;
}

interface Resultado {
  vencedor: Vencedor;
  tempo: number;
  novoRecorde: boolean;
  ganhoXp: number;
}

const STORAGE_KEY = 'tabuada-divertida-corrida-robo-recordes';
const TICK_MS = 100;

const OPERACOES: { operacao: Operacao; label: string }[] = [
  { operacao: 'M', label: 'Multiplicação✖️' },
  { operacao: 'A', label: 'Adição➕' },
  { operacao: 'S', label: 'Subtração➖' },
  { operacao: 'D', label: 'Divisão➗' },
  { operacao: 'R', label: 'Aleatório🔀' },
];

const NIVEIS = Object.keys(NIVEIS_ROBO) as NivelRobo[];

const labelOperacao = (operacao: Operacao) => OPERACOES.find((item) => item.operacao === operacao)?.label || '';

const posicaoNaPista = (casas: number) => ({ left: `calc((100% - var(--corrida-corredor)) * ${casas / TOTAL_CASAS})` });

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

function CorridaRobo() {
  const [operacao, setOperacao] = useState<Operacao>('M');
  const [nivel, setNivel] = useState<NivelRobo>('sonolento');
  const [fase, setFase] = useState<Fase>('config');
  const [contagem, setContagem] = useState(3);
  const [conta, setConta] = useState<Conta | null>(null);
  const [resposta, setResposta] = useState('');
  const [casas, setCasas] = useState(0);
  const [decorrido, setDecorrido] = useState(0);
  const [erro, setErro] = useState<Erro | null>(null);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [recordes, setRecordes] = useState<Record<string, number>>(() => readRecordes());
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const inicioRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const chave = `${operacao}-${nivel}`;
  const robo = NIVEIS_ROBO[nivel];
  const acertos = questoes.filter((questao) => questao.correta).length;

  const isMobile = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
           (typeof window !== 'undefined' && (window as any).matchMedia && (window as any).matchMedia('(pointer: coarse)').matches);
  }, []);

  useEffect(() => {
    if (fase !== 'contagem') {
      return;
    }

    if (contagem === 0) {
      inicioRef.current = Date.now();
      setConta(gerarConta(operacao));
      setFase('correndo');
      return;
    }

    const timer = window.setTimeout(() => setContagem((atual) => atual - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [fase, contagem, operacao]);

  useEffect(() => {
    if (fase !== 'correndo') {
      return;
    }

    const interval = window.setInterval(() => setDecorrido(Date.now() - inicioRef.current), TICK_MS);
    return () => window.clearInterval(interval);
  }, [fase]);

  useEffect(() => {
    if (erro && decorrido >= erro.ate) {
      setErro(null);
      setConta(gerarConta(operacao));
    }
  }, [erro, decorrido, operacao]);

  useEffect(() => {
    if (fase === 'correndo' && !erro && !isMobile) {
      inputRef.current?.focus();
    }
  }, [fase, erro, isMobile]);

  useEffect(() => {
    const ganhador = fase === 'correndo' ? vencedor(casas, nivel, decorrido) : null;
    if (!ganhador) {
      return;
    }

    const tempo = ganhador === 'jogador' ? decorrido : tempoDoRobo(nivel);
    const novoRecorde = ganhador === 'jogador' && (!recordes[chave] || tempo < recordes[chave]);
    if (novoRecorde) {
      const novosRecordes = { ...recordes, [chave]: tempo };
      setRecordes(novosRecordes);
      saveRecordes(novosRecordes);
    }

    let ganhoXp = 0;
    if (questoes.length > 0) {
      salvarPartida({
        quantidadeQuestoes: questoes.length,
        quantidadeAcertos: acertos,
        tempo: Math.round(tempo / 1000),
        nome: localStorage.getItem(configData.NOME_PARAM),
        tipo: 'CR',
        questoes,
        data: new Date().toISOString(),
        pontuacao: acertos * 10,
      });

      const xpAnterior = lerProgresso().xp;
      partidaFinalizada({
        jogo: 'corrida-robo',
        modo: operacao,
        contas: contasDaTabuada(questoes),
        tempoMedio: Math.round((tempo / 1000 / questoes.length) * 10) / 10,
        nivelRobo: nivel,
        venceu: ganhador === 'jogador',
      });
      ganhoXp = lerProgresso().xp - xpAnterior;
    }

    setResultado({ vencedor: ganhador, tempo, novoRecorde, ganhoXp });
    setFase('fim');
  }, [fase, casas, nivel, decorrido, recordes, chave, questoes, acertos, operacao]);

  const iniciarCorrida = () => {
    setConta(null);
    setResposta('');
    setCasas(0);
    setDecorrido(0);
    setErro(null);
    setQuestoes([]);
    setResultado(null);
    setContagem(3);
    setFase('contagem');
  };

  const mudarConfiguracao = () => {
    setResultado(null);
    setFase('config');
  };

  const respondeu = (valor: string) => {
    setResposta(/^\d+$/.test(valor) ? valor : '');
  };

  const responder = () => {
    if (fase !== 'correndo' || !conta || erro || resposta === '') {
      return;
    }

    const agora = Date.now() - inicioRef.current;
    const correta = Number(resposta) === conta.resposta;
    setQuestoes((atuais) => [...atuais, { questao: conta.texto, resposta, correta }]);
    setResposta('');
    setDecorrido(agora);

    if (correta) {
      playSuccess();
      setCasas((atual) => atual + 1);
      setConta(gerarConta(operacao));
      return;
    }

    playError();
    setErro({ conta, ate: agora + PENALIDADE_MS });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      responder();
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin || 'https://www.tabuadadivertida.com'}/jogos/corrida-contra-o-robo`;

    compartilhar('Corrida contra o robô', [
      resultado?.vencedor === 'jogador'
        ? `Venci o ${robo.nome} na Corrida contra o robô!`
        : `Apostei corrida contra o ${robo.nome} na Corrida contra o robô!`,
      `🧮 ${labelOperacao(operacao)}`,
      `⏱️ Tempo: ${formatarTempo(resultado?.tempo || 0)}`,
      `✅ Acertos: ${acertos}/${questoes.length}`,
      '',
      `Você consegue vencer o robô? ${url}`,
    ].join('\n'));
  };

  const imagemRobo = resultado ? (resultado.vencedor === 'robo' ? happyRobot : sadRobot) : neutralRobot;
  const casasRobo = posicaoRobo(nivel, decorrido);

  return (
    <div className='center'>
      <div className='global-pageContainer-left options-preview corrida-page'>
        <div className='corrida-card'>
          <div className='corrida-header'>
            <div>
              <h2 className='paragrafo2'>🏁 Corrida contra o robô</h2>
              <p className='paragrafo3'>Acerte as contas para correr mais rápido que o robô!</p>
            </div>
            {fase === 'correndo' && (
              <div className='corrida-badges'>
                <span className='corrida-badge'>⏱️ {formatarTempo(decorrido)}</span>
                <span className='corrida-badge'>🏁 Casas: {casas}/{TOTAL_CASAS}</span>
                <span className='corrida-badge'>✅ Acertos: {acertos}</span>
              </div>
            )}
          </div>

          {fase === 'config' && (
            <div className='corrida-config'>
              <p className='corrida-regras'>
                Cada acerto faz o seu robô avançar uma casa. Cada erro deixa você parado por {PENALIDADE_MS / 1000} segundos.
                O robô do site corre sozinho: quem chegar primeiro às {TOTAL_CASAS} casas vence!
              </p>

              <div className='corrida-config__grupo'>
                <h3>Escolha a operação</h3>
                <div className='corrida-opcoes'>
                  {OPERACOES.map((item) => (
                    <button
                      key={item.operacao}
                      type='button'
                      className={`corrida-opcao${operacao === item.operacao ? ' corrida-opcao--ativa' : ''}`}
                      aria-pressed={operacao === item.operacao}
                      onClick={() => setOperacao(item.operacao)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className='corrida-config__grupo'>
                <h3>Escolha o adversário</h3>
                <div className='corrida-opcoes'>
                  {NIVEIS.map((item) => (
                    <button
                      key={item}
                      type='button'
                      className={`corrida-opcao corrida-opcao--nivel${nivel === item ? ' corrida-opcao--ativa' : ''}`}
                      aria-pressed={nivel === item}
                      onClick={() => setNivel(item)}
                    >
                      <strong>{NIVEIS_ROBO[item].icone} {NIVEIS_ROBO[item].nome}</strong>
                      <span>1 casa a cada {NIVEIS_ROBO[item].msPorCasa / 1000}s</span>
                    </button>
                  ))}
                </div>
                <p className='corrida-recorde'>🏆 Recorde: {recordes[chave] ? formatarTempo(recordes[chave]) : 'ainda não há'}</p>
              </div>

              <div className='corrida-toolbar'>
                <button type='button' className='global-button' onClick={iniciarCorrida}>
                  Começar
                </button>
                <Link to='/jogos' className='global-button global-button--back'>
                  Voltar aos jogos
                </Link>
              </div>
            </div>
          )}

          {fase === 'contagem' && (
            <div className='corrida-contagem'>
              <h2 className='countdown-text'>Prepare-se!</h2>
              {contagem > 0 && (
                <div key={contagem} className='countdown-number'>{contagem}</div>
              )}
            </div>
          )}

          {(fase === 'correndo' || fase === 'fim') && (
            <>
              <div className={`corrida-pista${fase === 'correndo' ? ' corrida-pista--correndo' : ''}`} aria-label='Pista da corrida'>
                <div className='corrida-raia'>
                  <span className='corrida-raia__nome'>Você</span>
                  <div className='corrida-raia__trilho'>
                    <div className='corrida-corredor' style={posicaoNaPista(casas)}>
                      <RoboPersonalizado titulo='Seu robô' triste={resultado?.vencedor === 'robo'} className='corrida-corredor__robo' />
                    </div>
                  </div>
                  <span className='corrida-raia__casas'>{casas}/{TOTAL_CASAS}</span>
                </div>
                <div className='corrida-raia'>
                  <span className='corrida-raia__nome'>{robo.icone} Robô</span>
                  <div className='corrida-raia__trilho'>
                    <div className='corrida-corredor corrida-corredor--robo' style={posicaoNaPista(casasRobo)}>
                      <img src={imagemRobo} alt={robo.nome} className='corrida-corredor__robo' />
                    </div>
                  </div>
                  <span className='corrida-raia__casas'>{Math.floor(casasRobo)}/{TOTAL_CASAS}</span>
                </div>
              </div>

              {fase === 'correndo' && conta && (
                <div className='divJogo corrida-jogo'>
                  <h3>{erro ? erro.conta.texto : conta.texto}</h3>
                  <input
                    ref={inputRef}
                    aria-label='Sua resposta'
                    type={isMobile ? 'text' : 'number'}
                    inputMode={isMobile ? 'none' : 'numeric'}
                    value={resposta}
                    onChange={(e) => respondeu(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    readOnly={isMobile}
                    disabled={isMobile || !!erro}
                  />
                  {isMobile && (
                    <Keypad
                      value={resposta}
                      onChange={(val) => respondeu(val)}
                      onEnter={responder}
                    />
                  )}
                  <p className='corrida-feedback' aria-live='polite'>
                    {erro ? `Ops! ${erro.conta.texto} = ${erro.conta.resposta}. Seu robô tropeçou...` : ''}
                  </p>
                  <div className='corrida-toolbar'>
                    <button type='button' className='global-button global-button--basic' onClick={iniciarCorrida}>
                      Reiniciar
                    </button>
                    <button type='button' className='global-button global-button--basic' onClick={mudarConfiguracao}>
                      Mudar configuração
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {fase === 'fim' && resultado && (
            <div className='corrida-resultado' role='status'>
              <div className='corrida-resultado__content'>
                <h3>{resultado.vencedor === 'jogador' ? '🏆 Você venceu!' : '🤖 O robô venceu!'}</h3>
                <p>
                  {resultado.vencedor === 'jogador'
                    ? `Você cruzou a linha de chegada em ${formatarTempo(resultado.tempo)}, na frente do ${robo.nome}.`
                    : `O ${robo.nome} chegou primeiro, em ${formatarTempo(resultado.tempo)}. Você avançou ${casas} de ${TOTAL_CASAS} casas.`}
                </p>
                <p>✅ {acertos} {acertos === 1 ? 'acerto' : 'acertos'} em {questoes.length} {questoes.length === 1 ? 'resposta' : 'respostas'}.</p>
                <p className='corrida-resultado__recorde'>
                  {resultado.novoRecorde
                    ? `🏆 Novo recorde contra o ${robo.nome}!`
                    : recordes[chave] ? `🏆 Recorde: ${formatarTempo(recordes[chave])}` : '🏆 Vença o robô para marcar um recorde.'}
                </p>
                <BarraXp ganho={resultado.ganhoXp} />
                {resultado.vencedor === 'jogador' && (
                  <RankingFinal jogo='corrida-robo' modo={chave} resultado={{ tempo: Math.round(resultado.tempo / 1000), acertos, total: questoes.length }} />
                )}
                <div className='corrida-resultado__actions'>
                  <button type='button' className='global-button' onClick={iniciarCorrida}>
                    Revanche
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

export default CorridaRobo;
