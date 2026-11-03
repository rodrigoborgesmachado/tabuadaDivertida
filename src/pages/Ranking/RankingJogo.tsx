import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import PacmanLoader from '../../components/PacmanLoader/PacmanLoader';
import { buscarRanking, normalizarNome, type ItemRanking } from '../../services/resultadosJogos';
import type { JogoRanking } from './rankingConfig';

interface RankingJogoProps {
  jogo: JogoRanking;
  modo: string | null;
  filtroNome: string;
  nomeJogador: string;
}

type Status = 'carregando' | 'ok' | 'erro';

const MEDALHAS = ['🥇', '🥈', '🥉'];

function RankingJogo({ jogo, modo, filtroNome, nomeJogador }: RankingJogoProps) {
  const [lista, setLista] = useState<ItemRanking[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<Status>('carregando');
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;
    setStatus('carregando');

    buscarRanking(jogo.id, modo)
      .then((resultado) => {
        if (ativo) {
          setLista(resultado.lista);
          setTotal(resultado.total);
          setStatus('ok');
        }
      })
      .catch(() => {
        if (ativo) {
          setStatus('erro');
        }
      });

    return () => {
      ativo = false;
    };
  }, [jogo.id, modo, tentativa]);

  if (status === 'carregando') {
    return <PacmanLoader />;
  }

  if (status === 'erro') {
    return (
      <div className='ranking-mensagem' role='alert'>
        <p>😕 Não foi possível carregar o ranking agora. Tente novamente em instantes.</p>
        <button type='button' className='global-button' onClick={() => setTentativa((atual) => atual + 1)}>
          Tentar novamente
        </button>
      </div>
    );
  }

  const filtro = filtroNome.toLowerCase();
  const jogador = normalizarNome(nomeJogador).toLowerCase();
  const visiveis = lista
    .map((item, indice) => ({ item, posicao: indice + 1 }))
    .filter(({ item }) => item.nome.toLowerCase().includes(filtro));

  return (
    <div className='rankingMultiplicacao'>
      <h3>🔥Total de partidas: {total}🔥</h3>
      <br/>
      {lista.length === 0 ? (
        <div className='ranking-mensagem'>
          <p>Ainda não há resultados neste ranking. Jogue e seja o primeiro!</p>
          <Link to={jogo.path} className='global-button'>
            Jogar {jogo.nome}
          </Link>
        </div>
      ) : visiveis.length === 0 ? (
        <p className='ranking-mensagem'>Nenhum jogador encontrado com esse nome.</p>
      ) : (
        <Table className='tableRanking'>
          <thead>
            <tr>
              <th><h4>Posição</h4></th>
              <th><h4>Nome</h4></th>
              {jogo.colunas.map((coluna) => (
                <th key={coluna.titulo}><h4>{coluna.titulo}</h4></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visiveis.map(({ item, posicao }) => (
              <tr key={posicao} className={jogador && normalizarNome(item.nome).toLowerCase() === jogador ? 'posicao' : ''}>
                <td data-label='Posição'>{MEDALHAS[posicao - 1] || posicao}</td>
                <td data-label='Nome'>{posicao === 1 && <>🏆</>}{item.nome}</td>
                {jogo.colunas.map((coluna) => (
                  <td key={coluna.titulo} data-label={coluna.titulo}>{coluna.valor(item)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

export default RankingJogo;
