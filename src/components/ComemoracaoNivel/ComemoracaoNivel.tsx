import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { EVENTO_NIVEL, type NivelAlcancado } from '../../gamificacao/progresso';
import { recompensasDoNivel } from '../../gamificacao/recompensas';
import { estrelasDoNivel, faixaDoNivel } from '../../gamificacao/xp';
import { playConquista } from '../../services/sons';
import RoboPersonalizado from '../RoboPersonalizado/RoboPersonalizado';
import './ComemoracaoNivel.css';

const CORES_CONFETE = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#b07cff'];
const CONFETES = Array.from({ length: 30 }, (_, indice) => indice);

function ComemoracaoNivel() {
  const [nivel, setNivel] = useState<NivelAlcancado | null>(null);
  const continuar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onNivel = (event: Event) => {
      const alcancado = (event as CustomEvent<NivelAlcancado>).detail;
      setNivel((atual) => (atual ? { ...alcancado, nivelAnterior: Math.min(atual.nivelAnterior, alcancado.nivelAnterior) } : alcancado));
      playConquista();
    };

    window.addEventListener(EVENTO_NIVEL, onNivel);
    return () => window.removeEventListener(EVENTO_NIVEL, onNivel);
  }, []);

  const aberta = nivel !== null;

  useEffect(() => {
    if (!aberta) {
      return;
    }

    continuar.current?.focus();
    const onTecla = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setNivel(null);
      }
    };

    window.addEventListener('keydown', onTecla);
    return () => window.removeEventListener('keydown', onTecla);
  }, [aberta]);

  if (!nivel) {
    return null;
  }

  const fechar = () => setNivel(null);
  const faixa = faixaDoNivel(nivel.nivel);
  const novaFaixa = faixa.id !== faixaDoNivel(nivel.nivelAnterior).id;
  const estrelas = estrelasDoNivel(nivel.nivel);
  const novaEstrela = estrelas > estrelasDoNivel(nivel.nivelAnterior);
  const liberadas = recompensasDoNivel(nivel.nivelAnterior, nivel.nivel);

  return (
    <div className={`comemoracao-nivel comemoracao-nivel--${faixa.id}`} role='dialog' aria-modal='true' aria-labelledby='comemoracao-nivel-titulo'>
      <div className='comemoracao-nivel__confetes' aria-hidden='true'>
        {CONFETES.map((indice) => (
          <span
            key={indice}
            style={{ left: `${(indice * 37) % 100}%`, background: CORES_CONFETE[indice % CORES_CONFETE.length], animationDelay: `${(indice % 6) * 0.2}s` }}
          />
        ))}
      </div>
      <div className='comemoracao-nivel__conteudo'>
        <RoboPersonalizado titulo='' className='comemoracao-nivel__robo' bichinho dancando />
        <h2 id='comemoracao-nivel-titulo'>Subiu de nível!</h2>
        <span className='comemoracao-nivel__selo' aria-hidden='true'>{nivel.nivel}</span>
        <p className='comemoracao-nivel__titulo'>Nível {nivel.nivel} · {nivel.titulo}</p>
        {novaFaixa && <p className='comemoracao-nivel__destaque'>🏅 Nova faixa: {faixa.nome}!</p>}
        {novaEstrela && <p className='comemoracao-nivel__destaque'>⭐ Nova estrela de lenda! Agora são {estrelas}.</p>}
        {liberadas.length > 0 && (
          <section className='comemoracao-nivel__recompensas'>
            <h3>Liberado agora</h3>
            <ul>
              {liberadas.map((recompensa) => (
                <li key={recompensa.id}>
                  <span
                    className={`comemoracao-nivel__icone${recompensa.animada ? ' comemoracao-nivel__icone--animada' : ''}`}
                    style={recompensa.tipo === 'cor' ? { background: recompensa.degrade ? `linear-gradient(135deg, ${recompensa.degrade.join(', ')})` : recompensa.valor } : undefined}
                    aria-hidden='true'
                  >
                    {recompensa.tipo === 'cor' ? '' : recompensa.icone}
                  </span>
                  {recompensa.nome}
                </li>
              ))}
            </ul>
          </section>
        )}
        <div className='comemoracao-nivel__botoes'>
          {liberadas.length > 0 && (
            <Link to='/personalizar' className='global-button global-button--basic' onClick={fechar}>
              🎨 Personalizar robô
            </Link>
          )}
          <button ref={continuar} type='button' className='global-button' onClick={fechar}>
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ComemoracaoNivel;
