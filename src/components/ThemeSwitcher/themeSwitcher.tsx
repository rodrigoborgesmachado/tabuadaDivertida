import './themeSwitcher.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faPalette } from '@fortawesome/free-solid-svg-icons';
import { lerProgresso } from '../../gamificacao/progresso';
import { buscarRecompensa, recompensaLiberada, recompensas, salvarPersonalizacao } from '../../gamificacao/recompensas';
import { usePersonalizacao } from '../../gamificacao/usePersonalizacao';

interface HeaderProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

const ThemeSwitcher = ({ theme, toggleTheme }: HeaderProps) => {
    const personalizacao = usePersonalizacao();
    const progresso = lerProgresso();
    const temas = recompensas.filter((recompensa) => recompensa.tipo === 'tema' && recompensaLiberada(recompensa, progresso));
    const temaAtual = buscarRecompensa(personalizacao.tema);

    const trocarTema = () => {
        const proximo = temas[(temas.findIndex((tema) => tema.id === personalizacao.tema) + 1) % temas.length];
        salvarPersonalizacao({ ...personalizacao, tema: proximo.id });
    };

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

            {temas.length > 1 && (
                <button
                    type="button"
                    className="theme-label theme-color"
                    onClick={trocarTema}
                    aria-label={`Tema de cores: ${temaAtual?.nome}. Trocar tema`}
                    title={`Tema de cores: ${temaAtual?.nome}`}
                >
                    <FontAwesomeIcon icon={faPalette} className="icon" />
                </button>
            )}
        </div>
    );
};

export default ThemeSwitcher;
