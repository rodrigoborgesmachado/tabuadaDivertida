import './style.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faGear, faXmark } from '@fortawesome/free-solid-svg-icons';
import robo from '../../assets/robot-happy.svg';
import { NavLink, useLocation } from 'react-router-dom';
import { useRecompensasNaoVistas } from '../../gamificacao/useRecompensasNaoVistas';
import RoboPersonalizado from '../RoboPersonalizado/RoboPersonalizado';
import PerfilJogador from '../PerfilJogador/PerfilJogador';
import { marcarPerfilVisto, perfilVisto, useJogador } from '../../services/jogador';

function Header(){
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const toggleRef = useRef<HTMLButtonElement>(null);
    const wasMenuOpen = useRef<boolean>(false);
    const location = useLocation();
    const recompensasNovas = useRecompensasNaoVistas().length;
    const { nome } = useJogador();
    const [perfil, setPerfil] = useState<'perfil' | 'primeira-visita' | null>(null);

    useEffect(() => {
        if (!perfilVisto()) {
            marcarPerfilVisto();
            setPerfil('primeira-visita');
        }
    }, []);

    useEffect(() => {
        if (!menuOpen) {
            if (wasMenuOpen.current) {
                toggleRef.current?.focus();
            }
            wasMenuOpen.current = false;
            return;
        }

        wasMenuOpen.current = true;
        document.body.style.overflow = 'hidden';
        menuRef.current?.querySelector<HTMLElement>('.nav-item')?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setMenuOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [menuOpen]);

    const closeMenu = () => setMenuOpen(false);

    const abrirPerfil = () => {
        wasMenuOpen.current = false;
        setMenuOpen(false);
        setPerfil('perfil');
    };

    const fecharPerfil = useCallback(() => setPerfil(null), []);

    const isRankingActive = location.pathname.startsWith('/ranking');
    const isProgressoActive = location.pathname.startsWith('/progresso') || location.pathname === '/historico';
    const isPersonalizarActive = location.pathname.startsWith('/personalizar');
    const isTabuadaActive = location.pathname === '/artigos/tabuada';
    const isArtigosActive = location.pathname.startsWith('/artigos') && !isTabuadaActive;

    return(
        <header className='site-header'>
            <div className='site-header-content'>
                <NavLink to='/' className='brand'>
                    <span className='brand-badge' aria-hidden='true'>
                        <img src={robo} alt='' />
                    </span>
                    <span>
                        <strong>Tabuada Divertida</strong>
                        <small>Aprenda brincando com numeros</small>
                    </span>
                </NavLink>

                <button
                    ref={toggleRef}
                    className='button-base menu-toggle'
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-expanded={menuOpen}
                    aria-controls='site-menu'
                    aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
                >
                    <FontAwesomeIcon icon={menuOpen ? faXmark : faBars} />
                    {recompensasNovas > 0 && !menuOpen && <span className='nav-item__novo' aria-hidden='true'>{recompensasNovas}</span>}
                </button>

                <div id='site-menu' ref={menuRef} className={`site-right ${menuOpen ? 'open' : ''}`}>
                    <nav className='site-nav' aria-label='Navegacao principal'>
                        <NavLink to='/ranking' onClick={closeMenu} className={`nav-item ${isRankingActive ? 'active' : ''}`}>
                            Ranking
                        </NavLink>
                        <NavLink to='/progresso' onClick={closeMenu} className={`nav-item ${isProgressoActive ? 'active' : ''}`}>
                            Meu progresso
                        </NavLink>
                        <NavLink to='/artigos/tabuada' onClick={closeMenu} className={`nav-item ${isTabuadaActive ? 'active' : ''}`}>
                            Tabuada
                        </NavLink>
                        <NavLink to='/artigos' onClick={closeMenu} className={`nav-item ${isArtigosActive ? 'active' : ''}`}>
                            Artigos
                        </NavLink>
                    </nav>

                    <div className='site-controls'>
                        <button
                            type='button'
                            onClick={abrirPerfil}
                            className={`button-base personalizar-toggle ${isPersonalizarActive ? 'active' : ''}`}
                            aria-label={`Meu perfil e configurações: ${nome || 'Jogador'}${recompensasNovas > 0 ? `, ${recompensasNovas} ${recompensasNovas === 1 ? 'item novo' : 'itens novos'}` : ''}`}
                            title='Meu perfil e configurações'
                        >
                            <RoboPersonalizado titulo='' className='personalizar-toggle__robo' />
                            <span className='personalizar-toggle__texto'>{nome || 'Jogador'}</span>
                            <FontAwesomeIcon icon={faGear} className='personalizar-toggle__engrenagem' />
                            {recompensasNovas > 0 && <span className='nav-item__novo' aria-hidden='true'>{recompensasNovas}</span>}
                        </button>
                    </div>
                </div>
            </div>
            {menuOpen && <div className='site-menu-backdrop' onClick={closeMenu} aria-hidden='true' />}
            {perfil !== null && <PerfilJogador primeiraVisita={perfil === 'primeira-visita'} onFechar={fecharPerfil} />}
        </header>
    )
}

export default Header;
