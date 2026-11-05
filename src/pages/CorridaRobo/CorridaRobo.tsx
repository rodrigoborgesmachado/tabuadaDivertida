import { KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { casasDaCorrida, lerNome, salvarQuantidade, useJogador } from '../../services/jogador';
import { playError, playSuccess } from '../../services/sons';
import { salvarPartida, type Questao } from '../../services/historico';
import { conquistasDaPartida, type ConquistaPartida } from '../../services/compartilhar';
import { urlDoSite } from '../../services/plataforma';
import { contasDaTabuada, lerProgresso, partidaFinalizada } from '../../gamificacao/progresso';
import BarraXp from '../../components/BarraXp/BarraXp';
import BotaoSom from '../../components/BotaoSom/BotaoSom';
import RankingFinal from '../../components/RankingFinal/RankingFinal';
import Keypad from '../../components/Keypad/Keypad';
import CompartilharResultado from '../../components/CompartilharResultado/CompartilharResultado';
import RoboPersonalizado from '../../components/RoboPersonalizado/RoboPersonalizado';
import happyRobot from '../../assets/robot-happy.svg';
import neutralRobot from '../../assets/robot-neutral.svg';
import sadRobot from '../../assets/robot-sad.svg';
import { CASAS_CORRIDA, chaveCorrida, formatarTempo, gerarConta, NIVEIS_ROBO, PENALIDADE_MS, posicaoRobo, tempoDoRobo, vencedor, type Conta, type NivelRobo, type Operacao, type Vencedor } from './logic';
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
  conquistas: ConquistaPartida[];
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

const posicaoNaPista = (casas: number, totalCasas: number) => ({ left: `calc((100% - var(--corrida-corredor)) * ${casas / totalCasas})` });

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
  const { quantidade } = useJogador();
  const [totalCasas, setTotalCasas] = useState(() => casasDaCorrida(quantidade));
  const inicioRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const chave = chaveCorrida(operacao, nivel, totalCasas);
  const robo = NIVEIS_ROBO[nivel];
  const acertos = questoes.filter((questao) => questao.correta).length;

  const isMobile = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
           (typeof window !== 'undefined' && (window as any).matchMedia && (window as any).matchMedia('(pointer: coarse)').matches);
  }, []);

  useEffect(() => {
    if (fase === 'config') {
      setTotalCasas(casasDaCorrida(quantidade));
    }
  }, [fase, quantidade]);

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
    const ganhador = fase === 'correndo' ? vencedor(casas, nivel, decorrido, totalCasas) : null;
    if (!ganhador) {
      return;
    }

    const tempo = ganhador === 'jogador' ? decorrido : tempoDoRobo(nivel, totalCasas);
    const novoRecorde = ganhador === 'jogador' && (!recordes[chave] || tempo < recordes[chave]);
    if (novoRecorde) {
      const novosRecordes = { ...recordes, [chave]: tempo };
      setRecordes(novosRecordes);
      saveRecordes(novosRecordes);
    }

    let ganhoXp = 0;
    let conquistas: ConquistaPartida[] = [];
    if (questoes.length > 0) {
      salvarPartida({
        quantidadeQuestoes: questoes.length,
        quantidadeAcertos: acertos,
        tempo: Math.round(tempo / 1000),
        nome: lerNome(),
        tipo: 'CR',
        questoes,
        data: new Date().toISOString(),
        pontuacao: acertos * 10,
      });

      const anterior = lerProgresso();
      partidaFinalizada({
        jogo: 'corrida-robo',
        modo: operacao,
        contas: contasDaTabuada(questoes),
        tempoMedio: Math.round((tempo / 1000 / questoes.length) * 10) / 10,
        nivelRobo: nivel,
        casas: totalCasas,
        venceu: ganhador === 'jogador',
      });
      const atual = lerProgresso();
      ganhoXp = atual.xp - anterior.xp;
      conquistas = conquistasDaPartida(anterior, atual);
    }

    setResultado({ vencedor: ganhador, tempo, novoRecorde, ganhoXp, conquistas });
    setFase('fim');
  }, [fase, casas, nivel, decorrido, totalCasas, recordes, chave, questoes, acertos, operacao]);

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

  const escolherCasas = (valor: number) => {
    setTotalCasas(valor);
    if (casasDaCorrida(quantidade) !== valor) {
      salvarQuantidade(valor);
    }
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

  const buildShareResult = () => {
    const url = `${urlDoSite()}/jogos/corrida-contra-o-robo`;

    return {
      jogo: 'Corrida contra o robô',
      linhas: [
        resultado?.vencedor === 'jogador'
          ? `Venci o ${robo.nome} na Corrida contra o robô!`
          : `Apostei corrida contra o ${robo.nome} na Corrida contra o robô!`,
        `🧮 ${labelOperacao(operacao)}`,
        `🏁 ${totalCasas} casas`,
        `⏱️ Tempo: ${formatarTempo(resultado?.tempo || 0)}`,
        `✅ Acertos: ${acertos}/${questoes.length}`,
      ],
      convite: `Você consegue vencer o robô? ${url}`,
      resumo: `${resultado?.vencedor === 'jogador' ? `Venci o ${robo.nome}` : `${totalCasas} casas`} em ${formatarTempo(resultado?.tempo || 0)}`,
      conquistas: resultado?.conquistas,
    };
  };

  const imagemRobo = resultado ? (resultado.vencedor === 'robo' ? happyRobot : sadRobot) : neutralRobot;
  const casasRobo = posicaoRobo(nivel, decorrido, totalCasas);

  return (
    <div className='center'>
      <div className='global-pageContainer-left options-preview corrida-page'>
        <BotaoSom />
        <div className='corrida-card'>
          <div className='corrida-header'>
            <div>
              <h2 className='paragrafo2'>🏁 Corrida contra o robô</h2>
              <p className='paragrafo3'>Acerte as contas para correr mais rápido que o robô!</p>
            </div>
            {fase === 'correndo' && (
              <div className='corrida-badges'>
                <span className='corrida-badge'>⏱️ {formatarTempo(decorrido)}</span>
                <span className='corrida-badge'>🏁 Casas: {casas}/{totalCasas}</span>
                <span className='corrida-badge'>✅ Acertos: {acertos}</span>
              </div>
            )}
          </div>

          {fase === 'config' && (
            <div className='corrida-config'>
              <p className='corrida-regras'>
                Cada acerto faz o seu robô avançar uma casa. Cada erro deixa você parado por {PENALIDADE_MS / 1000} segundos.
                O robô do site corre sozinho: quem chegar primeiro às {totalCasas} casas vence!
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
                <h3>Escolha o tamanho da pista</h3>
                <div className='corrida-opcoes'>
                  {CASAS_CORRIDA.map((item) => (
                    <button
                      key={item}
                      type='button'
                      className={`corrida-opcao${totalCasas === item ? ' corrida-opcao--ativa' : ''}`}
                      aria-pressed={totalCasas === item}
                      onClick={() => escolherCasas(item)}
                    >
                      {item} casas
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
                <Link to='/#jogos' className='global-button global-button--back'>
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
                    <div className='corrida-corredor' style={posicaoNaPista(casas, totalCasas)}>
                      <RoboPersonalizado titulo='Seu robô' triste={resultado?.vencedor === 'robo'} className='corrida-corredor__robo' />
                    </div>
                  </div>
                  <span className='corrida-raia__casas'>{casas}/{totalCasas}</span>
                </div>
                <div className='corrida-raia'>
                  <span className='corrida-raia__nome'>{robo.icone} Robô</span>
                  <div className='corrida-raia__trilho'>
                    <div className='corrida-corredor corrida-corredor--robo' style={posicaoNaPista(casasRobo, totalCasas)}>
                      <img src={imagemRobo} alt={robo.nome} className='corrida-corredor__robo' />
                    </div>
                  </div>
                  <span className='corrida-raia__casas'>{Math.floor(casasRobo)}/{totalCasas}</span>
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
                    : `O ${robo.nome} chegou primeiro, em ${formatarTempo(resultado.tempo)}. Você avançou ${casas} de ${totalCasas} casas.`}
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

export default CorridaRobo;
