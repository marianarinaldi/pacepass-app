import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text accessibilityRole="header" style={styles.title}>Histórico</Text>
        <Text style={styles.placeholder}>Em breve: suas corridas concluídas.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F8FAFC', flex: 1 },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { color: '#111827', fontSize: 28, fontWeight: '700', marginBottom: 12 },
  placeholder: { color: '#4B5563', fontSize: 16 },
});
