import './style.css';
import configData from "./../../Config.json";
import { useState, useEffect } from 'react';

function Tempo(){
    const[tempo, setTempo] = useState(1);
    const[start, setStart] = useState(true);

    useEffect(() =>
    {
        let intervalId: NodeJS.Timeout;

        if(start){
            intervalId = setInterval(() => {
                setTempo(tempo+1);
                localStorage.setItem(configData.TEMPO_PARAM, tempo.toString());
            }, 1000);
        }

        return() => {
            clearInterval(intervalId);
        };
    }, [tempo])

    return(
        <div className='timerdiv'>
            ⏳Tempo: {tempo}
        </div>
    )
}

export default Tempo;