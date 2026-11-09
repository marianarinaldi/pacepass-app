import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import StatusBadge from './StatusBadge';

export function getRaceDateStatus(startDate, now = new Date()) {
  const date = new Date(startDate);
  if (Number.isNaN(date.getTime())) return 'invalid';
  if (date < now) return 'finished';
  return 'upcoming';
}

export function getDaysUntil(dateValue, now = new Date()) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  const startOfDay = (value) => new Date(value.getFullYear(), value.getMonth(), value.getDate());
  return Math.ceil((startOfDay(date) - startOfDay(now)) / 86400000);
}

function formatStartDate(dateValue) {
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime())
    ? 'Data inválida'
    : date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDistance(distance) {
  if (typeof distance === 'string' && distance.toLowerCase().endsWith('k')) return distance;
  return `${distance} km`;
}

export default function RaceCard({ race, onPress, onMarkPickedUp, now = new Date() }) {
  const startDate = race.raceDate || race.startDate;
  const daysUntil = getDaysUntil(startDate, now);
  const isPickedUp = Boolean(race.isPickedUp || race.kitPickedUp);
  const countdown = daysUntil === null
    ? 'Data da prova indisponível'
    : daysUntil < 0
      ? 'Prova realizada'
      : daysUntil === 0
        ? 'É hoje'
        : `Em ${daysUntil} ${daysUntil === 1 ? 'dia' : 'dias'}`;

  const handlePickup = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await onMarkPickedUp(race.id);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.content}>
          <Text style={styles.name}>{race.name}</Text>
          <Text style={styles.details}>
            {formatDistance(race.distance)} · {formatStartDate(startDate)}
          </Text>
          {!!race.kitPickupLocation && <Text style={styles.location}>{race.kitPickupLocation}</Text>}
        </View>
        <StatusBadge pickedUp={isPickedUp} />
      </View>

      <Text accessibilityLabel={`Contagem regressiva para ${race.name}`} style={styles.countdown}>
        {countdown}
      </Text>

      <View style={styles.actions}>
        {onPress && (
          <Pressable
            accessibilityLabel={`Abrir detalhes de ${race.name}`}
            onPress={() => onPress(race)}
            style={styles.detailsButton}
          >
            <Text style={styles.detailsButtonText}>Ver detalhes</Text>
          </Pressable>
        )}
        {!isPickedUp && onMarkPickedUp && (
          <Pressable
            accessibilityLabel={`Marcar kit de ${race.name} como retirado`}
            accessibilityRole="button"
            onPress={handlePickup}
            style={styles.pickupButton}
          >
            <Text style={styles.pickupText}>Marcar Kit como Retirado</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    elevation: 3,
    marginBottom: 14,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  header: { alignItems: 'flex-start', flexDirection: 'row', gap: 12 },
  content: { flex: 1 },
  name: { color: '#0F172A', fontSize: 18, fontWeight: '800' },
  details: { color: '#334155', fontSize: 15, marginTop: 7 },
  location: { color: '#475569', marginTop: 5 },
  countdown: { color: '#1D4ED8', fontSize: 15, fontWeight: '800', marginTop: 14 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  detailsButton: { borderColor: '#2563EB', borderRadius: 8, borderWidth: 1, padding: 10 },
  detailsButtonText: { color: '#1D4ED8', fontWeight: '700' },
  pickupButton: { backgroundColor: '#1D4ED8', borderRadius: 8, flex: 1, minWidth: 180, padding: 11 },
  pickupText: { color: '#FFF', fontWeight: '800', textAlign: 'center' },
});
