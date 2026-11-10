import { StyleSheet, Text, View } from 'react-native';
import theme from '../styles/theme';

export default function StatusBadge({ pickedUp }) {
  return (
    <View accessibilityLabel={pickedUp ? 'Kit Retirado' : 'Kit Pendente'} style={[styles.badge, pickedUp ? styles.done : styles.pending]}>
      <Text style={styles.text}>{pickedUp ? 'Kit Retirado' : 'Kit Pendente'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: theme.radii.pill, paddingHorizontal: 10, paddingVertical: 6 },
  done: { backgroundColor: theme.colors.successSoft },
  pending: { backgroundColor: theme.colors.accentSoft },
  text: { color: theme.colors.text, fontSize: 12, fontWeight: '700' },
});
