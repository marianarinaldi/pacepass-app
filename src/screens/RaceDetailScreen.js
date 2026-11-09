import { StyleSheet, Text, View } from 'react-native';
export default function RaceDetailScreen({ route }) { const { race } = route.params; return <View style={styles.container}><Text style={styles.title}>{race.name}</Text><Text>{race.distance} km</Text><Text>Retirada: {race.kitPickupLocation}</Text><Text>{race.kitPickedUp ? 'Kit retirado' : 'Kit pendente'}</Text></View>; }
const styles = StyleSheet.create({ container: { flex: 1, gap: 12, padding: 20 }, title: { fontSize: 26, fontWeight: '700' } });
