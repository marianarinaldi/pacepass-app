import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import StatusBadge from './StatusBadge';
import theme from '../styles/theme';

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
  if (typeof distance === 'string' && distance.toLowerCase().endsWith('k')) return distance.toUpperCase();
  return `${distance} KM`;
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
          <View style={styles.metaRow}>
            <Feather color={theme.colors.textMuted} name="calendar" size={15} />
            <Text style={styles.details}>{`${String(race.distance).toLowerCase()} · ${formatStartDate(startDate)}`}</Text>
          </View>
        </View>
        <View style={styles.distancePill}><Text style={styles.distanceText}>{formatDistance(race.distance)}</Text></View>
      </View>

      <View style={styles.infoRow}>
        <Text accessibilityLabel={`Contagem regressiva para ${race.name}`} style={styles.countdown}>{countdown}</Text>
        <StatusBadge pickedUp={isPickedUp} />
      </View>
      {!!race.kitPickupLocation && (
        <View style={styles.locationRow}>
          <Feather color={theme.colors.textMuted} name="map-pin" size={15} />
          <Text style={styles.location}>{race.kitPickupLocation}</Text>
        </View>
      )}

      <View style={styles.actions}>
        {onPress && (
          <Pressable
            accessibilityLabel={`Abrir detalhes de ${race.name}`}
            accessibilityRole="button"
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
            <Feather color={theme.colors.white} name="check-circle" size={17} />
            <Text style={styles.pickupText}>Marcar Kit como Retirado</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { ...theme.shadows.card, backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radii.lg, borderWidth: 1, marginBottom: theme.spacing.md, padding: theme.spacing.md },
  header: { alignItems: 'flex-start', flexDirection: 'row', gap: theme.spacing.sm },
  content: { flex: 1 },
  name: { color: theme.colors.text, ...theme.typography.h3 },
  metaRow: { alignItems: 'center', flexDirection: 'row', gap: 6, marginTop: 8 },
  details: { color: theme.colors.textMuted, ...theme.typography.caption },
  distancePill: { backgroundColor: theme.colors.background, borderRadius: theme.radii.pill, paddingHorizontal: 12, paddingVertical: 7 },
  distanceText: { color: theme.colors.text, fontSize: 12, fontWeight: '800' },
  infoRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.md },
  countdown: { color: theme.colors.primaryDark, fontSize: 15, fontWeight: '800' },
  locationRow: { alignItems: 'center', flexDirection: 'row', gap: 6, marginTop: 10 },
  location: { color: theme.colors.textMuted, ...theme.typography.caption },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: theme.spacing.md },
  detailsButton: { borderColor: theme.colors.border, borderRadius: theme.radii.sm, borderWidth: 1, padding: 11 },
  detailsButtonText: { color: theme.colors.primaryDark, fontWeight: '700' },
  pickupButton: { alignItems: 'center', backgroundColor: theme.colors.primary, borderRadius: theme.radii.sm, flex: 1, flexDirection: 'row', gap: 7, justifyContent: 'center', minWidth: 190, padding: 11 },
  pickupText: { color: theme.colors.white, fontWeight: '800' },
});
