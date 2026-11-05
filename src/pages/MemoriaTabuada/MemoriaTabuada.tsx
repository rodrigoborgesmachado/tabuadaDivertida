import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { playError, playSuccess } from '../../services/sons';
import { conquistasDaPartida, type ConquistaPartida } from '../../services/compartilhar';
import { urlDoSite } from '../../services/plataforma';
import { lerProgresso, partidaFinalizada } from '../../gamificacao/progresso';
import BarraXp from '../../components/BarraXp/BarraXp';
import BotaoSom from '../../components/BotaoSom/BotaoSom';
import CompartilharResultado from '../../components/CompartilharResultado/CompartilharResultado';
import RankingFinal from '../../components/RankingFinal/RankingFinal';
import ComoJogar from '../../components/ComoJogar/ComoJogar';
import { criarTabuleiro, formamPar, formatarTempo, isMelhorResultado, PARES_POR_NIVEL, TABUADAS, type Carta, type Nivel, type Resultado, type Tabuada } from './logic';
import './MemoriaTabuada.css';

type Melhores = Partial<Record<Nivel, Resultado>>;

const STORAGE_KEY = 'tabuada-divertida-memoria-melhores';
const TEMPO_PARA_DESVIRAR = 900;

export const NIVEIS: { nivel: Nivel; label: string }[] = [
  { nivel: 'facil', label: 'Fácil' },
  { nivel: 'medio', label: 'Médio' },
  { nivel: 'dificil', label: 'Difícil' },
];

const labelNivel = (nivel: Nivel) => NIVEIS.find((item) => item.nivel === nivel)?.label || '';

const labelTabuada = (tabuada: Tabuada) => (tabuada === 'misturado' ? 'Misturado' : `Tabuada do ${tabuada}`);

export const readMelhores = (): Melhores => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Melhores) : {};
  } catch {
    return {};
  }
};

const saveMelhores = (melhores: Melhores) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(melhores));
  } catch {}
};

function MemoriaTabuada() {
  const [tabuada, setTabuada] = useState<Tabuada>('misturado');
  const [nivel, setNivel] = useState<Nivel>('facil');
  const [jogando, setJogando] = useState(false);
  const [cartas, setCartas] = useState<Carta[]>([]);
  const [abertas, setAbertas] = useState<string[]>([]);
  const [encontradas, setEncontradas] = useState<string[]>([]);
  const [jogadas, setJogadas] = useState(0);
  const [cartasErradas, setCartasErradas] = useState<string[]>([]);
  const [segundos, setSegundos] = useState(0);
  const [melhores, setMelhores] = useState<Melhores>(() => readMelhores());
  const [resultadoFinal, setResultadoFinal] = useState<(Resultado & { novoRecorde: boolean; ganhoXp: number; conquistas: ConquistaPartida[] }) | null>(null);
  const desvirarRef = useRef<number | null>(null);

  const terminou = cartas.length > 0 && encontradas.length === cartas.length;

  useEffect(() => {
    if (!jogando || terminou) {
      return;
    }

    const interval = window.setInterval(() => setSegundos((atual) => atual + 1), 1000);
    return () => window.clearInterval(interval);
  }, [jogando, terminou]);

  useEffect(() => () => {
    if (desvirarRef.current) {
      window.clearTimeout(desvirarRef.current);
    }
  }, []);

  const iniciarJogo = () => {
    if (desvirarRef.current) {
      window.clearTimeout(desvirarRef.current);
    }
    setCartas(criarTabuleiro(tabuada, nivel));
    setAbertas([]);
    setEncontradas([]);
    setJogadas(0);
    setCartasErradas([]);
    setSegundos(0);
    setResultadoFinal(null);
    setJogando(true);
  };

  const mudarConfiguracao = () => {
    if (desvirarRef.current) {
      window.clearTimeout(desvirarRef.current);
    }
    setJogando(false);
    setResultadoFinal(null);
  };

  const finalizarJogo = (totalJogadas: number) => {
    const resultado = { jogadas: totalJogadas, segundos };
    const novoRecorde = isMelhorResultado(resultado, melhores[nivel] || null);

    if (novoRecorde) {
      const novosMelhores = { ...melhores, [nivel]: resultado };
      setMelhores(novosMelhores);
      saveMelhores(novosMelhores);
    }

    const anterior = lerProgresso();
    partidaFinalizada({
      jogo: 'memoria',
      nivel,
      jogadas: totalJogadas,
      tempo: segundos,
      desperdicio: new Set(cartasErradas).size < cartasErradas.length,
    });
    const atual = lerProgresso();
    setResultadoFinal({ ...resultado, novoRecorde, ganhoXp: atual.xp - anterior.xp, conquistas: conquistasDaPartida(anterior, atual) });
  };

  const handleVirar = (carta: Carta) => {
    if (abertas.length >= 2 || abertas.includes(carta.id) || encontradas.includes(carta.id)) {
      return;
    }

    const novasAbertas = [...abertas, carta.id];
    setAbertas(novasAbertas);

    if (novasAbertas.length < 2) {
      return;
    }

    const totalJogadas = jogadas + 1;
    const primeira = cartas.find((item) => item.id === novasAbertas[0]) as Carta;
    setJogadas(totalJogadas);

    if (formamPar(primeira, carta)) {
      playSuccess();
      const novasEncontradas = [...encontradas, primeira.id, carta.id];
      setEncontradas(novasEncontradas);
      setAbertas([]);

      if (novasEncontradas.length === cartas.length) {
        finalizarJogo(totalJogadas);
      }
      return;
    }

    playError();
    setCartasErradas([...cartasErradas, primeira.id, carta.id]);
    desvirarRef.current = window.setTimeout(() => {
      setAbertas([]);
      desvirarRef.current = null;
    }, TEMPO_PARA_DESVIRAR);
  };

  const buildShareResult = () => {
    const url = `${urlDoSite()}/jogos/memoria-da-tabuada`;

    return {
      jogo: 'Memória da tabuada',
      linhas: [
        'Este foi meu resultado na Memória da tabuada!',
        `🧮 ${labelTabuada(tabuada)}`,
        `🎚️ Nível: ${labelNivel(nivel)}`,
        `🔁 Jogadas: ${resultadoFinal?.jogadas ?? jogadas}`,
        `⏱️ Tempo: ${formatarTempo(resultadoFinal?.segundos ?? segundos)}`,
      ],
      convite: `Você consegue fazer melhor? ${url}`,
      resumo: `${resultadoFinal?.jogadas ?? jogadas} jogadas em ${formatarTempo(resultadoFinal?.segundos ?? segundos)}`,
      conquistas: resultadoFinal?.conquistas,
    };
  };

  const melhorDoNivel = melhores[nivel];

  return (
    <div className='center'>
      <div className='global-pageContainer-left options-preview memoria-page'>
        <BotaoSom />
        <div className='memoria-card'>
          <div className='memoria-header'>
            <div>
              <h2 className='paragrafo2'>🧠 Memória da tabuada</h2>
              <p className='paragrafo3'>Vire as cartas e junte cada conta com o seu resultado!</p>
            </div>
            {jogando && (
              <div className='memoria-badges'>
                <span className='memoria-badge'>🔁 Jogadas: {jogadas}</span>
                <span className='memoria-badge'>⏱️ {formatarTempo(segundos)}</span>
                <span className='memoria-badge'>✅ Pares: {encontradas.length / 2}/{cartas.length / 2}</span>
              </div>
            )}
          </div>

          {!jogando ? (
            <div className='memoria-config'>
              <ComoJogar jogo='memoria' />
              <div className='memoria-config__grupo'>
                <h3>Escolha a tabuada</h3>
                <div className='memoria-opcoes memoria-opcoes--tabuadas'>
                  {TABUADAS.map((item) => (
                    <button
                      key={item}
                      type='button'
                      className={`memoria-opcao${tabuada === item ? ' memoria-opcao--ativa' : ''}`}
                      aria-pressed={tabuada === item}
                      onClick={() => setTabuada(item)}
                    >
                      {item === 'misturado' ? '🔀 Misturado' : item}
                    </button>
                  ))}
                </div>
              </div>

              <div className='memoria-config__grupo'>
                <h3>Escolha o tamanho</h3>
                <div className='memoria-opcoes'>
                  {NIVEIS.map((item) => (
                    <button
                      key={item.nivel}
                      type='button'
                      className={`memoria-opcao memoria-opcao--nivel${nivel === item.nivel ? ' memoria-opcao--ativa' : ''}`}
                      aria-pressed={nivel === item.nivel}
                      onClick={() => setNivel(item.nivel)}
                    >
                      <strong>{item.label}</strong>
                      <span>{PARES_POR_NIVEL[item.nivel]} pares</span>
                    </button>
                  ))}
                </div>
                <p className='memoria-melhor'>
                  🏆 Melhor resultado no nível {labelNivel(nivel).toLowerCase()}:{' '}
                  {melhorDoNivel ? `${melhorDoNivel.jogadas} jogadas em ${formatarTempo(melhorDoNivel.segundos)}` : 'ainda não há'}
                </p>
              </div>

              <div className='memoria-toolbar'>
                <button type='button' className='global-button' onClick={iniciarJogo}>
                  Começar
                </button>
                <Link to='/#jogos' className='global-button global-button--back'>
                  Voltar aos jogos
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className='memoria-toolbar'>
                <button type='button' className='global-button global-button--basic' onClick={iniciarJogo}>
                  Reiniciar
                </button>
                <button type='button' className='global-button global-button--basic' onClick={mudarConfiguracao}>
                  Mudar configuração
                </button>
              </div>

              <div className={`memoria-tabuleiro memoria-tabuleiro--${nivel}`} aria-label='Cartas do jogo da memória'>
                {cartas.map((carta) => {
                  const encontrada = encontradas.includes(carta.id);
                  const virada = encontrada || abertas.includes(carta.id);

                  return (
                    <button
                      key={carta.id}
                      type='button'
                      className={`memoria-carta${virada ? ' memoria-carta--virada' : ''}${encontrada ? ' memoria-carta--encontrada' : ''}`}
                      aria-label={virada ? carta.texto : 'Carta virada para baixo'}
                      disabled={encontrada}
                      onClick={() => handleVirar(carta)}
                    >
                      <span className='memoria-carta__inner'>
                        <span className='memoria-carta__face memoria-carta__face--verso' aria-hidden='true'>❓</span>
                        <span className={`memoria-carta__face memoria-carta__face--frente memoria-carta__face--${carta.tipo}`} aria-hidden='true'>
                          {carta.texto}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className='memoria-help'>Dica: cada conta tem um único resultado no tabuleiro. Vire duas cartas por vez e tente lembrar onde cada uma está.</p>
            </>
          )}

          {resultadoFinal && (
            <div className='memoria-modal' role='dialog' aria-modal='true'>
              <div className='memoria-modal__content'>
                <h3>🎉 Parabéns!</h3>
                <p>
                  Você encontrou todos os pares em {resultadoFinal.jogadas} jogadas e {formatarTempo(resultadoFinal.segundos)}.
                </p>
                <p className='memoria-modal__recorde'>
                  {resultadoFinal.novoRecorde
                    ? `🏆 Novo recorde no nível ${labelNivel(nivel).toLowerCase()}!`
                    : `🏆 Melhor resultado: ${melhorDoNivel?.jogadas} jogadas em ${formatarTempo(melhorDoNivel?.segundos || 0)}`}
                </p>
                <BarraXp ganho={resultadoFinal.ganhoXp} />
                <RankingFinal jogo='memoria' modo={nivel} resultado={{ pontuacao: resultadoFinal.jogadas, tempo: resultadoFinal.segundos, extras: { tabuada } }} />
                <div className='memoria-modal__actions'>
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

export default MemoriaTabuada;
