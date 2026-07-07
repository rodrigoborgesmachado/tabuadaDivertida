import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { addRandomTile, createInitialBoard, hasNoMoves, moveBoard, type Board, type Direction } from './logic';
import './Jogo2048.css';

interface HistoryEntry {
  board: Board;
  score: number;
}

interface PersistedState {
  board: Board;
  score: number;
  history: HistoryEntry[];
}

const STORAGE_KEY = 'tabuada-divertida-2048-state';
const WIN_SHOWN_KEY = 'tabuada-divertida-2048-win-shown';

const readWinShown = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.sessionStorage.getItem(WIN_SHOWN_KEY) === '1';
};

const markWinShown = () => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(WIN_SHOWN_KEY, '1');
};

const launchFireworks = () => {
  const confetti = (window as any).confetti;
  if (!confetti) {
    return;
  }

  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval = window.setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return window.clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);
};

const buildEmptyState = (): PersistedState => ({
  board: createInitialBoard(),
  score: 0,
  history: [],
});

const readStoredState = (): PersistedState => {
  if (typeof window === 'undefined') {
    return buildEmptyState();
  }

  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return buildEmptyState();
    }

    const parsed = JSON.parse(stored) as Partial<PersistedState>;
    return {
      board: Array.isArray(parsed.board) ? parsed.board : createInitialBoard(),
      score: typeof parsed.score === 'number' ? parsed.score : 0,
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    return buildEmptyState();
  }
};

function Jogo2048() {
  const initialState = readStoredState();
  const [board, setBoard] = useState<Board>(initialState.board);
  const [score, setScore] = useState(initialState.score);
  const [history, setHistory] = useState<HistoryEntry[]>(initialState.history);
  const [showWinModal, setShowWinModal] = useState(false);
  const [winShown, setWinShown] = useState<boolean>(() => readWinShown());
  const scoreRef = useRef(score);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const persistState = useCallback((nextBoard: Board, nextScore: number, nextHistory: HistoryEntry[]) => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ board: nextBoard, score: nextScore, history: nextHistory }));
    }
  }, []);

  useEffect(() => {
    persistState(board, score, history);
  }, [board, history, persistState, score]);

  const handleMove = useCallback((direction: Direction) => {
    setBoard((currentBoard) => {
      const previousBoard = currentBoard.map((row) => [...row]);
      const previousScore = scoreRef.current;
      const result = moveBoard(currentBoard, direction);

      if (!result.moved) {
        toast.warn('Essa direção não ajudou. Tente outra!');
        return currentBoard;
      }

      const nextBoard = addRandomTile(result.board);
      const nextScore = previousScore + result.scoreDelta;
      const reached2048 = nextBoard.some((row) => row.includes(2048));

      setScore(nextScore);
      setHistory((prev) => [...prev, { board: previousBoard, score: previousScore }].slice(-50));

      if (reached2048) {
        if (!winShown) {
          launchFireworks();
          setShowWinModal(true);
          setWinShown(true);
          markWinShown();
          toast.success('🎉 Você chegou ao 2048! Que incrível!');
        }
      }

      if (hasNoMoves(nextBoard)) {
        toast.warn('😅 Sem movimentos possíveis. Que tal um novo jogo?');
      }

      return nextBoard;
    });
  }, [winShown]);

  const handleUndo = () => {
    if (history.length === 0) {
      toast.info('Ainda não há movimentos para desfazer.');
      return;
    }

    const previousState = history[history.length - 1];
    setBoard(previousState.board.map((row) => [...row]));
    setScore(previousState.score);
    setHistory((prev) => prev.slice(0, -1));
    toast.info('Um passo para trás!');
  };

  const handleRestart = () => {
    const freshBoard = createInitialBoard();
    setBoard(freshBoard);
    setScore(0);
    setHistory([]);
    setShowWinModal(false);
    toast.info('Nova partida! Vamos de novo!');
    persistState(freshBoard, 0, []);
  };

  const handleContinuePlaying = () => {
    setShowWinModal(false);
    toast.info('Continue a aventura!');
  };

  const handleFinishGame = () => {
    setShowWinModal(false);
    toast.info('Fim da partida!');
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const directionMap: Record<string, Direction> = {
        ArrowLeft: 'left',
        ArrowRight: 'right',
        ArrowUp: 'up',
        ArrowDown: 'down',
      };

      const direction = directionMap[event.key];
      if (direction) {
        event.preventDefault();
        handleMove(direction);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleMove]);

  return (
    <div className='center'>
      <div className='global-pageContainer-left options-preview game2048-page'>
        <div className='game2048-card'>
          <div className='game2048-header'>
            <div>
              <h2 className='paragrafo2'>🎲 2048</h2>
              <p className='paragrafo3'>Combine os números, crie blocos maiores e veja quanto você consegue marcar!</p>
            </div>
            <div className='game2048-badges'>
              <span className='game2048-badge'>⭐ Pontos: {score}</span>
              <span className='game2048-badge'>↩️ Desfazer: {history.length > 0 ? 'sim' : 'não'}</span>
            </div>
          </div>

          <div className='game2048-actions'>
            <button type='button' className='global-button global-button--full-width' onClick={() => handleMove('left')}>
              ← Mover
            </button>
            <button type='button' className='global-button global-button--full-width' onClick={() => handleMove('up')}>
              ↑ Subir
            </button>
            <button type='button' className='global-button global-button--full-width' onClick={() => handleMove('down')}>
              ↓ Descer
            </button>
            <button type='button' className='global-button global-button--full-width' onClick={() => handleMove('right')}>
              → Mover
            </button>
          </div>

          <div className='game2048-toolbar'>
            <button type='button' className='global-button global-button--basic' onClick={handleUndo}>
              Desfazer um passo
            </button>
            <button type='button' className='global-button global-button--transparent' onClick={handleRestart}>
              Novo jogo
            </button>
            <Link to='/' className='global-button global-button--back'>
              Voltar ao início
            </Link>
          </div>

          <div className='game2048-board-total'>
            <div className='game2048-board' aria-label='Tabuleiro do jogo 2048'>
                {board.map((row, rowIndex) => (
                <div key={`row-${rowIndex}`} className='game2048-row'>
                    {row.map((value, colIndex) => (
                    <div key={`${rowIndex}-${colIndex}`} className={`game2048-tile game2048-tile--${value || 'empty'}`}>
                        {value > 0 ? value : ''}
                    </div>
                    ))}
                </div>
                ))}
            </div>
          </div>

          {showWinModal && (
            <div className='game2048-win-modal' role='dialog' aria-modal='true'>
              <div className='game2048-win-modal__content'>
                <h3>🎉 Você chegou ao 2048!</h3>
                <p>Que jogada incrível! Deseja continuar brincando ou finalizar por aqui?</p>
                <div className='game2048-win-modal__actions'>
                  <button type='button' className='global-button' onClick={handleContinuePlaying}>
                    Continuar
                  </button>
                  <button type='button' className='global-button global-button--back' onClick={handleFinishGame}>
                    Finalizar
                  </button>
                </div>
              </div>
            </div>
          )}

          <p className='game2048-help'>Dica: use as setas do teclado ou os botões acima. A cada movimento, um novo bloco aparece e você pode desfazer o último passo quantas vezes quiser.</p>
        </div>
      </div>
    </div>
  );
}

export default Jogo2048;
