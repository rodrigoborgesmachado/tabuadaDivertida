import { useEffect, useRef, useState } from 'react';
import './WalkingRobot.css';
import HappyRobot from '../HappyRobot/HappyRobot';

export default function WalkingRobot() {
	const robotRef = useRef<HTMLImageElement | null>(null);
	const [direction, setDirection] = useState<'left' | 'right'>('right');
	const [clicked, setClicked] = useState(0);

	useEffect(() => {
		const moveRobot = () => {
			if (!robotRef.current) return;

			const screenWidth = window.innerWidth;
			const screenHeight = window.innerHeight;

			const randomLeft = Math.random() * (screenWidth - 100); 
			const randomTop = Math.random() * (screenHeight - 100); 

			setDirection(randomLeft > robotRef.current.offsetLeft ? 'right' : 'left');

			robotRef.current.style.left = `${randomLeft}px`;
			robotRef.current.style.top = `${randomTop}px`;
		};

		// Move a cada 4 segundos
		const interval = setInterval(moveRobot, 4000);
		moveRobot(); // mover logo que inicia

		return () => clearInterval(interval);
	}, []);

	return (
		<div onClick={(e) => setClicked(prev => prev+1)} ref={robotRef} className={`walking-robot ${direction === 'left' ? 'flip' : ''}`}>
            <HappyRobot happy={clicked <= 3}/>
        </div>
	);
}
