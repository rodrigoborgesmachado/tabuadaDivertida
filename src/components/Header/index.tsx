import ThemeSwitcher from '../ThemeSwitcher/themeSwitcher';
import './style.css';
import { useEffect, useState } from 'react';
import configData from '../../Config.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeHigh, faVolumeXmark } from '@fortawesome/free-solid-svg-icons';
import robo from '../../assets/robot-happy.svg';
import { NavLink, useLocation } from 'react-router-dom';

interface HeaderProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

function Header({ theme, toggleTheme }: HeaderProps){
    const [muted, setMuted] = useState<boolean>(false);
    const location = useLocation();

    useEffect(() => {
        try {
            const init = localStorage.getItem(configData.SOUND_MUTED);
            setMuted(init === '1');
        } catch {}
    }, []);

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

                <div className='site-right'>
                    <nav className='site-nav' aria-label='Navegacao principal'>
                        <NavLink to='/ranking' className={`nav-item ${isRankingActive ? 'active' : ''}`}>
                            Ranking
                        </NavLink>
                        <NavLink to='/artigos' className={`nav-item ${isArtigosActive ? 'active' : ''}`}>
                            Artigos
                        </NavLink>
                        <NavLink to='/artigos/tabuada' className={`nav-item ${isTabuadaActive ? 'active' : ''}`}>
                            Tabuada
                        </NavLink>
                        <NavLink to='/resultados' className={`nav-item ${isResultadosActive ? 'active' : ''}`}>
                            Resultados
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
        </header>
    )
}

export default Header;
