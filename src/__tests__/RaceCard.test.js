jest.mock('expo-haptics', () => ({
  NotificationFeedbackType: { Success: 'success' },
  notificationAsync: jest.fn(() => Promise.resolve()),
}));

import { fireEvent, render, screen } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import RaceCard, { getDaysUntil, getRaceDateStatus } from '../components/RaceCard';

describe('RaceCard', () => {
  const race = {
    id: 'race-1',
    name: 'Corrida Teste',
    distance: '10k',
    raceDate: '2030-01-02T10:00:00.000Z',
    kitPickupLocation: 'Praça central',
    isPickedUp: false,
  };
  const now = new Date('2030-01-01T10:00:00.000Z');

  it('renderiza os dados, contagem regressiva e status do kit', async () => {
    await render(<RaceCard now={now} onMarkPickedUp={jest.fn()} race={race} />);
    expect(screen.getByText('Corrida Teste')).toBeTruthy();
    expect(screen.getByText('10k · 02 de jan. de 2030')).toBeTruthy();
    expect(screen.getByText('Em 1 dia')).toBeTruthy();
    expect(screen.getByText('Kit Pendente')).toBeTruthy();
  });

  it('dispara haptics e a ação de retirada', async () => {
    const onMarkPickedUp = jest.fn(() => Promise.resolve());
    await render(<RaceCard onMarkPickedUp={onMarkPickedUp} race={race} />);
    await fireEvent.press(screen.getByLabelText('Marcar kit de Corrida Teste como retirado'));
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
    expect(onMarkPickedUp).toHaveBeenCalledWith('race-1');
  });

  it('calcula status e dias corretamente', () => {
    expect(getRaceDateStatus(race.raceDate, now)).toBe('upcoming');
    expect(getDaysUntil(race.raceDate, now)).toBe(1);
    expect(getRaceDateStatus('2029-01-01T00:00:00.000Z', now)).toBe('finished');
    expect(getRaceDateStatus('not-a-date', now)).toBe('invalid');
  });
});
