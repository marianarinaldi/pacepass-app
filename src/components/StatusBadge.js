import { StyleSheet, Text, View } from 'react-native';

export default function StatusBadge({ pickedUp }) {
  return (
    <View style={[styles.badge, pickedUp ? styles.done : styles.pending]}>
      <Text style={styles.text}>{pickedUp ? 'Kit Retirado' : 'Kit Pendente'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  done: { backgroundColor: '#DCFCE7' },
  pending: { backgroundColor: '#FEF3C7' },
  text: { color: '#172554', fontSize: 12, fontWeight: '700' },
});
