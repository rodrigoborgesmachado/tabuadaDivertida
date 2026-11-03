import './PacmanLoader.css';

type CSSVarProps = React.CSSProperties & {
  [key: `--${string}`]: string | number;
};

interface PacmanLoaderProps {
  size?: number;
  dots?: number;
}

const PacmanLoaderTSX: React.FC<PacmanLoaderProps> = ({
  size = 64,
  dots = 5
}) => {
  const loaderStyle: CSSVarProps = {
    '--size': `${size}px`,
    '--dots': dots
  };

  return (
    <div className="loader-container" role="status">
      <div className="pacman-loader" aria-hidden={true} style={loaderStyle}>
        <div className="pellets">
          {Array.from({ length: dots }, (_, i) => {
            const pelletStyle: CSSVarProps = { '--i': i };
            return <span key={i} className="pellet" style={pelletStyle} />;
          })}
        </div>
        <div className="pacman" />
      </div>
      <span className="pacman-loader-texto">Carregando...</span>
    </div>
  );
};

export default PacmanLoaderTSX;
