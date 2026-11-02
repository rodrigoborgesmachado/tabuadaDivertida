import ThemeSwitcher from '../ThemeSwitcher/themeSwitcher';
import './style.css';
import { useEffect, useRef, useState } from 'react';
import configData from '../../Config.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faVolumeHigh, faVolumeXmark, faXmark } from '@fortawesome/free-solid-svg-icons';
import robo from '../../assets/robot-happy.svg';
import { NavLink, useLocation } from 'react-router-dom';
import { isJogoPath } from '../../pages/Jogos/jogosConfig';

interface HeaderProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

function Header({ theme, toggleTheme }: HeaderProps){
    const [muted, setMuted] = useState<boolean>(false);
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const toggleRef = useRef<HTMLButtonElement>(null);
    const wasMenuOpen = useRef<boolean>(false);
    const location = useLocation();

    useEffect(() => {
        try {
            const init = localStorage.getItem(configData.SOUND_MUTED);
            setMuted(init === '1');
        } catch {}
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

    const toggleMute = () => {
        const next = !muted;
        setMuted(next);
        try {
            localStorage.setItem(configData.SOUND_MUTED, next ? '1' : '0');
            window.dispatchEvent(new Event('sound-setting-changed'));
        } catch {}
    };

    const isRankingActive = location.pathname.startsWith('/ranking');
    const isResultadosActive = location.pathname.startsWith('/resultados');
    const isJogosActive = location.pathname === '/jogos' || isJogoPath(location.pathname);
    const isConquistasActive = location.pathname.startsWith('/conquistas');
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
                </button>

                <div id='site-menu' ref={menuRef} className={`site-right ${menuOpen ? 'open' : ''}`}>
                    <nav className='site-nav' aria-label='Navegacao principal'>
                        <NavLink to='/ranking' onClick={closeMenu} className={`nav-item ${isRankingActive ? 'active' : ''}`}>
                            Ranking
                        </NavLink>
                        <NavLink to='/artigos' onClick={closeMenu} className={`nav-item ${isArtigosActive ? 'active' : ''}`}>
                            Artigos
                        </NavLink>
                        <NavLink to='/artigos/tabuada' onClick={closeMenu} className={`nav-item ${isTabuadaActive ? 'active' : ''}`}>
                            Tabuada
                        </NavLink>
                        <NavLink to='/resultados' onClick={closeMenu} className={`nav-item ${isResultadosActive ? 'active' : ''}`}>
                            Resultados
                        </NavLink>
                        <NavLink to='/jogos' onClick={closeMenu} className={`nav-item ${isJogosActive ? 'active' : ''}`}>
                            Jogos
                        </NavLink>
                        <NavLink to='/conquistas' onClick={closeMenu} className={`nav-item ${isConquistasActive ? 'active' : ''}`}>
                            Conquistas
                        </NavLink>
                    </nav>

                    <div className='site-controls'>
                        <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
                        <button
                            className='button-base sound-toggle'
                            onClick={toggleMute}
                            aria-label={muted ? 'Ativar som' : 'Silenciar som'}
                            title={muted ? 'Ativar som' : 'Silenciar som'}
                        >
                            <FontAwesomeIcon icon={muted ? faVolumeXmark : faVolumeHigh} style={{ color: 'var(--text-color-primary)', fontSize: '16px' }} />
                        </button>
                    </div>
                </div>
            </div>
            {menuOpen && <div className='site-menu-backdrop' onClick={closeMenu} aria-hidden='true' />}
        </header>
    )
}

export default Header;
