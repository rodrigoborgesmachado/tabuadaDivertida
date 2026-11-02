import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import configData from "../../Config.json";
import WalkingRobot from "../../components/WalkingRobot/WalkingRobot";
import HappyRobot from "../../components/HappyRobot/HappyRobot";
import SequenciaDias from '../../components/SequenciaDias/SequenciaDias';
import { buscarMedalha, medalhas, nomeNivel } from '../../gamificacao/medalhas';
import { lerProgresso } from '../../gamificacao/progresso';
import { lerHistorico, type HistoricoItem, type Questao } from '../../services/historico';
import { formatarTempo } from '../MemoriaTabuada/logic';
import { NIVEIS, readMelhores } from '../MemoriaTabuada/MemoriaTabuada';
import { comparacaoSemanal, contasParaTreino, errosMaisComuns, evolucao, filtrarPorPeriodo, mapaTabuada, resumir, respostaCorreta, taxaAcerto, tempoPorConta, type CasaDoMapa, type Periodo, type PontoEvolucao } from './logic';
import './Resultados.css';

const PERIODOS: { periodo: Periodo; label: string }[] = [
  { periodo: '7', label: '7 dias' },
  { periodo: '30', label: '30 dias' },
  { periodo: 'tudo', label: 'Tudo' },
];

const LEGENDA_MAPA = [
  { desempenho: 'domina', label: 'Domina' },
  { desempenho: 'as-vezes', label: 'Às vezes erra' },
  { desempenho: 'erra', label: 'Erra com frequência' },
  { desempenho: 'sem-dados', label: 'Ainda não respondida' },
];

const formatarNumero = (valor: number, casas = 0) => valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });

const formatarPercentual = (valor: number) => `${formatarNumero(valor * 100, 1)}%`;

const formatarDia = (data: Date) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(data);

const plural = (valor: number, singular: string, varios: string) => `${valor} ${valor === 1 ? singular : varios}`;

function labelTipo(t: string) {
  if (t === 'R') return 'Aleatório';
  if (t === 'D') return 'Divisão';
  if (t === 'S') return 'Subtração';
  if (t === 'A') return 'Adição';
  if (t === 'E') return 'Expressões Numéricas';
  if (t === 'T') return 'Treino dos erros';
  if (t === 'MM') return 'Maior ou menor';
  return 'Multiplicação';
}

function textoComparacao(comparacao: ReturnType<typeof comparacaoSemanal>) {
  if (!comparacao) return 'Jogue nesta semana e na passada para comparar sua evolução.';
  if (comparacao.diferenca > 0) return `+${comparacao.diferenca}% de acerto em relação à semana passada 🎉`;
  if (comparacao.diferenca < 0) return `${comparacao.diferenca}% de acerto em relação à semana passada. Bora treinar! 💪`;
  return 'Mesma taxa de acerto da semana passada. Continue assim! 👍';
}

type GraficoProps = {
  titulo: string;
  pontos: PontoEvolucao[];
  valor: (ponto: PontoEvolucao) => number;
  formatar: (valor: number) => string;
  maximo?: number;
};

function GraficoLinha({ titulo, pontos, valor, formatar, maximo }: GraficoProps) {
  const [selecionado, setSelecionado] = useState(pontos.length - 1);
  const largura = 320;
  const altura = 140;
  const margem = { esquerda: 40, direita: 12, topo: 12, base: 24 };
  const topo = maximo ?? Math.max(1, Math.ceil(Math.max(...pontos.map(valor)) * 1.2));
  const x = (indice: number) => margem.esquerda + (pontos.length > 1 ? indice / (pontos.length - 1) : 0.5) * (largura - margem.esquerda - margem.direita);
  const y = (v: number) => altura - margem.base - (v / topo) * (altura - margem.topo - margem.base);
  const atual = pontos[Math.min(selecionado, pontos.length - 1)];

  return (
    <figure className='resultados-grafico'>
      <figcaption>{titulo}</figcaption>
      <svg viewBox={`0 0 ${largura} ${altura}`} role='img' aria-label={`${titulo} nas últimas ${pontos.length} partidas`}>
        {[0, topo / 2, topo].map((linha) => (
          <g key={linha}>
            <line className='resultados-grafico__grade' x1={margem.esquerda} x2={largura - margem.direita} y1={y(linha)} y2={y(linha)} />
            <text className='resultados-grafico__eixo' x={margem.esquerda - 6} y={y(linha) + 4} textAnchor='end'>{formatar(linha)}</text>
          </g>
        ))}
        <text className='resultados-grafico__eixo' x={x(0)} y={altura - 6} textAnchor={pontos.length > 1 ? 'start' : 'middle'}>{formatarDia(pontos[0].data)}</text>
        {pontos.length > 1 && (
          <text className='resultados-grafico__eixo' x={x(pontos.length - 1)} y={altura - 6} textAnchor='end'>{formatarDia(pontos[pontos.length - 1].data)}</text>
        )}
        <polyline className='resultados-grafico__linha' points={pontos.map((ponto, indice) => `${x(indice)},${y(valor(ponto))}`).join(' ')} />
        {pontos.map((ponto, indice) => (
          <g key={indice} onMouseEnter={() => setSelecionado(indice)} onClick={() => setSelecionado(indice)}>
            <circle className={`resultados-grafico__ponto${indice === selecionado ? ' resultados-grafico__ponto--ativo' : ''}`} cx={x(indice)} cy={y(valor(ponto))} r={4} />
            <circle className='resultados-grafico__alvo' cx={x(indice)} cy={y(valor(ponto))} r={12} />
          </g>
        ))}
      </svg>
      <p className='resultados-grafico__valor'>{formatarDia(atual.data)} · {formatar(valor(atual))}</p>
    </figure>
  );
}

function Resultados() {
  const navigate = useNavigate();
  const [nome, setNome] = useState<string>('');
  const [quantidade, setQuantidade] = useState<number>(0);
  const [acertos, setAcertos] = useState<number>(0);
  const [tempo, setTempo] = useState<number>(0);
  const [pontuacao, setPontuacao] = useState<number>(0);
  const [recorde, setRecorde] = useState<number>(0);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [periodo, setPeriodo] = useState<Periodo>('tudo');
  const [casaSelecionada, setCasaSelecionada] = useState<CasaDoMapa | null>(null);
  const [progresso] = useState(() => lerProgresso());
  const [melhoresMemoria] = useState(() => readMelhores());

  const [historico, setHistorico] = useState<HistoricoItem[]>([]);

  useEffect(() => {
    try {
      setNome(localStorage.getItem(configData.NOME_PARAM) || '');
      setQuantidade(parseInt(localStorage.getItem(configData.QUANTIDADE_PARAM) || '0'));
      setAcertos(parseInt(localStorage.getItem(configData.QUANTIDADE_ACERTOS) || '0'));
      setTempo(parseInt(localStorage.getItem(configData.TEMPO_PARAM) || '0'));
      setPontuacao(parseInt(localStorage.getItem(configData.PONTUACAO) || '0'));
      setRecorde(parseInt(localStorage.getItem(configData.RECORDE) || '0'));
      const q = localStorage.getItem(configData.QUESTOES);
      setQuestoes(q ? JSON.parse(q) : []);
      setHistorico(lerHistorico());
    } catch {
    }
  }, []);

  const filtrado = useMemo(() => filtrarPorPeriodo(historico, periodo), [historico, periodo]);
  const resumo = useMemo(() => resumir(filtrado), [filtrado]);
  const erros = useMemo(() => errosMaisComuns(filtrado), [filtrado]);
  const mapa = useMemo(() => mapaTabuada(filtrado), [filtrado]);
  const pontos = useMemo(() => evolucao(filtrado), [filtrado]);
  const comparacao = useMemo(() => comparacaoSemanal(historico), [historico]);
  const treino = useMemo(() => contasParaTreino(filtrado), [filtrado]);

  const recordeGeral = periodo === 'tudo' ? Math.max(resumo.geral.recorde, recorde) : resumo.geral.recorde;
  const ultimasMedalhas = Object.entries(progresso.medalhas)
    .sort((a, b) => b[1].data.localeCompare(a[1].data))
    .slice(0, 3)
    .flatMap(([id, { nivel }]) => {
      const medalha = buscarMedalha(id);
      return medalha ? [{ medalha, nivel }] : [];
    });

  const treinarErros = () => {
    localStorage.setItem(configData.TREINO, JSON.stringify(treino));
    localStorage.setItem(configData.QUANTIDADE_PARAM, String(treino.length));
    navigate('/contagem/T');
  };

  const temResultados = quantidade > 0 || acertos > 0 || questoes.length > 0 || pontuacao > 0;

  return (
    <div className='global-pageContainer-left options-preview resultados-page'>
      <WalkingRobot />
      <h1>Resultados</h1>

      <div className='resultados-periodos' role='group' aria-label='Período'>
        {PERIODOS.map((item) => (
          <button
            key={item.periodo}
            type='button'
            className={`resultados-periodos__botao${periodo === item.periodo ? ' resultados-periodos__botao--ativo' : ''}`}
            aria-pressed={periodo === item.periodo}
            onClick={() => setPeriodo(item.periodo)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className='article-content'>
        <h2>Resumo geral</h2>
        {resumo.geral.jogos === 0 ? (
          <p>Nenhum jogo encontrado neste período.</p>
        ) : (
          <>
            <div className='resumo-kpis-wrap'>
              <dl className='resultados-cartoes'>
                <div className='resultados-cartao'>
                  <dt>Jogos</dt>
                  <dd>{resumo.geral.jogos}</dd>
                </div>
                <div className='resultados-cartao'>
                  <dt>Taxa de acerto</dt>
                  <dd>{formatarPercentual(taxaAcerto(resumo.geral))}</dd>
                </div>
                <div className='resultados-cartao'>
                  <dt>Tempo médio por conta</dt>
                  <dd>{formatarNumero(tempoPorConta(resumo.geral), 1)}s</dd>
                </div>
                <div className='resultados-cartao'>
                  <dt>Recorde</dt>
                  <dd>{recordeGeral || '—'}</dd>
                </div>
              </dl>
              <HappyRobot happy={true} />
            </div>
            <p>Acertos: {resumo.geral.acertos}/{resumo.geral.questoes} · Erros: {Math.max(0, resumo.geral.questoes - resumo.geral.acertos)}</p>

            <h2>Por tipo de jogo</h2>
            <table className='resultados-table'>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Jogos</th>
                  <th>Taxa</th>
                  <th>Tempo por conta</th>
                  <th>Recorde</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(resumo.porTipo).map(([tp, v]) => (
                  <tr key={tp}>
                    <td data-label='Tipo'>{labelTipo(tp)}</td>
                    <td data-label='Jogos'>{v.jogos}</td>
                    <td data-label='Taxa'>{formatarPercentual(taxaAcerto(v))}</td>
                    <td data-label='Tempo por conta'>{formatarNumero(tempoPorConta(v), 1)}s</td>
                    <td data-label='Recorde'>{v.recorde || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>

      <section className='article-content'>
        <h2>Evolução</h2>
        <p className='resultados-comparacao'>{textoComparacao(comparacao)}</p>
        {pontos.length === 0 ? (
          <p>Ainda não há partidas com data neste período para mostrar a evolução.</p>
        ) : (
          <div className='resultados-graficos'>
            <GraficoLinha key={`taxa-${periodo}`} titulo='Taxa de acerto' pontos={pontos} valor={(ponto) => ponto.taxa} formatar={(valor) => `${formatarNumero(valor)}%`} maximo={100} />
            <GraficoLinha key={`tempo-${periodo}`} titulo='Tempo médio por conta' pontos={pontos} valor={(ponto) => ponto.tempoPorConta} formatar={(valor) => `${formatarNumero(valor, 1)}s`} />
          </div>
        )}
      </section>

      <section className='article-content'>
        <h2>Mapa da tabuada</h2>
        <p>Toque numa casa para ver quantas vezes você acertou e errou aquela conta.</p>
        <div className='resultados-mapa' role='grid' aria-label='Mapa da tabuada'>
          <div className='resultados-mapa__linha' aria-hidden='true'>
            <span className='resultados-mapa__cabecalho'>x</span>
            {mapa[0].map((casa) => (
              <span key={casa.b} className='resultados-mapa__cabecalho'>{casa.b}</span>
            ))}
          </div>
          {mapa.map((linha) => (
            <div key={linha[0].a} className='resultados-mapa__linha' role='row'>
              <span className='resultados-mapa__cabecalho' aria-hidden='true'>{linha[0].a}</span>
              {linha.map((casa) => (
                <button
                  key={casa.b}
                  type='button'
                  role='gridcell'
                  className={`resultados-mapa__casa resultados-mapa__casa--${casa.desempenho}${casaSelecionada?.a === casa.a && casaSelecionada?.b === casa.b ? ' resultados-mapa__casa--selecionada' : ''}`}
                  aria-label={`${casa.a} x ${casa.b} = ${casa.a * casa.b}: ${plural(casa.acertos, 'acerto', 'acertos')}, ${plural(casa.erros, 'erro', 'erros')}`}
                  onClick={() => setCasaSelecionada(casa)}
                >
                  {casa.a * casa.b}
                </button>
              ))}
            </div>
          ))}
        </div>
        <p className='resultados-mapa__detalhe' aria-live='polite'>
          {casaSelecionada
            ? `${casaSelecionada.a} x ${casaSelecionada.b} = ${casaSelecionada.a * casaSelecionada.b}: ${plural(casaSelecionada.acertos, 'acerto', 'acertos')} e ${plural(casaSelecionada.erros, 'erro', 'erros')}`
            : 'Nenhuma casa selecionada.'}
        </p>
        <ul className='resultados-mapa__legenda'>
          {LEGENDA_MAPA.map((item) => (
            <li key={item.desempenho}>
              <span className={`resultados-mapa__amostra resultados-mapa__casa--${item.desempenho}`} aria-hidden='true' />
              {item.label}
            </li>
          ))}
        </ul>
      </section>

      <section className='article-content'>
        <h2>Erros mais comuns</h2>
        {erros.length === 0 ? (
          <p>Nenhum erro neste período. Mandou bem! 🎉</p>
        ) : (
          <>
            <ul className='resultados-erros'>
              {erros.map((erro) => (
                <li key={erro.questao}>
                  {erro.questao}{erro.resposta !== null && ` = ${erro.resposta}`} — errou {erro.erros}x
                </li>
              ))}
            </ul>
            {treino.length > 0 && (
              <button type='button' className='global-button global-button--full-width' onClick={treinarErros}>
                Treinar meus erros
              </button>
            )}
          </>
        )}
      </section>

      <section className='article-content'>
        <h2>Última sessão</h2>
        {!temResultados ? (
          <p>Nenhum resultado salvo nesta sessão.</p>
        ) : (
          <>
            <p>Nome: {nome || '—'}</p>
            <p>Acertos: {acertos}/{quantidade}</p>
            <p>Tempo: {tempo}s</p>
            <p>Pontuação: {pontuacao} | Recorde: {recorde}</p>

            {questoes && questoes.length > 0 && (
              <div className='respostasQuestoes'>
                <h3>Respostas</h3>
                <div className='resultados-lista'>
                  {questoes.map((q, idx) => (
                    <p className='resultados-item' key={idx}>
                      {q.questao} = {q.resposta} {q.correta ? '✅' : `❌${respostaCorreta(q.questao) !== null ? ` (${respostaCorreta(q.questao)})` : ''}`}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <section className='article-content'>
        <h2>Outros jogos</h2>
        <div className='resultados-outros'>
          <div>
            <h3>🧠 Memória da tabuada</h3>
            <dl className='resultados-detalhes'>
              {NIVEIS.map(({ nivel, label }) => (
                <div key={nivel}>
                  <dt>{label}</dt>
                  <dd>{melhoresMemoria[nivel] ? `${plural(melhoresMemoria[nivel]!.jogadas, 'jogada', 'jogadas')} · ${formatarTempo(melhoresMemoria[nivel]!.segundos)}` : '—'}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h3>🔢 2048</h3>
            <dl className='resultados-detalhes'>
              <div>
                <dt>Maior peça</dt>
                <dd>{progresso.maiorPeca || '—'}</dd>
              </div>
              <div>
                <dt>Melhor pontuação</dt>
                <dd>{progresso.maiorPontuacao2048 || '—'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className='article-content'>
        <h2>Conquistas</h2>
        <SequenciaDias />
        <p>Você conquistou {medalhas.filter((medalha) => progresso.medalhas[medalha.id]).length} de {medalhas.length} medalhas.</p>
        {ultimasMedalhas.length > 0 && (
          <ul className='resultados-medalhas'>
            {ultimasMedalhas.map(({ medalha, nivel }) => (
              <li key={medalha.id}>
                {medalha.icone} {medalha.nome}{nomeNivel(medalha, nivel) && ` · ${nomeNivel(medalha, nivel)}`}
              </li>
            ))}
          </ul>
        )}
        <Link to='/conquistas'>Ver todas as conquistas</Link>
      </section>

      <div className='botoes'>
        <a className='global-button global-button--full-width' href='/historico'>
          <span className='option-link'>Ver histórico completo</span>
        </a>
        <a className='global-button global-button--full-width' href='/'>
          <span className='option-link'>Início</span>
        </a>
      </div>
    </div>
  );
}

export default Resultados;
