import ThemeSwitcher from '../ThemeSwitcher/themeSwitcher';
import './style.css';

interface HeaderProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

function Header({ theme, toggleTheme }: HeaderProps){
    return(
        <header className='conNav'>
            <div className='toolNav'>
                <a className='logo option-link' href='/'>Tabuada Divertida</a>
                <div className='opcoes-head'>
                    <a className='ranking option-link' href='/ranking'>🔝Ranking🔝</a>
                    <a className='ranking option-link' href='/historico'>🔝Histórico🔝</a>
                    <a className='ranking option-link' href='/artigos'>🧠Artigos🧠</a>
                    <a className='ranking option-link' href='/artigos/tabuada'>📘Tabuada📘</a>
                    <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
                </div>
            </div>
        </header>
    )
}

export default Header;