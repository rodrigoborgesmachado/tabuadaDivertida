import './style.css';
import {Link} from 'react-router-dom';

function Header(){
    return(
        <header className='conNav'>
            <div disableGutters className='toolNav'>
                <Link className='logo' to='/'>Tabuada Divertida</Link>
                <Link className='ranking' to='/ranking'>🔝Ranking🔝</Link>
            </div>
        </header>
    )
}

export default Header;