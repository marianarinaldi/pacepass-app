import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { ResponseType } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
} from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { googleClientIds } from '../config/authConfig';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext(null);

function getAuthError(error) {
  if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
    return 'Login cancelado pelo utilizador.';
  }
  if (error?.message?.toLowerCase().includes('network')) {
    return 'Não foi possível conectar. Verifique a sua internet.';
  }
  return 'Não foi possível entrar com o Google. Tente novamente.';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [request, response, promptAsync] = Google.useAuthRequest({
    ...googleClientIds,
    responseType: ResponseType.IdToken,
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => onAuthStateChanged(auth, (nextUser) => {
    setUser(nextUser);
    setAuthLoading(false);
  }), []);

  useEffect(() => {
    if (!response) return;
    if (response.type === 'cancel' || response.type === 'dismiss') {
      setIsGoogleLoading(false);
      setAuthError('Login cancelado pelo utilizador.');
      return;
    }
    if (response.type !== 'success') {
      setIsGoogleLoading(false);
      setAuthError('Não foi possível concluir o login com o Google.');
      return;
    }

    const authenticate = async () => {
      const idToken = response.params?.id_token;
      if (!idToken) {
        setIsGoogleLoading(false);
        setAuthError('O Google não retornou um token de autenticação.');
        return;
      }
      try {
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
        setAuthError('');
      } catch (error) {
        setAuthError(getAuthError(error));
      } finally {
        setIsGoogleLoading(false);
      }
    };
    authenticate();
  }, [response]);

  const signInWithGoogle = async () => {
    if (!request) {
      setAuthError('Login Google indisponível. Configure os Client IDs da aplicação.');
      return;
    }
    setAuthError('');
    setIsGoogleLoading(true);
    try {
      await promptAsync();
    } catch (error) {
      setIsGoogleLoading(false);
      setAuthError(getAuthError(error));
    }
  };

  const value = useMemo(() => ({
    user,
    authLoading,
    isGoogleLoading,
    authError,
    signInWithGoogle,
  }), [user, authLoading, isGoogleLoading, authError, request]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return context;
}
