import { Link } from 'react-router-dom';
import { jogos } from './jogosConfig';
import { abasRanking } from '../Ranking/rankingConfig';
import './Jogos.css';

function Jogos() {
  return (
    <div className='center'>
      <div className='global-pageContainer-left options-preview jogos-page'>
        <h1 className='paragrafo2'>🎮 Jogos</h1>
        <p className='paragrafo3'>Escolha um jogo e pratique matemática brincando!</p>
        <div className='jogos-grid'>
          {jogos.map((jogo) => (
            <div key={jogo.path} className='jogos-item'>
              <Link to={jogo.path} className='jogos-card'>
                <span className='jogos-card-icon' aria-hidden='true'>{jogo.icone}</span>
                <h2>{jogo.nome}</h2>
                <p>{jogo.descricao}</p>
                <div className='jogos-card-tags'>
                  <span className='jogos-card-tag'>🧠 {jogo.habilidade}</span>
                  <span className='jogos-card-tag'>👦 {jogo.idade}</span>
                </div>
              </Link>
              {abasRanking.some((aba) => aba.id === jogo.id) && (
                <Link to={`/ranking?jogo=${jogo.id}`} className='global-button global-button--basic jogos-ranking'>
                  🏆 Ranking de {jogo.nome}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Jogos;
