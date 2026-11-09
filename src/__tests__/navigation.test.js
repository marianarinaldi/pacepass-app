jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

jest.mock('../screens/UpcomingRacesScreen', () => () => null);
jest.mock('../screens/CalendarScreen', () => () => null);
jest.mock('../screens/HistoryScreen', () => () => null);
jest.mock('../screens/AddRaceScreen', () => () => null);
jest.mock('../screens/RaceDetailScreen', () => () => null);

import { fireEvent, render } from '@testing-library/react-native';
import AppNavigator from '../navigation/AppNavigator';

describe('estrutura de navegação', () => {
  it('inicia nas abas principais e renderiza as três abas', async () => {
    const { getByLabelText } = await render(<AppNavigator />);

    expect(getByLabelText('Aba Próximas')).toBeTruthy();
    expect(getByLabelText('Aba Calendário')).toBeTruthy();
    expect(getByLabelText('Aba Histórico')).toBeTruthy();
  });

  it('permite selecionar as abas principais', async () => {
    const { getByLabelText } = await render(<AppNavigator />);

    await fireEvent.press(getByLabelText('Aba Calendário'));
    expect(getByLabelText('Aba Calendário')).toBeTruthy();

    await fireEvent.press(getByLabelText('Aba Histórico'));
    expect(getByLabelText('Aba Histórico')).toBeTruthy();
  });
});
