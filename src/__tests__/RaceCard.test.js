import { fireEvent, render, screen } from '@testing-library/react-native';
import RaceCard, { getRaceDateStatus } from '../components/RaceCard';

describe('RaceCard', () => {
  const race = {
    id: 'race-1',
    name: 'Corrida Teste',
    distance: 5,
    startDate: '2030-01-02T10:00:00.000Z',
    kitPickupLocation: 'Praça central',
    kitPickedUp: false,
  };

  it('renderiza os dados e o status pendente', () => {
    render(<RaceCard race={race} onMarkPickedUp={jest.fn()} />);
    expect(screen.getByText('Corrida Teste')).toBeTruthy();
    expect(screen.getByText('Pendente')).toBeTruthy();
    expect(screen.getByLabelText('Marcar kit de Corrida Teste como retirado')).toBeTruthy();
  });

  it('dispara a ação de retirada', () => {
    const onMarkPickedUp = jest.fn();
    render(<RaceCard race={race} onMarkPickedUp={onMarkPickedUp} />);
    fireEvent.press(screen.getByLabelText('Marcar kit de Corrida Teste como retirado'));
    expect(onMarkPickedUp).toHaveBeenCalledWith('race-1');
  });

  it('calcula o status temporal da corrida', () => {
    const now = new Date('2030-01-01T00:00:00.000Z');
    expect(getRaceDateStatus(race.startDate, now)).toBe('upcoming');
    expect(getRaceDateStatus('2029-01-01T00:00:00.000Z', now)).toBe('finished');
    expect(getRaceDateStatus('not-a-date', now)).toBe('invalid');
  });
});
