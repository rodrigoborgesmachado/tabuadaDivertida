import ThemeSwitcher from '../ThemeSwitcher/themeSwitcher';
import './style.css';
import { Link } from 'react-router-dom';

interface HeaderProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

function Header({ theme, toggleTheme }: HeaderProps){
    return(
        <header className='conNav'>
            <div className='toolNav'>
                <Link className='logo option-link' to='/'>Tabuada Divertida</Link>
                <div className='opcoes-head'>
                    <Link className='ranking option-link' to='/ranking'>🔝Ranking🔝</Link>
                    <Link className='ranking option-link' to='/historico'>🔝Histórico🔝</Link>
                    <Link className='ranking option-link' to='/artigos/aprender-matematica-com-jogos'>🧠Artigos🧠</Link>
                    <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
                </div>
            </div>
        </header>
    )
}

export default Header;