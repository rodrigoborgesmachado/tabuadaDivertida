import './style.css';
import {Link} from 'react-router-dom';

function Header(){
    return(
        <header>
            <Link className='logo' to='/'>Tabuada Divertida</Link>
            <Link className='ranking' to='/ranking'>Ranking</Link>
        </header>
    )
}

export default Header;