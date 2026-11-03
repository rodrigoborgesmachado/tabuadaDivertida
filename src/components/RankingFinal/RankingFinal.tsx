import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import configData from '../../Config.json';
import { buscarRanking, enviarResultado, normalizarNome, posicaoNoRanking, TOP_RANKING, type DadosResultado, type JogoComRanking } from '../../services/resultadosJogos';
import './RankingFinal.css';

interface RankingFinalProps {
  jogo: JogoComRanking;
  modo: string | null;
  resultado: DadosResultado;
}

type Status = 'nome' | 'enviando' | 'enviado' | 'erro' | 'fora';

const lerNome = () => normalizarNome(localStorage.getItem(configData.NOME_PARAM) || '');

function RankingFinal({ jogo, modo, resultado }: RankingFinalProps) {
  const [nome, setNome] = useState('');
  const [status, setStatus] = useState<Status>(() => (lerNome() ? 'enviando' : 'nome'));
  const [posicao, setPosicao] = useState<number | null>(null);
  const enviadoRef = useRef(false);
  const resultadoRef = useRef(resultado);

  const enviar = useCallback(async (nomeJogador: string) => {
    if (enviadoRef.current) {
      return;
    }

    enviadoRef.current = true;
    setStatus('enviando');

    if (!await enviarResultado(jogo, modo, resultadoRef.current, nomeJogador)) {
      setStatus('erro');
      return;
    }

    try {
      const { lista } = await buscarRanking(jogo, modo);
      setPosicao(posicaoNoRanking(lista, nomeJogador));
    } catch {}
    setStatus('enviado');
  }, [jogo, modo]);

  useEffect(() => {
    const nomeSalvo = lerNome();
    if (nomeSalvo) {
      enviar(nomeSalvo);
    }
  }, [enviar]);

  const confirmarNome = () => {
    const nomeJogador = normalizarNome(nome);
    if (!nomeJogador) {
      return;
    }

    localStorage.setItem(configData.NOME_PARAM, nomeJogador);
    enviar(nomeJogador);
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
        {status === 'erro' && 'Não foi possível enviar seu resultado ao ranking agora.'}
        {status === 'fora' && 'Tudo bem! Este resultado não vai para o ranking.'}
      </p>
      <Link to={link} className='global-button global-button--basic'>
        🏆 Ver ranking
      </Link>
    </div>
  );
}

export default RankingFinal;
