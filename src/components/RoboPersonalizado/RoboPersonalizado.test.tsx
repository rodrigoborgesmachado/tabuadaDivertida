import { render } from '@testing-library/react';
import { PERSONALIZACAO_PADRAO } from '../../gamificacao/recompensas';
import RoboPersonalizado from './RoboPersonalizado';

const personalizacao = { ...PERSONALIZACAO_PADRAO, bichinho: 'bichinho-pinguim', rastro: 'rastro-confete', danca: 'danca-onda' };

describe('RoboPersonalizado', () => {
  it('shows the pet, the trail and the dance on every screen by default', () => {
    const { container } = render(<RoboPersonalizado personalizacao={personalizacao} />);
    const robo = container.querySelector('svg');

    expect(robo?.querySelector('[data-bichinho="bichinho-pinguim"]')).toBeTruthy();
    expect(robo?.querySelector('[data-rastro="rastro-confete"]')).toBeTruthy();
    expect(robo?.getAttribute('class')).toContain('robo-danca robo-danca-onda');
    expect(robo?.getAttribute('viewBox')).toBe('-44 0 144 100');
  });

  it('keeps the robot area when there is no pet or trail and hides the trail when asked', () => {
    const { container } = render(
      <>
        <RoboPersonalizado personalizacao={PERSONALIZACAO_PADRAO} />
        <RoboPersonalizado personalizacao={{ ...personalizacao, bichinho: '' }} rastro={false} />
      </>
    );
    const [padrao, semRastro] = Array.from(container.querySelectorAll('svg'));

    expect(padrao.getAttribute('viewBox')).toBe('0 0 100 100');
    expect(semRastro.querySelector('[data-rastro]')).toBeNull();
    expect(semRastro.getAttribute('viewBox')).toBe('0 0 100 100');
  });
});
