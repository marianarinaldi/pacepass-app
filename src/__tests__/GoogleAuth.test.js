jest.mock('expo-web-browser', () => ({ maybeCompleteAuthSession: jest.fn() }));
jest.mock('expo-auth-session/providers/google', () => ({
  useAuthRequest: jest.fn(() => [{ clientId: 'test-client' }, null, jest.fn()]),
}));
jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: { credential: jest.fn() },
  onAuthStateChanged: jest.fn(() => jest.fn()),
  signInWithCredential: jest.fn(),
}));
jest.mock('../config/firebaseConfig', () => ({ auth: {} }));
jest.mock('../config/authConfig', () => ({ googleClientIds: {} }));
jest.mock('@expo/vector-icons', () => ({ AntDesign: () => null }));

import { fireEvent, render } from '@testing-library/react-native';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('LoginScreen Google', () => {
  it('renderiza o botão de login Google', async () => {
    useAuth.mockReturnValue({ authError: '', isGoogleLoading: false, signInWithGoogle: jest.fn() });
    const { getByLabelText } = await render(<LoginScreen />);
    expect(getByLabelText('Entrar com conta do Google')).toBeTruthy();
  });

  it('dispara o login Google ao pressionar o botão', async () => {
    const signInWithGoogle = jest.fn();
    useAuth.mockReturnValue({ authError: '', isGoogleLoading: false, signInWithGoogle });
    const { getByLabelText } = await render(<LoginScreen />);
    await fireEvent.press(getByLabelText('Entrar com conta do Google'));
    expect(signInWithGoogle).toHaveBeenCalledTimes(1);
  });
});
