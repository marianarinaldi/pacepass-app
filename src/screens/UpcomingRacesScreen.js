import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Loading from '../components/Loading';
import RaceCard, { getDaysUntil } from '../components/RaceCard';
import { auth } from '../config/firebaseConfig';
import { getUpcomingRaces, markKitAsPickedUp } from '../services/raceService';
import theme from '../styles/theme';

export function isKitPickupAlert(race, now = new Date()) {
  if (race.isPickedUp || race.kitPickedUp) return false;
  const pickupDate = race.kitPickupStartDate || race.kitPickupDate;
  const daysUntilPickup = getDaysUntil(pickupDate, now);
  return daysUntilPickup >= 3 && daysUntilPickup <= 5;
}

export default function UpcomingRacesScreen({ navigation }) {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const loadedRaces = await getUpcomingRaces(auth.currentUser?.uid);
      setRaces([...loadedRaces].sort((a, b) => new Date(a.raceDate || a.startDate) - new Date(b.raceDate || b.startDate)));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  const alertRace = useMemo(() => races.find((race) => isKitPickupAlert(race)), [races]);

  const pickup = async (raceId) => {
    setUpdatingId(raceId);
    try {
      await markKitAsPickedUp(auth.currentUser?.uid, raceId);
      setRaces((items) => items.map((item) => item.id === raceId ? { ...item, isPickedUp: true, kitPickedUp: true } : item));
    } catch (pickupError) {
      Alert.alert('Não foi possível atualizar', pickupError.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>BOM TREINO, CORREDOR</Text>
            <Text accessibilityRole="header" style={styles.title}>Suas próximas provas</Text>
          </View>
          <View accessibilityLabel="Perfil do corredor" style={styles.avatar}><Feather color={theme.colors.primaryDark} name="user" size={22} /></View>
        </View>
        <Text style={styles.total}>{races.length} {races.length === 1 ? 'prova inscrita' : 'provas inscritas'}</Text>

        {!!alertRace && (
          <View accessibilityLiveRegion="polite" style={styles.alert}>
            <View style={styles.alertIcon}><Feather color={theme.colors.accent} name="package" size={20} /></View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Atenção ao kit</Text>
              <Text style={styles.alertText}>Retirada de {alertRace.name} em breve.</Text>
              <Text style={styles.alertDeadline}>{alertRace.kitPickupLocation || 'Local informado na prova'}</Text>
            </View>
          </View>
        )}
        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.error}>{error}</Text>
            <Pressable accessibilityLabel="Tentar carregar corridas novamente" onPress={load}><Text style={styles.retry}>Tentar novamente</Text></Pressable>
          </View>
        )}
        <FlatList
          contentContainerStyle={races.length === 0 ? styles.emptyList : styles.list}
          data={races}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={<EmptyState />}
          renderItem={({ item }) => (
            <View>
              <RaceCard
                now={new Date()}
                onMarkPickedUp={updatingId === item.id ? async () => {} : pickup}
                onPress={(race) => navigation.navigate('RaceDetail', { race })}
                race={item}
              />
              {updatingId === item.id && <ActivityIndicator accessibilityLabel="Atualizando kit" color={theme.colors.primary} style={styles.updating} />}
            </View>
          )}
        />
        <Pressable accessibilityLabel="Adicionar corrida" onPress={() => navigation.navigate('AddRace')} style={styles.add}>
          <Feather color={theme.colors.white} name="plus" size={19} />
          <Text style={styles.addText}>Adicionar prova</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}><Feather color={theme.colors.primary} name="flag" size={34} /></View>
      <Text style={styles.emptyTitle}>Tudo pronto para sua próxima largada?</Text>
      <Text style={styles.emptyText}>Cadastre uma prova e acompanhe cada etapa da sua corrida.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: theme.colors.background, flex: 1 },
  container: { flex: 1, paddingHorizontal: theme.spacing.lg },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingTop: theme.spacing.md },
  eyebrow: { color: theme.colors.primaryDark, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  title: { color: theme.colors.text, ...theme.typography.h1, marginTop: 4 },
  avatar: { alignItems: 'center', backgroundColor: theme.colors.primarySoft, borderRadius: theme.radii.pill, height: 46, justifyContent: 'center', width: 46 },
  total: { color: theme.colors.textMuted, ...theme.typography.body, marginBottom: theme.spacing.md, marginTop: 4 },
  alert: { backgroundColor: theme.colors.accentSoft, borderColor: '#FCD34D', borderRadius: theme.radii.md, borderWidth: 1, flexDirection: 'row', gap: 12, marginBottom: theme.spacing.md, padding: theme.spacing.md },
  alertIcon: { alignItems: 'center', backgroundColor: '#FEF3C7', borderRadius: theme.radii.sm, height: 38, justifyContent: 'center', width: 38 },
  alertContent: { flex: 1 },
  alertTitle: { color: '#92400E', ...theme.typography.h3 },
  alertText: { color: '#78350F', marginTop: 3 },
  alertDeadline: { color: '#92400E', fontSize: 13, fontWeight: '700', marginTop: 5 },
  errorBox: { backgroundColor: '#FEF2F2', borderRadius: theme.radii.sm, marginBottom: theme.spacing.md, padding: 12 },
  error: { color: '#991B1B' },
  retry: { color: theme.colors.primaryDark, fontWeight: '700', marginTop: 8 },
  list: { paddingBottom: theme.spacing.md },
  separator: { height: 0 },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  emptyState: { alignItems: 'center', paddingHorizontal: theme.spacing.md },
  emptyIcon: { alignItems: 'center', backgroundColor: theme.colors.primarySoft, borderRadius: 40, height: 72, justifyContent: 'center', marginBottom: theme.spacing.md, width: 72 },
  emptyTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  emptyText: { color: theme.colors.textMuted, lineHeight: 22, marginTop: 8, textAlign: 'center' },
  updating: { marginBottom: 8, marginTop: -8 },
  add: { alignItems: 'center', backgroundColor: theme.colors.primary, borderRadius: theme.radii.sm, flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: theme.spacing.sm, padding: 15 },
  addText: { color: theme.colors.white, fontWeight: '800' },
});
