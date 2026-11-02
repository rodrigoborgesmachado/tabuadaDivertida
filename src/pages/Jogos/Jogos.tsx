import { Link } from 'react-router-dom';
import { jogos } from './jogosConfig';
import './Jogos.css';

function Jogos() {
  return (
    <div className='center'>
      <div className='global-pageContainer-left options-preview jogos-page'>
        <h1 className='paragrafo2'>🎮 Jogos</h1>
        <p className='paragrafo3'>Escolha um jogo e pratique matemática brincando!</p>
        <div className='jogos-grid'>
          {jogos.map((jogo) => (
            <Link key={jogo.path} to={jogo.path} className='jogos-card'>
              <span className='jogos-card-icon' aria-hidden='true'>{jogo.icone}</span>
              <h2>{jogo.nome}</h2>
              <p>{jogo.descricao}</p>
              <div className='jogos-card-tags'>
                <span className='jogos-card-tag'>🧠 {jogo.habilidade}</span>
                <span className='jogos-card-tag'>👦 {jogo.idade}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Jogos;
