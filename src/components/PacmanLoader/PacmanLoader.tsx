import './PacmanLoader.css';

type CSSVarProps = React.CSSProperties & {
  [key: `--${string}`]: string | number;
};

interface PacmanLoaderProps {
  size: number;        // px
  mouthAngle: number;  // degrees
  dots: number;
  pellets: number[];   // ex.: Array.from({ length: dots }, (_, i) => i)
}

const PacmanLoaderTSX: React.FC<PacmanLoaderProps> = ({
  size,
  mouthAngle,
  dots,
  pellets
}) => {
  const loaderStyle: CSSVarProps = {
    '--size': `${size}px`,
    '--mouth': `${mouthAngle}deg`,
    '--dots': dots
  };

  return (
    <div className="loader-container">
      <div
        className="pacman-loader"
        role="status"
        aria-label="Carregando…"
        style={loaderStyle}
      >
        <div className="pacman" />
        <div className="pellets" aria-hidden={true}>
          {pellets.map((i) => {
            const pelletStyle: CSSVarProps = { '--i': i };
            return <span key={i} className="pellet" style={pelletStyle} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default PacmanLoaderTSX;
