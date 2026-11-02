import { toast } from 'react-toastify';

export const compartilhar = async (title: string, text: string) => {
  try {
    if ('share' in navigator) {
      await (navigator as any).share({ title, text });
      return;
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      toast.success('Texto copiado para compartilhar.');
      return;
    }

    window.prompt('Copie para compartilhar:', text);
  } catch {}
};
