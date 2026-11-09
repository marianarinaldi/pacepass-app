import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function Loading() {
  return <View style={styles.container}><ActivityIndicator size="large" color="#2563EB" /></View>;
}

const styles = StyleSheet.create({ container: { alignItems: 'center', flex: 1, justifyContent: 'center' } });
