import { useState } from 'react';
import RoboPersonalizado from '../RoboPersonalizado/RoboPersonalizado';

function HappyRobot({happy = true}){
    const [clickCount, setClickCount] = useState(0);
    const [exploded, setExploded] = useState(false);

    const handleRobotClick = () => {
        if (exploded) return;
        const newCount = clickCount + 1;
        if (newCount >= 5) {
            setExploded(true);
        }
        setClickCount(newCount);
    };

    return(
    <div
        className='home-robot-container'
        style={
            exploded ? { animation: 'none', pointerEvents: 'none' } : undefined
        }
    >
        {exploded ? (
            <span className='home-robot-explosion'>💥</span>
        ) : (
            <RoboPersonalizado
                triste={!happy}
                titulo='Robô feliz'
                className='home-robot'
                style={{ transform: `scale(${1 + clickCount * 0.1})` }}
                onClick={handleRobotClick}
            />
        )}
    </div>
    )
}

export default HappyRobot;