import { ChangeEvent, FormEvent, useState } from 'react';
import { toast } from 'react-toastify';
import PacmanLoader from '../../components/PacmanLoader/PacmanLoader';
import api from '../../services/api';
import './Contato.css';

type ContactForm = {
  nome: string;
  email: string;
  empresa: string;
  escola: string;
  assunto: string;
  mensagem: string;
};

const initialForm: ContactForm = {
  nome: '',
  email: '',
  empresa: '',
  escola: '',
  assunto: '',
  mensagem: ''
};

function Contato() {
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [loading, setLoading] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.nome.trim()) {
      toast.info('Informe seu nome.');
      return;
    }

    if (!form.email.trim()) {
      toast.info('Informe seu email.');
      return;
    }

    if (!form.mensagem.trim()) {
      toast.info('Escreva uma mensagem.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        Nome: form.nome.trim(),
        Email: form.email.trim(),
        Empresa: form.empresa.trim(),
        Escola: form.escola.trim(),
        Assunto: form.assunto.trim() || 'Contato Tabuada Divertida',
        Mensagem: form.mensagem.trim()
      };

      const response = await api.post('/email/enviaEmailContato', payload);

      if (response?.data?.success) {
        toast.success('Email enviado com sucesso!');
        setForm(initialForm);
      } else {
        toast.error('Servico indisponivel no momento.');
      }
    } catch {
      toast.error('Nao foi possivel enviar o email agora. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PacmanLoader dots={7} mouthAngle={40} pellets={[1, 2, 3, 4, 5, 6]} size={64} />;
  }

  return (
    <div className="global-pageContainer-left">
      <div className="contato-card">
        <h1>Contato</h1>
        <p>
          Tem alguma duvida, sugestao ou encontrou algum problema no <strong>Tabuada Divertida</strong>?
          Me envie uma mensagem pelo formulario.
        </p>

        <div className="contato-direct-links">
          <p>
            Email direto:{' '}
            <a href="mailto:rodrigomachado@sunsalesystem.com">rodrigomachado@sunsalesystem.com</a>
          </p>
          <p>
            GitHub:{' '}
            <a href="https://github.com/rodrigoborgesmachado" target="_blank" rel="noreferrer">
              github.com/rodrigoborgesmachado
            </a>
          </p>
        </div>

        <form className="contato-form" onSubmit={handleSubmit}>
          <div className="contato-grid">
            <label className="contato-field" htmlFor="nome">
              Nome*
              <input
                className="global-input"
                id="nome"
                name="nome"
                type="text"
                value={form.nome}
                onChange={handleChange}
                placeholder="Seu nome"
                required
              />
            </label>

            <label className="contato-field" htmlFor="email">
              Email*
              <input
                className="global-input"
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="voce@email.com"
                required
              />
            </label>

            <label className="contato-field" htmlFor="empresa">
              Empresa (opcional)
              <input
                className="global-input"
                id="empresa"
                name="empresa"
                type="text"
                value={form.empresa}
                onChange={handleChange}
                placeholder="Nome da empresa"
              />
            </label>

            <label className="contato-field" htmlFor="escola">
              Instituicao de ensino (opcional)
              <input
                className="global-input"
                id="escola"
                name="escola"
                type="text"
                value={form.escola}
                onChange={handleChange}
                placeholder="Nome da instituicao"
              />
            </label>
          </div>

          <label className="contato-field" htmlFor="assunto">
            Assunto (opcional)
            <input
              className="global-input"
              id="assunto"
              name="assunto"
              type="text"
              value={form.assunto}
              onChange={handleChange}
              placeholder="Exemplo: Feedback sobre o jogo"
            />
          </label>

          <label className="contato-field" htmlFor="mensagem">
            Mensagem*
            <textarea
              className="global-input contato-textarea"
              id="mensagem"
              name="mensagem"
              value={form.mensagem}
              onChange={handleChange}
              placeholder="Escreva sua mensagem aqui..."
              required
            />
          </label>

          <div className="global-buttonWrapper-toEnd">
            <button className="global-button contato-submit" type="submit">
              Enviar mensagem
            </button>
          </div>
        </form>

        <p className="contato-privacy">
          As informacoes enviadas aqui sao usadas somente para responder sua mensagem e nao sao
          compartilhadas com terceiros.
        </p>
      </div>
    </div>
  );
}

export default Contato;
