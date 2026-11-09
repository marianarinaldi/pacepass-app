import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Loading from '../components/Loading';
import RaceCard from '../components/RaceCard';
import { auth } from '../config/firebaseConfig';
import { getUpcomingRaces, markKitAsPickedUp } from '../services/raceService';

export default function UpcomingRacesScreen({ navigation }) {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try { setRaces(await getUpcomingRaces(auth.currentUser?.uid)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const pickup = async (id) => {
    try {
      await markKitAsPickedUp(auth.currentUser?.uid, id);
      setRaces((items) => items.map((item) => item.id === id ? { ...item, isPickedUp: true, kitPickedUp: true } : item));
    } catch (e) { Alert.alert('Erro', e.message); }
  };
  if (loading) return <Loading />;
  return <View style={styles.container}><Text style={styles.title}>Próximas corridas</Text>{!!error && <Text style={styles.error}>{error}</Text>}<FlatList data={races} keyExtractor={(item) => item.id} renderItem={({ item }) => <RaceCard race={item} onPress={(race) => navigation.navigate('RaceDetail', { race })} onMarkPickedUp={pickup} />} ListEmptyComponent={<Text>Nenhuma corrida cadastrada.</Text>} /><Pressable accessibilityLabel="Adicionar corrida" style={styles.add} onPress={() => navigation.navigate('AddRace')}><Text style={styles.addText}>+ Adicionar corrida</Text></Pressable></View>;
}
const styles = StyleSheet.create({ container: { flex: 1, padding: 20 }, title: { fontSize: 26, fontWeight: '700', marginBottom: 16 }, error: { color: '#B91C1C', marginBottom: 12 }, add: { alignItems: 'center', backgroundColor: '#2563EB', borderRadius: 8, padding: 14 }, addText: { color: '#FFF', fontWeight: '700' } });
