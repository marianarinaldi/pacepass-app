import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Loading from '../components/Loading';
import RaceCard, { getDaysUntil } from '../components/RaceCard';
import { auth } from '../config/firebaseConfig';
import { getUpcomingRaces, markKitAsPickedUp } from '../services/raceService';

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
      setRaces((items) => items.map((item) => (
        item.id === raceId ? { ...item, isPickedUp: true, kitPickedUp: true } : item
      )));
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
        <Text accessibilityRole="header" style={styles.title}>Próximas corridas</Text>
        {!!alertRace && (
          <View accessibilityLiveRegion="polite" style={styles.alert}>
            <Text style={styles.alertTitle}>Atenção: retirada de kit próxima</Text>
            <Text style={styles.alertText}>
              Retire o kit de {alertRace.name} nos próximos dias.
            </Text>
          </View>
        )}
        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.error}>{error}</Text>
            <Pressable accessibilityLabel="Tentar carregar corridas novamente" onPress={load}>
              <Text style={styles.retry}>Tentar novamente</Text>
            </Pressable>
          </View>
        )}
        <FlatList
          contentContainerStyle={races.length === 0 ? styles.emptyList : undefined}
          data={races}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.empty}>Nenhuma corrida cadastrada</Text>}
          renderItem={({ item }) => (
            <View>
              <RaceCard
                now={new Date()}
                onMarkPickedUp={updatingId === item.id ? async () => {} : pickup}
                onPress={(race) => navigation.navigate('RaceDetail', { race })}
                race={item}
              />
              {updatingId === item.id && <ActivityIndicator accessibilityLabel="Atualizando kit" color="#1D4ED8" style={styles.updating} />}
            </View>
          )}
        />
        <Pressable accessibilityLabel="Adicionar corrida" onPress={() => navigation.navigate('AddRace')} style={styles.add}>
          <Text style={styles.addText}>+ Adicionar corrida</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F8FAFC', flex: 1 },
  container: { flex: 1, padding: 20 },
  title: { color: '#0F172A', fontSize: 28, fontWeight: '800', marginBottom: 16 },
  alert: { backgroundColor: '#FFFBEB', borderColor: '#F59E0B', borderRadius: 12, borderWidth: 1, marginBottom: 16, padding: 14 },
  alertTitle: { color: '#92400E', fontSize: 16, fontWeight: '800' },
  alertText: { color: '#78350F', marginTop: 5 },
  errorBox: { backgroundColor: '#FEF2F2', borderRadius: 8, marginBottom: 12, padding: 12 },
  error: { color: '#991B1B' },
  retry: { color: '#1D4ED8', fontWeight: '700', marginTop: 8 },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  empty: { color: '#475569', fontSize: 16, textAlign: 'center' },
  updating: { marginTop: -8, marginBottom: 8 },
  add: { alignItems: 'center', backgroundColor: '#1D4ED8', borderRadius: 9, padding: 15 },
  addText: { color: '#FFF', fontWeight: '800' },
});
