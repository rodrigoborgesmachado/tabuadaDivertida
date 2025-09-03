import './themeSwitcher.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

interface HeaderProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

const ThemeSwitcher = ({ theme, toggleTheme }: HeaderProps) => {
    return (
        <div className="change-theme-div">
            <input
                type="radio"
                id="light"
                name="theme"
                value="light"
                checked={theme === 'light'}
                onChange={toggleTheme}
            />
            <label htmlFor="light" className="theme-label">
                <FontAwesomeIcon icon={faSun} className="icon sun" />
            </label>

            <input
                type="radio"
                id="dark"
                name="theme"
                value="dark"
                checked={theme === 'dark'}
                onChange={toggleTheme}
            />
            <label htmlFor="dark" className="theme-label">
                <FontAwesomeIcon icon={faMoon} className="icon moon" />
            </label>
        </div>
    );
};

export default ThemeSwitcher;
