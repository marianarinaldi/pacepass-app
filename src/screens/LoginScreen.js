import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { authError, isGoogleLoading, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text accessibilityRole="header" style={styles.title}>Bem-vindo ao PacePass</Text>
        <Text style={styles.subtitle}>Organize suas provas e retiradas de kits.</Text>

        <Pressable
          accessibilityLabel="Entrar com conta do Google"
          accessibilityRole="button"
          disabled={isGoogleLoading}
          onPress={signInWithGoogle}
          style={styles.googleButton}
        >
          {isGoogleLoading ? <ActivityIndicator color="#FFF" /> : <AntDesign color="#FFF" name="google" size={20} />}
          <Text style={styles.googleText}>{isGoogleLoading ? 'Conectando...' : 'Continuar com o Google'}</Text>
        </Pressable>

        <View style={styles.divider}><View style={styles.line} /><Text style={styles.or}>OU</Text><View style={styles.line} /></View>

        <TextInput accessibilityLabel="E-mail" autoCapitalize="none" keyboardType="email-address" onChangeText={setEmail} placeholder="E-mail" style={styles.input} value={email} />
        <TextInput accessibilityLabel="Senha" onChangeText={setPassword} placeholder="Senha" secureTextEntry style={styles.input} value={password} />
        <Pressable accessibilityLabel="Entrar com e-mail" disabled={!email || !password} style={styles.emailButton}>
          <Text style={styles.emailText}>Entrar com e-mail</Text>
        </Pressable>
        {!!authError && <Text accessibilityLiveRegion="polite" style={styles.error}>{authError}</Text>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F8FAFC', flex: 1 },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { color: '#0F172A', fontSize: 28, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: '#475569', fontSize: 16, marginBottom: 28, marginTop: 10, textAlign: 'center' },
  googleButton: { alignItems: 'center', backgroundColor: '#4285F4', borderRadius: 9, flexDirection: 'row', gap: 12, justifyContent: 'center', minHeight: 52, padding: 14 },
  googleText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  divider: { alignItems: 'center', flexDirection: 'row', gap: 12, marginVertical: 24 },
  line: { backgroundColor: '#CBD5E1', flex: 1, height: 1 },
  or: { color: '#64748B', fontWeight: '700' },
  input: { backgroundColor: '#FFF', borderColor: '#CBD5E1', borderRadius: 8, borderWidth: 1, marginBottom: 12, padding: 14 },
  emailButton: { alignItems: 'center', backgroundColor: '#E2E8F0', borderRadius: 8, padding: 14 },
  emailText: { color: '#334155', fontWeight: '700' },
  error: { color: '#B91C1C', marginTop: 14, textAlign: 'center' },
});
