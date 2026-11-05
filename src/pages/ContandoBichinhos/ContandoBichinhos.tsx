import { CSSProperties, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { falar, pararFala, playSuccess } from '../../services/sons';
import { lerProgresso, partidaFinalizada } from '../../gamificacao/progresso';
import BarraXp from '../../components/BarraXp/BarraXp';
import BotaoSom from '../../components/BotaoSom/BotaoSom';
import ComoJogar from '../../components/ComoJogar/ComoJogar';
import HappyRobot from '../../components/HappyRobot/HappyRobot';
import { dicaMostre, ENCORAJAR, estrelas, gerarPartida, instrucao, NIVEIS, nomeDoBicho, respostaDoDesafio, sortearElogio, TOTAL_DESAFIOS, type Desafio, type Grupo, type Nivel } from './logic';
import './ContandoBichinhos.css';

type Fase = 'config' | 'jogando' | 'fim';

interface Resultado {
  estrelas: number;
  ganhoXp: number;
}

interface SelecaoLigue {
  grupo?: number;
  numero?: number;
}

const TEMPO_COMEMORACAO = 1800;
const CORES_LIGUE = ['laranja', 'azul', 'verde'];

const colunas = (quantidade: number) => ({ '--bichinhos-colunas': Math.min(quantidade, 5) } as CSSProperties);

interface BichinhosProps {
  grupo: Grupo;
  selecionados?: number[];
  onTocar?: (indice: number) => void;
}

function Bichinhos({ grupo, selecionados, onTocar }: BichinhosProps) {
  const classe = `contando-bichinhos${grupo.quantidade > 10 ? ' contando-bichinhos--muitos' : ''}`;

  return (
    <div className={classe} style={colunas(grupo.quantidade)} role={onTocar ? undefined : 'img'} aria-label={onTocar ? undefined : `${grupo.quantidade} ${nomeDoBicho(grupo.bicho, grupo.quantidade)}`}>
      {Array.from({ length: grupo.quantidade }, (_, indice) => {
        if (!onTocar) {
          return <span key={indice} className='contando-bicho' aria-hidden='true'>{grupo.bicho.emoji}</span>;
        }

        const ordem = selecionados ? selecionados.indexOf(indice) : -1;
        return (
          <button
            key={indice}
            type='button'
            className={`contando-bicho contando-bicho--botao${ordem >= 0 ? ' contando-bicho--marcado' : ''}`}
            aria-label={`${grupo.bicho.nome} ${indice + 1}`}
            aria-pressed={ordem >= 0}
            onClick={() => onTocar(indice)}
          >
            {grupo.bicho.emoji}
            {ordem >= 0 && <span className='contando-bicho__ordem' aria-hidden='true'>{ordem + 1}</span>}
          </button>
        );
      })}
    </div>
  );
}

function ContandoBichinhos() {
  const [nivel, setNivel] = useState<Nivel>(5);
  const [fase, setFase] = useState<Fase>('config');
  const [desafios, setDesafios] = useState<Desafio[]>([]);
  const [indice, setIndice] = useState(0);
  const [erros, setErros] = useState(0);
  const [tentados, setTentados] = useState<number[]>([]);
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [ligacoes, setLigacoes] = useState<Record<number, number>>({});
  const [selecaoLigue, setSelecaoLigue] = useState<SelecaoLigue>({});
  const [comemorando, setComemorando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const proximoRef = useRef<number | null>(null);

  const desafio = fase === 'jogando' ? desafios[indice] : undefined;

  const cancelarProximo = () => {
    if (proximoRef.current) {
      window.clearTimeout(proximoRef.current);
      proximoRef.current = null;
    }
  };

  useEffect(() => () => {
    if (proximoRef.current) {
      window.clearTimeout(proximoRef.current);
    }
    pararFala();
  }, []);

  useEffect(() => {
    if (desafio) {
      falar(instrucao(desafio));
    }
  }, [desafio]);

  const prepararDesafio = (proximo: number) => {
    setIndice(proximo);
    setTentados([]);
    setSelecionados([]);
    setLigacoes({});
    setSelecaoLigue({});
    setComemorando(false);
    setMensagem('');
  };

  const iniciarJogo = () => {
    cancelarProximo();
    setDesafios(gerarPartida(nivel));
    setErros(0);
    setResultado(null);
    prepararDesafio(0);
    setFase('jogando');
  };

  const mudarNivel = () => {
    cancelarProximo();
    pararFala();
    setResultado(null);
    setFase('config');
  };

  const finalizarJogo = () => {
    const ganhou = estrelas(erros);
    const anterior = lerProgresso();
    partidaFinalizada({ jogo: 'contando-bichinhos' });
    const atual = lerProgresso();
    setResultado({ estrelas: ganhou, ganhoXp: atual.xp - anterior.xp });
    setFase('fim');
    falar(`Parabéns! Você ganhou ${ganhou} ${ganhou === 1 ? 'estrela' : 'estrelas'}!`);
  };

  const acertar = (prefixo = '') => {
    const elogio = sortearElogio();
    playSuccess();
    setMensagem(elogio);
    setComemorando(true);
    falar(`${prefixo}${elogio}`);
    proximoRef.current = window.setTimeout(() => {
      proximoRef.current = null;
      if (indice + 1 >= desafios.length) {
        finalizarJogo();
        return;
      }
      prepararDesafio(indice + 1);
    }, TEMPO_COMEMORACAO);
  };

  const errar = (texto = ENCORAJAR, prefixo = '') => {
    setErros((atual) => atual + 1);
    setMensagem(texto);
    falar(`${prefixo}${texto}`);
  };

  const escolherNumero = (numero: number) => {
    if (!desafio || comemorando || tentados.includes(numero)) {
      return;
    }

    if (numero === respostaDoDesafio(desafio)) {
      acertar(`${numero}! `);
      return;
    }

    setTentados([...tentados, numero]);
    errar(ENCORAJAR, `${numero}? `);
  };

  const tocarBicho = (bicho: number) => {
    if (comemorando) {
      return;
    }

    if (selecionados.includes(bicho)) {
      setSelecionados(selecionados.filter((item) => item !== bicho));
      return;
    }

    const novos = [...selecionados, bicho];
    setSelecionados(novos);
    falar(String(novos.length));
  };

  const confirmarMostre = () => {
    if (!desafio || desafio.tipo !== 'mostre' || comemorando) {
      return;
    }

    if (selecionados.length === desafio.alvo) {
      acertar(`${desafio.alvo}! `);
      return;
    }

    errar(dicaMostre(selecionados.length, desafio.alvo));
    setSelecionados([]);
  };

  const escolherGrupo = (grupo: number) => {
    if (!desafio || comemorando || tentados.includes(grupo)) {
      return;
    }

    if (grupo === respostaDoDesafio(desafio)) {
      acertar();
      return;
    }

    setTentados([...tentados, grupo]);
    errar('Quase! Conte os dois grupos de novo.');
  };

  const ligar = (selecao: SelecaoLigue) => {
    if (!desafio || desafio.tipo !== 'ligue' || comemorando) {
      return;
    }

    if (selecao.grupo === undefined || selecao.numero === undefined) {
      setSelecaoLigue(selecao);
      if (selecao.numero !== undefined) {
        falar(String(desafio.numeros[selecao.numero]));
      }
      return;
    }

    setSelecaoLigue({});
    const numero = desafio.numeros[selecao.numero];
    if (desafio.grupos[selecao.grupo].quantidade !== numero) {
      errar(ENCORAJAR, `${numero}? `);
      return;
    }

    const novas = { ...ligacoes, [selecao.grupo]: selecao.numero };
    setLigacoes(novas);
    if (Object.keys(novas).length === desafio.grupos.length) {
      acertar(`${numero}! `);
      return;
    }

    playSuccess();
    setMensagem('Isso! Agora ligue outro grupo.');
    falar(`${numero}! Isso!`);
  };

  const corDoGrupo = (grupo: number) => CORES_LIGUE[grupo] ? ` contando-ligue--${CORES_LIGUE[grupo]}` : '';

  const numeroLigado = (numero: number) => Object.keys(ligacoes).find((grupo) => ligacoes[Number(grupo)] === numero);

  const botaoNumero = (numero: number, extra = '', onClick = () => escolherNumero(numero), desabilitado = tentados.includes(numero)) => (
    <button
      key={numero}
      type='button'
      className={`contando-numero${desabilitado ? ' contando-numero--tentado' : ''}${extra}`}
      disabled={desabilitado}
      onClick={onClick}
    >
      {numero}
    </button>
  );

  const renderDesafio = (atual: Desafio) => {
    if (atual.tipo === 'quantos') {
      return (
        <>
          <div className='contando-cena'>
            <Bichinhos grupo={atual.grupo} />
          </div>
          <div className='contando-numeros'>{atual.opcoes.map((numero) => botaoNumero(numero))}</div>
        </>
      );
    }

    if (atual.tipo === 'junte') {
      return (
        <>
          <div className='contando-cena contando-cena--junte'>
            <Bichinhos grupo={atual.grupos[0]} />
            <span className='contando-sinal' aria-label='mais'>+</span>
            <Bichinhos grupo={atual.grupos[1]} />
            <span className='contando-sinal' aria-hidden='true'>=</span>
            <span className='contando-sinal contando-sinal--pergunta' aria-hidden='true'>?</span>
          </div>
          <div className='contando-numeros'>{atual.opcoes.map((numero) => botaoNumero(numero))}</div>
        </>
      );
    }

    if (atual.tipo === 'mostre') {
      return (
        <>
          <div className='contando-alvo' aria-hidden='true'>
            <span className='contando-numero contando-numero--alvo'>{atual.alvo}</span>
            <span className='contando-alvo__bicho'>{atual.grupo.bicho.emoji}</span>
          </div>
          <div className='contando-cena'>
            <Bichinhos grupo={atual.grupo} selecionados={selecionados} onTocar={tocarBicho} />
          </div>
          <div className='contando-toolbar'>
            <button type='button' className='contando-pronto' aria-label='Pronto' onClick={confirmarMostre}>✔️</button>
          </div>
        </>
      );
    }

    if (atual.tipo === 'mais') {
      return (
        <div className='contando-cena contando-cena--mais'>
          {atual.grupos.map((grupo, i) => (
            <button
              key={i}
              type='button'
              className={`contando-grupo${tentados.includes(i) ? ' contando-grupo--tentado' : ''}`}
              aria-label={`Grupo ${i + 1}`}
              disabled={tentados.includes(i)}
              onClick={() => escolherGrupo(i)}
            >
              <Bichinhos grupo={grupo} />
            </button>
          ))}
        </div>
      );
    }

    return (
      <>
        <div className='contando-cena contando-cena--ligue'>
          {atual.grupos.map((grupo, i) => (
            <button
              key={i}
              type='button'
              className={`contando-grupo${ligacoes[i] !== undefined ? ` contando-grupo--ligado${corDoGrupo(i)}` : ''}${selecaoLigue.grupo === i ? ' contando-grupo--selecionado' : ''}`}
              aria-label={`Grupo ${i + 1}`}
              aria-pressed={selecaoLigue.grupo === i}
              disabled={ligacoes[i] !== undefined}
              onClick={() => ligar({ ...selecaoLigue, grupo: i })}
            >
              <Bichinhos grupo={grupo} />
              {ligacoes[i] !== undefined && <span className='contando-grupo__numero' aria-hidden='true'>{grupo.quantidade}</span>}
            </button>
          ))}
        </div>
        <div className='contando-numeros'>
          {atual.numeros.map((numero, i) => {
            const grupo = numeroLigado(i);
            const extra = `${grupo !== undefined ? corDoGrupo(Number(grupo)) : ''}${selecaoLigue.numero === i ? ' contando-numero--selecionado' : ''}`;
            return botaoNumero(numero, extra, () => ligar({ ...selecaoLigue, numero: i }), grupo !== undefined);
          })}
        </div>
      </>
    );
  };

  return (
    <div className='center'>
      <div className='global-pageContainer-left options-preview contando-page'>
        <BotaoSom />
        <div className='contando-card'>
          <div className='contando-header'>
            <div>
              <h2 className='paragrafo2'>🐥 Contando bichinhos</h2>
              <p className='paragrafo3'>Conte os bichinhos e toque no número certo!</p>
            </div>
            {fase === 'jogando' && (
              <div className='contando-trilha' aria-label={`Desafio ${indice + 1} de ${TOTAL_DESAFIOS}`}>
                {desafios.map((_, i) => (
                  <span key={i} className={`contando-trilha__passo${i < indice || (i === indice && comemorando) ? ' contando-trilha__passo--feito' : ''}`} aria-hidden='true'>🐾</span>
                ))}
              </div>
            )}
          </div>

          {fase === 'config' && (
            <div className='contando-config'>
              <ComoJogar jogo='contando-bichinhos' />
              <div className='contando-config__grupo'>
                <h3>Escolha até quanto contar</h3>
                <div className='contando-opcoes'>
                  {NIVEIS.map((item) => (
                    <button
                      key={item}
                      type='button'
                      className={`contando-opcao${nivel === item ? ' contando-opcao--ativa' : ''}`}
                      aria-pressed={nivel === item}
                      onClick={() => setNivel(item)}
                    >
                      <strong>{item}</strong>
                      <span>Até {item}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className='contando-toolbar'>
                <button type='button' className='global-button contando-jogar' onClick={iniciarJogo}>
                  ▶️ Jogar
                </button>
                <Link to='/#jogos' className='global-button global-button--back'>
                  Voltar aos jogos
                </Link>
              </div>
            </div>
          )}

          {desafio && (
            <div className='contando-jogo'>
              <button type='button' className='contando-ouvir' onClick={() => falar(instrucao(desafio))}>
                <span aria-hidden='true'>🔊</span> Ouvir de novo
              </button>
              <p className='contando-instrucao'>{instrucao(desafio)}</p>
              {renderDesafio(desafio)}
              <p className='contando-mensagem' aria-live='polite'>{comemorando ? '' : mensagem}</p>
              {comemorando && (
                <div className='contando-comemoracao' role='status'>
                  <HappyRobot />
                  <strong>🎉 {mensagem}</strong>
                </div>
              )}
            </div>
          )}

          {fase === 'fim' && resultado && (
            <div className='contando-resultado' role='status'>
              <HappyRobot />
              <h3>🎉 Parabéns!</h3>
              <p className='contando-estrelas' aria-label={`${resultado.estrelas} de 3 estrelas`}>
                {[1, 2, 3].map((estrela) => (
                  <span key={estrela} className={estrela <= resultado.estrelas ? 'contando-estrela--ganha' : 'contando-estrela--vazia'} aria-hidden='true'>⭐</span>
                ))}
              </p>
              <BarraXp ganho={resultado.ganhoXp} />
              <div className='contando-toolbar'>
                <button type='button' className='global-button contando-jogar' onClick={iniciarJogo}>
                  🔁 Jogar de novo
                </button>
                <button type='button' className='global-button global-button--basic' onClick={mudarNivel}>
                  Mudar nível
                </button>
                <Link to='/#jogos' className='global-button global-button--back'>
                  Voltar aos jogos
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContandoBichinhos;
