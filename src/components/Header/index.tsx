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
                <Link className='logo' to='/'>Tabuada Divertida</Link>
                <div className='opcoes-head'>
                    <Link className='ranking' to='/ranking'>🔝Ranking🔝</Link>
                    <Link className='ranking' to='/historico'>🔝Histórico🔝</Link>
                    <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
                </div>
            </div>
        </header>
    )
}

export default Header;