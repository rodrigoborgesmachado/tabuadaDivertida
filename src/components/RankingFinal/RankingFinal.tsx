import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { lerNome, salvarNome } from '../../services/jogador';
import { buscarRanking, enviarResultado, informarNome, normalizarNome, posicaoNoRanking, TOP_RANKING, type DadosResultado, type JogoComRanking } from '../../services/resultadosJogos';
import { semConexao } from '../../services/plataforma';
import './RankingFinal.css';

interface RankingFinalProps {
  jogo: JogoComRanking;
  modo: string | null;
  resultado: DadosResultado;
}

type Status = 'nome' | 'enviando' | 'enviado' | 'erro' | 'fora';

function RankingFinal({ jogo, modo, resultado }: RankingFinalProps) {
  const [nome, setNome] = useState('');
  const [status, setStatus] = useState<Status>(() => (lerNome() ? 'enviando' : 'nome'));
  const [posicao, setPosicao] = useState<number | null>(null);
  const envioRef = useRef<Promise<number | null> | null>(null);
  const resultadoRef = useRef(resultado);

  const enviar = useCallback(() => {
    if (!envioRef.current) {
      envioRef.current = enviarResultado(jogo, modo, resultadoRef.current, lerNome());
    }

    return envioRef.current;
  }, [jogo, modo]);

  const mostrarPosicao = useCallback(async (nomeJogador: string) => {
    try {
      const { lista } = await buscarRanking(jogo, modo);
      setPosicao(posicaoNoRanking(lista, nomeJogador));
    } catch {}
    setStatus('enviado');
  }, [jogo, modo]);

  useEffect(() => {
    const nomeSalvo = lerNome();
    enviar().then((codigo) => {
      if (!nomeSalvo) {
        return;
      }

      if (codigo === null) {
        setStatus('erro');
        return;
      }

      mostrarPosicao(nomeSalvo);
    });
  }, [enviar, mostrarPosicao]);

  const confirmarNome = async () => {
    const nomeJogador = normalizarNome(nome);
    if (!nomeJogador) {
      return;
    }

    salvarNome(nomeJogador);
    setStatus('enviando');

    const codigo = await enviar();
    const salvo = codigo === null
      ? await enviarResultado(jogo, modo, resultadoRef.current, nomeJogador) !== null
      : await informarNome(codigo, nomeJogador);

    if (!salvo) {
      setStatus('erro');
      return;
    }

    mostrarPosicao(nomeJogador);
  };

  const link = `/ranking?jogo=${jogo}${modo ? `&modo=${modo}` : ''}`;

  return (
    <div className='ranking-final'>
      {status === 'nome' && (
        <form className='ranking-final__nome' onSubmit={(event) => { event.preventDefault(); confirmarNome(); }}>
          <label htmlFor={`ranking-final-nome-${jogo}`}>Quer entrar no ranking? Digite seu nome:</label>
          <input
            id={`ranking-final-nome-${jogo}`}
            type='text'
            className='global-input'
            value={nome}
            maxLength={15}
            onChange={(event) => setNome(event.target.value)}
          />
          <div className='ranking-final__acoes'>
            <button type='submit' className='global-button' disabled={!normalizarNome(nome)}>
              Entrar no ranking
            </button>
            <button type='button' className='global-button global-button--basic' onClick={() => setStatus('fora')}>
              Não participar
            </button>
          </div>
        </form>
      )}
      <p className='ranking-final__status' aria-live='polite'>
        {status === 'enviando' && 'Enviando seu resultado para o ranking...'}
        {status === 'enviado' && (posicao ? `🏆 Você está em ${posicao}º lugar no ranking!` : `Resultado enviado! Continue jogando para entrar no top ${TOP_RANKING}.`)}
        {status === 'erro' && (semConexao() ? '📡 Você está sem internet, então seu resultado não foi para o ranking.' : 'Não foi possível enviar seu resultado ao ranking agora.')}
        {status === 'fora' && 'Tudo bem! Este resultado não vai aparecer no ranking.'}
      </p>
      <Link to={link} className='global-button global-button--basic'>
        🏆 Ver ranking
      </Link>
    </div>
  );
}

export default RankingFinal;
