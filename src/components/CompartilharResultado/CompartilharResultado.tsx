import { useEffect, useState } from 'react';
import { arquivoDoResultado, baixarImagem, compartilharResultado, podeCompartilharArquivos, type ResultadoCompartilhado } from '../../services/compartilhar';

interface CompartilharResultadoProps {
  resultado: ResultadoCompartilhado;
  className: string;
  rotulo?: string;
  classeRotulo?: string;
}

function CompartilharResultado({ resultado, className, rotulo = 'Compartilhar', classeRotulo }: CompartilharResultadoProps) {
  const [arquivos] = useState(() => podeCompartilharArquivos());
  const [arquivo, setArquivo] = useState<File | null>(null);
  const chave = JSON.stringify(resultado);

  useEffect(() => {
    let ativo = true;
    if (arquivos) {
      arquivoDoResultado(JSON.parse(chave)).then((gerado) => ativo && setArquivo(gerado));
    }

    return () => {
      ativo = false;
    };
  }, [arquivos, chave]);

  const conteudo = (texto: string) => (classeRotulo ? <span className={classeRotulo}>{texto}</span> : texto);

  return (
    <>
      <button type='button' className={className} onClick={() => compartilharResultado(resultado, arquivos ? arquivo : null)}>
        {conteudo(rotulo)}
      </button>
      {!arquivos && (
        <button type='button' className={className} onClick={() => baixarImagem(resultado)}>
          {conteudo('Baixar imagem')}
        </button>
      )}
    </>
  );
}

export default CompartilharResultado;
