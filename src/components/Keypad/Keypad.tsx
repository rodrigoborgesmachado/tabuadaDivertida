import React from 'react';
import './Keypad.css';

interface KeypadProps {
  value: string;
  onChange: (val: string) => void;
  onEnter: () => void;
}

const Keypad: React.FC<KeypadProps> = ({ value, onChange, onEnter }) => {
  const handleAppend = (digit: string) => {
    onChange(value + digit);
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="keypad-container" aria-label="Teclado numérico">
      <div className="keypad-row">
        {["1","2","3"].map((d) => (
          <button key={d} className="keypad-btn" onClick={() => handleAppend(d)} aria-label={`Número ${d}`}>{d}</button>
        ))}
      </div>
      <div className="keypad-row">
        {["4","5","6"].map((d) => (
          <button key={d} className="keypad-btn" onClick={() => handleAppend(d)} aria-label={`Número ${d}`}>{d}</button>
        ))}
      </div>
      <div className="keypad-row">
        {["7","8","9"].map((d) => (
          <button key={d} className="keypad-btn" onClick={() => handleAppend(d)} aria-label={`Número ${d}`}>{d}</button>
        ))}
      </div>
      <div className="keypad-row">
        <button className="keypad-btn" onClick={() => handleAppend("0")} aria-label="Número 0">0</button>
        <button className="keypad-btn" onClick={handleBackspace} aria-label="Apagar">⌫</button>
        <button className="keypad-btn" onClick={handleClear} aria-label="Limpar">C</button>
      </div>
      <div className="keypad-row">
        <button className="keypad-btn keypad-enter" onClick={onEnter} aria-label="Confirmar">Confirmar</button>
      </div>
    </div>
  );
};

export default Keypad;

