import { Pressable, StyleSheet, Text, View } from 'react-native';
import StatusBadge from './StatusBadge';

export function getRaceDateStatus(startDate, now = new Date()) {
  const date = new Date(startDate);
  if (Number.isNaN(date.getTime())) return 'invalid';
  if (date < now) return 'finished';
  return 'upcoming';
}

export default function RaceCard({ race, onPress, onMarkPickedUp }) {
  const start = new Date(race.startDate);
  const dateLabel = Number.isNaN(start.getTime()) ? 'Data inválida' : start.toLocaleDateString('pt-BR');
  const isPickedUp = race.isPickedUp || race.kitPickedUp;
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.name}>{race.name}</Text>
        <Text style={styles.details}>{race.distance} km · {dateLabel}</Text>
        <Text style={styles.location}>{race.kitPickupLocation}</Text>
      </View>
      <StatusBadge pickedUp={isPickedUp} />
      {onPress && (
        <Pressable accessibilityLabel={`Abrir detalhes de ${race.name}`} onPress={() => onPress(race)} style={styles.button}>
          <Text style={styles.detailsButton}>Ver detalhes</Text>
        </Pressable>
      )}
      {!isPickedUp && onMarkPickedUp && (
        <Pressable accessibilityLabel={`Marcar kit de ${race.name} como retirado`} onPress={() => onMarkPickedUp(race.id)} style={styles.pickupButton}>
          <Text style={styles.pickupText}>Marcar retirada</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF', borderRadius: 12, elevation: 2, flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4 },
  content: { flex: 1, minWidth: '60%' },
  name: { color: '#111827', fontSize: 17, fontWeight: '700' },
  details: { color: '#374151', marginTop: 6 },
  location: { color: '#6B7280', marginTop: 4 },
  button: { alignSelf: 'center', padding: 4 },
  detailsButton: { color: '#2563EB', fontWeight: '700' },
  pickupButton: { backgroundColor: '#EFF6FF', borderRadius: 8, padding: 9, width: '100%' },
  pickupText: { color: '#1D4ED8', fontWeight: '700', textAlign: 'center' },
});
