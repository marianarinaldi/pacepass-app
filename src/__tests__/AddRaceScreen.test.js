jest.mock('../config/firebaseConfig', () => ({
  auth: { currentUser: { uid: 'user-1' } },
}));

jest.mock('../services/raceService', () => ({
  addRace: jest.fn(),
}));

jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');
jest.mock('expo-image-picker', () => ({
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
}));

import { fireEvent, render } from '@testing-library/react-native';
import AddRaceScreen from '../screens/AddRaceScreen';

describe('AddRaceScreen', () => {
  it('renderiza os campos do formulário', async () => {
    const { getByLabelText } = await render(<AddRaceScreen navigation={{ goBack: jest.fn() }} />);

    expect(getByLabelText('Nome da Prova')).toBeTruthy();
    expect(getByLabelText('Distância 5k')).toBeTruthy();
    expect(getByLabelText('Data e hora da largada')).toBeTruthy();
    expect(getByLabelText('Início da retirada do kit')).toBeTruthy();
    expect(getByLabelText('Fim da retirada do kit')).toBeTruthy();
    expect(getByLabelText('Local de retirada do kit')).toBeTruthy();
    expect(getByLabelText('Plataforma de inscrição')).toBeTruthy();
  });

  it('exibe erros ao submeter o formulário em branco', async () => {
    const { getByLabelText, getByText } = await render(<AddRaceScreen navigation={{ goBack: jest.fn() }} />);

    await fireEvent.press(getByLabelText('Salvar prova'));

    expect(getByText('Informe o nome da prova.')).toBeTruthy();
    expect(getByText('Selecione uma distância.')).toBeTruthy();
    expect(getByText('Informe a data e hora da largada.')).toBeTruthy();
    expect(getByText('Informe o início da retirada.')).toBeTruthy();
    expect(getByText('Informe o fim da retirada.')).toBeTruthy();
    expect(getByText('Informe o local de retirada.')).toBeTruthy();
    expect(getByText('Informe a plataforma de inscrição.')).toBeTruthy();
  });
});
