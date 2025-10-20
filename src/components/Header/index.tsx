import ThemeSwitcher from '../ThemeSwitcher/themeSwitcher';
import './style.css';
import { useEffect, useState } from 'react';
import configData from '../../Config.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeHigh, faVolumeXmark } from '@fortawesome/free-solid-svg-icons';

interface HeaderProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

function Header({ theme, toggleTheme }: HeaderProps){
    const [muted, setMuted] = useState<boolean>(false);

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

    return(
        <header className='conNav navbar'>
            <div className='toolNav'>
                <a className='logo option-link' href='/'>Tabuada Divertida</a>
                <div className='opcoes-head'>
                    <a className='ranking option-link' href='/ranking'>🔝Ranking🔝</a>
                    <a className='ranking option-link' href='/historico'>🔝Histórico🔝</a>
                    <a className='ranking option-link' href='/artigos'>🧠Artigos🧠</a>
                    <a className='ranking option-link' href='/artigos/tabuada'>📘Tabuada📘</a>
                    <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
                    <button
                        className='button-base'
                        onClick={toggleMute}
                        aria-label={muted ? 'Ativar som' : 'Silenciar som'}
                        title={muted ? 'Ativar som' : 'Silenciar som'}
                        style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <FontAwesomeIcon icon={muted ? faVolumeXmark : faVolumeHigh} style={{ color: theme === 'light' ? '#000' : '#FFF', fontSize: '16px' }} />
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header;
