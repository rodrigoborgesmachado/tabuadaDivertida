import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import configData from './Config.json';
import { STORAGE_KEY } from './gamificacao/progresso';
import { STORAGE_PERSONALIZACAO, STORAGE_RECOMPENSAS_VISTAS } from './gamificacao/recompensas';
import { iniciarArmazenamento } from './services/armazenamento';
import { STORAGE_PERFIL_VISTO, STORAGE_QUANTIDADE } from './services/jogador';

const root = ReactDOM.createRoot(document.getElementById('root'));
iniciarArmazenamento([
  STORAGE_KEY,
  configData.HISTORICO,
  configData.NOME_PARAM,
  STORAGE_QUANTIDADE,
  STORAGE_PERFIL_VISTO,
  STORAGE_PERSONALIZACAO,
  STORAGE_RECOMPENSAS_VISTAS,
]).finally(() => root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
));
