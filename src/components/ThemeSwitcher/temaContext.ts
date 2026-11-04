import { createContext, useContext } from 'react';

interface Tema {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

export const TemaContext = createContext<Tema>({ theme: 'light', toggleTheme: () => {} });

export const useTema = () => useContext(TemaContext);
