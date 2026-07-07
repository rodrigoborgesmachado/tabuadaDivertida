import './style.css';
import configData from "./../../Config.json";
import { useState, useEffect } from 'react';

function Tempo(){
    const[tempo, setTempo] = useState(1);
    const[start] = useState(true);

    useEffect(() =>
    {
        let intervalId: NodeJS.Timeout;

        if(start){
            intervalId = setInterval(() => {
                setTempo((prevTempo) => {
                    const nextTempo = prevTempo + 1;
                    localStorage.setItem(configData.TEMPO_PARAM, nextTempo.toString());
                    return nextTempo;
                });
            }, 1000);
        }

        return() => {
            clearInterval(intervalId);
        };
    }, [start])

    return(
        <div className='timerdiv'>
            ⏳Tempo: {tempo}
        </div>
    )
}

export default Tempo;