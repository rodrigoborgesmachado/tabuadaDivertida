import { CSSProperties, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { lerProgresso, partidaFinalizada } from '../../gamificacao/progresso';
import { conquistasDaPartida, type ConquistaPartida } from '../../services/compartilhar';
import { playSuccess } from '../../services/sons';
import BarraXp from '../../components/BarraXp/BarraXp';
import BotaoSom from '../../components/BotaoSom/BotaoSom';
import ComoJogar from '../../components/ComoJogar/ComoJogar';
import CompartilharResultado from '../../components/CompartilharResultado/CompartilharResultado';
import HappyRobot from '../../components/HappyRobot/HappyRobot';
import { formatarTempo } from '../MemoriaTabuada/logic';
import { buscarModo, casaParaDica, casasComConflito, copiarGrade, DICAS, dimensoesBloco, estaCompleto, gerarTabuleiro, mesmaRegiao, MODOS, moverCasa, type Casa, type Direcao, type Grade, type Modo } from './logic';
import './Sudoku.css';

interface Jogada extends Casa {
  anterior: number;
  dica?: boolean;
}

interface Partida {
  modo: string;
  inicial: Grade;
  solucao: Grade;
  grade: Grade;
  dicas: string[];
  dicasUsadas: number;
  historico: Jogada[];
  segundos: number;
}

interface Resultado {
  modo: Modo;
  segundos: number;
  dicasUsadas: number;
  ganhoXp: number;
  conquistas: ConquistaPartida[];
}

const STORAGE_KEY = 'tabuada-divertida-sudoku-partida';
const STORAGE_ERROS = 'tabuada-divertida-sudoku-marcar-erros';

const DIRECOES: Record<string, Direcao> = {
  ArrowUp: 'cima',
  ArrowDown: 'baixo',
  ArrowLeft: 'esquerda',
  ArrowRight: 'direita',
};

const chave = ({ linha, coluna }: Casa) => `${linha}-${coluna}`;

const lerPartida = (): Partida | null => {
  try {
    const dados = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null') as Partida | null;
    return dados && buscarModo(dados.modo) && Array.isArray(dados.grade) && Array.isArray(dados.solucao) ? dados : null;
  } catch {
    return null;
  }
};

const salvarPartida = (partida: Partida | null) => {
  try {
    if (partida) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(partida));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {}
};

const lerMarcarErros = () => {
  try {
    return window.localStorage.getItem(STORAGE_ERROS) !== '0';
  } catch {
    return true;
  }
};

function Sudoku() {
  const [partida, setPartida] = useState<Partida | null>(() => lerPartida());
  const [modoId, setModoId] = useState(() => partida?.modo || MODOS[0].id);
  const [selecionada, setSelecionada] = useState<Casa | null>(null);
  const [marcarErros, setMarcarErros] = useState(() => lerMarcarErros());
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const modo = partida ? buscarModo(partida.modo) : undefined;
  const tamanho = modo?.tamanho || 0;

  useEffect(() => {
    salvarPartida(partida);
  }, [partida]);

  const jogando = !!partida;

  useEffect(() => {
    if (!jogando) {
      return;
    }

    const intervalo = window.setInterval(() => setPartida((atual) => atual && { ...atual, segundos: atual.segundos + 1 }), 1000);
    return () => window.clearInterval(intervalo);
  }, [jogando]);

  const iniciarJogo = (id = modoId) => {
    const escolhido = buscarModo(id) || MODOS[0];
    const { inicial, solucao } = gerarTabuleiro(escolhido);
    setPartida({ modo: escolhido.id, inicial, solucao, grade: copiarGrade(inicial), dicas: [], dicasUsadas: 0, historico: [], segundos: 0 });
    setSelecionada(null);
    setResultado(null);
  };

  const finalizarJogo = (concluida: Partida) => {
    const anterior = lerProgresso();
    partidaFinalizada({ jogo: 'sudoku', modo: concluida.modo });
    const atual = lerProgresso();
    setResultado({
      modo: buscarModo(concluida.modo) as Modo,
      segundos: concluida.segundos,
      dicasUsadas: concluida.dicasUsadas,
      ganhoXp: atual.xp - anterior.xp,
      conquistas: conquistasDaPartida(anterior, atual),
    });
    setPartida(null);
    setSelecionada(null);
    playSuccess();
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
  };

  const aplicarJogada = (proxima: Partida) => {
    if (estaCompleto(proxima.grade, proxima.solucao)) {
      finalizarJogo(proxima);
      return;
    }

    setPartida(proxima);
  };

  const ehFixa = (atual: Partida, casa: Casa) => atual.inicial[casa.linha][casa.coluna] !== 0 || atual.dicas.includes(chave(casa));

  const escrever = (numero: number) => {
    if (!partida || !selecionada || ehFixa(partida, selecionada)) {
      return;
    }

    const { linha, coluna } = selecionada;
    const anterior = partida.grade[linha][coluna];
    if (anterior === numero) {
      return;
    }

    const grade = copiarGrade(partida.grade);
    grade[linha][coluna] = numero;
    aplicarJogada({ ...partida, grade, historico: [...partida.historico, { linha, coluna, anterior }] });
  };

  const desfazer = () => {
    if (!partida || partida.historico.length === 0) {
      return;
    }

    const ultima = partida.historico[partida.historico.length - 1];
    const grade = copiarGrade(partida.grade);
    grade[ultima.linha][ultima.coluna] = ultima.anterior;
    setPartida({
      ...partida,
      grade,
      dicas: ultima.dica ? partida.dicas.filter((item) => item !== chave(ultima)) : partida.dicas,
      historico: partida.historico.slice(0, -1),
    });
    setSelecionada({ linha: ultima.linha, coluna: ultima.coluna });
  };

  const darDica = () => {
    if (!partida || partida.dicasUsadas >= DICAS) {
      return;
    }

    const casa = casaParaDica(partida.grade, partida.solucao, selecionada);
    if (!casa) {
      return;
    }

    const grade = copiarGrade(partida.grade);
    grade[casa.linha][casa.coluna] = partida.solucao[casa.linha][casa.coluna];
    setSelecionada(casa);
    aplicarJogada({
      ...partida,
      grade,
      dicas: [...partida.dicas, chave(casa)],
      dicasUsadas: partida.dicasUsadas + 1,
      historico: [...partida.historico, { ...casa, anterior: partida.grade[casa.linha][casa.coluna], dica: true }],
    });
  };

  const alternarErros = () => {
    const proximo = !marcarErros;
    setMarcarErros(proximo);
    try {
      window.localStorage.setItem(STORAGE_ERROS, proximo ? '1' : '0');
    } catch {}
  };

  const mudarNivel = () => {
    if (partida && partida.historico.length > 0 && !window.confirm('Deseja abandonar a partida atual?')) {
      return;
    }

    setPartida(null);
    setResultado(null);
    setSelecionada(null);
  };

  useEffect(() => {
    if (!jogando) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        desfazer();
        return;
      }

      const direcao = DIRECOES[event.key];
      if (direcao) {
        event.preventDefault();
        setSelecionada((atual) => (atual ? moverCasa(atual, direcao, tamanho) : { linha: 0, coluna: 0 }));
        return;
      }

      const numero = Number(event.key);
      if (/^\d$/.test(event.key) && numero >= 1 && numero <= tamanho) {
        escrever(numero);
      } else if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') {
        escrever(0);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const renderTabuleiro = (atual: Partida) => {
    const { linhas, colunas } = dimensoesBloco(tamanho);
    const conflitos = marcarErros ? casasComConflito(atual.grade) : new Set<string>();
    const valorSelecionado = selecionada ? atual.grade[selecionada.linha][selecionada.coluna] : 0;

    return (
      <div className={`sudoku-grade sudoku-grade--${tamanho}`} style={{ '--sudoku-tamanho': tamanho } as CSSProperties} aria-label={`Tabuleiro do Sudoku ${modo?.nome}`}>
        {atual.grade.map((linhaValores, linha) =>
          linhaValores.map((valor, coluna) => {
            const casa = { linha, coluna };
            const classes = [
              'sudoku-casa',
              atual.inicial[linha][coluna] !== 0 ? 'sudoku-casa--fixa' : '',
              atual.dicas.includes(chave(casa)) ? 'sudoku-casa--dica' : '',
              selecionada && mesmaRegiao(selecionada, casa, tamanho) ? 'sudoku-casa--relacionada' : '',
              valorSelecionado !== 0 && valor === valorSelecionado ? 'sudoku-casa--mesmo-numero' : '',
              selecionada && selecionada.linha === linha && selecionada.coluna === coluna ? 'sudoku-casa--selecionada' : '',
              conflitos.has(chave(casa)) ? 'sudoku-casa--erro' : '',
              (coluna + 1) % colunas === 0 && coluna < tamanho - 1 ? 'sudoku-casa--borda-direita' : '',
              (linha + 1) % linhas === 0 && linha < tamanho - 1 ? 'sudoku-casa--borda-baixo' : '',
            ].filter(Boolean).join(' ');

            return (
              <button
                key={chave(casa)}
                type='button'
                className={classes}
                aria-label={`Linha ${linha + 1}, coluna ${coluna + 1}: ${valor || 'vazia'}`}
                aria-pressed={!!selecionada && selecionada.linha === linha && selecionada.coluna === coluna}
                onClick={() => setSelecionada(casa)}
              >
                {valor || ''}
              </button>
            );
          })
        )}
      </div>
    );
  };

  return (
    <div className='center'>
      <div className='global-pageContainer-left options-preview sudoku-page'>
        <BotaoSom />
        <div className='sudoku-card'>
          <div className='sudoku-header'>
            <div>
              <h2 className='paragrafo2'>🔢 Sudoku</h2>
              <p className='paragrafo3'>Cada número aparece uma única vez em cada linha, coluna e bloco.</p>
            </div>
            {partida && modo && (
              <div className='sudoku-badges'>
                <span className='sudoku-badge'>{modo.nome}</span>
                <span className='sudoku-badge'>⏱️ {formatarTempo(partida.segundos)}</span>
                <span className='sudoku-badge'>💡 {DICAS - partida.dicasUsadas} dicas</span>
              </div>
            )}
          </div>

          {!partida && !resultado && (
            <div className='sudoku-config'>
              <ComoJogar jogo='sudoku' />
              <div className='sudoku-config__grupo'>
                <h3>Escolha o tamanho e o nível</h3>
                <div className='sudoku-opcoes'>
                  {MODOS.map((item) => (
                    <button
                      key={item.id}
                      type='button'
                      className={`sudoku-opcao${modoId === item.id ? ' sudoku-opcao--ativa' : ''}`}
                      aria-pressed={modoId === item.id}
                      onClick={() => setModoId(item.id)}
                    >
                      <strong>{item.nome}</strong>
                      <span>{item.descricao}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className='sudoku-toolbar'>
                <button type='button' className='global-button sudoku-jogar' onClick={() => iniciarJogo()}>
                  ▶️ Jogar
                </button>
                <Link to='/#jogos' className='global-button global-button--back'>
                  Voltar aos jogos
                </Link>
              </div>
            </div>
          )}

          {partida && (
            <div className='sudoku-jogo'>
              {renderTabuleiro(partida)}
              <div className={`sudoku-teclado sudoku-teclado--${tamanho}`} aria-label='Teclado do Sudoku'>
                {Array.from({ length: tamanho }, (_, i) => i + 1).map((numero) => (
                  <button key={numero} type='button' className='sudoku-tecla' aria-label={`Número ${numero}`} onClick={() => escrever(numero)}>
                    {numero}
                  </button>
                ))}
                <button type='button' className='sudoku-tecla sudoku-tecla--apagar' aria-label='Apagar casa' onClick={() => escrever(0)}>
                  ⌫
                </button>
              </div>
              <div className='sudoku-toolbar'>
                <button type='button' className='global-button global-button--basic' onClick={desfazer} disabled={partida.historico.length === 0}>
                  ↩️ Desfazer
                </button>
                <button type='button' className='global-button global-button--basic' onClick={darDica} disabled={partida.dicasUsadas >= DICAS}>
                  💡 Dica ({DICAS - partida.dicasUsadas})
                </button>
                <button type='button' className={`global-button global-button--basic sudoku-erros${marcarErros ? ' sudoku-erros--ativo' : ''}`} aria-pressed={marcarErros} onClick={alternarErros}>
                  {marcarErros ? '✅' : '⬜'} Marcar erros
                </button>
                <button type='button' className='global-button global-button--transparent' onClick={mudarNivel}>
                  Novo jogo
                </button>
              </div>
              <p className='sudoku-ajuda'>Toque numa casa e escolha o número. No computador, use as setas e as teclas de 1 a {tamanho}.</p>
            </div>
          )}

          {resultado && (
            <div className='sudoku-resultado' role='status'>
              <HappyRobot />
              <h3>🎉 Parabéns!</h3>
              <p>
                Você completou o Sudoku {resultado.modo.nome} em {formatarTempo(resultado.segundos)}
                {resultado.dicasUsadas > 0 ? ` usando ${resultado.dicasUsadas} ${resultado.dicasUsadas === 1 ? 'dica' : 'dicas'}` : ' sem usar dicas'}!
              </p>
              <BarraXp ganho={resultado.ganhoXp} />
              <div className='sudoku-toolbar'>
                <button type='button' className='global-button sudoku-jogar' onClick={() => iniciarJogo(resultado.modo.id)}>
                  🔁 Jogar de novo
                </button>
                <button type='button' className='global-button global-button--basic' onClick={mudarNivel}>
                  Mudar nível
                </button>
                <CompartilharResultado
                  className='global-button global-button--basic'
                  resultado={{
                    jogo: 'Sudoku',
                    linhas: ['Completei um Sudoku!', `🔢 ${resultado.modo.nome}`, `⏱️ Tempo: ${formatarTempo(resultado.segundos)}`, `💡 Dicas: ${resultado.dicasUsadas}`],
                    convite: `Você consegue resolver? ${window.location.origin || 'https://www.tabuadadivertida.com'}/jogos/sudoku`,
                    resumo: `${resultado.modo.nome} em ${formatarTempo(resultado.segundos)}`,
                    conquistas: resultado.conquistas,
                  }}
                />
                <Link to='/#jogos' className='global-button global-button--back'>
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

export default Sudoku;
