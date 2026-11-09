import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { auth } from '../config/firebaseConfig';
import { addRace } from '../services/raceService';

const initialForm = { name: '', distance: '', startDate: new Date(), kitPickupStartDate: new Date(), kitPickupEndDate: new Date(), kitPickupLocation: '', receiptUri: null };
const labels = { name: 'Nome da corrida', distance: 'Distância (km)', kitPickupLocation: 'Local de retirada' };

export default function AddRaceScreen({ navigation }) {
  const [form, setForm] = useState(initialForm);
  const [dateField, setDateField] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const chooseReceipt = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { setError('Permissão para acessar fotos não concedida.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled) update('receiptUri', result.assets[0].uri);
  };
  const save = async () => {
    setError('');
    if (Object.entries(labels).some(([key, label]) => !String(form[key]).trim())) { setError('Preencha todos os campos obrigatórios.'); return; }
    setSaving(true);
    try {
      await addRace(auth.currentUser?.uid, {
        ...form,
        raceDate: form.startDate.toISOString(),
        status: 'upcoming',
      });
      Alert.alert('Sucesso', 'Corrida adicionada.');
      navigation.goBack();
    }
    catch (saveError) { setError(saveError.message); }
    finally { setSaving(false); }
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Nova corrida</Text>
      {Object.entries(labels).map(([key, label]) => (
        <View key={key} style={styles.field}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} style={styles.input} value={String(form[key])} onChangeText={(value) => update(key, value)} keyboardType={key === 'distance' ? 'decimal-pad' : 'default'} /></View>
      ))}
      {[['startDate', 'Data da largada'], ['kitPickupStartDate', 'Início da retirada'], ['kitPickupEndDate', 'Fim da retirada']].map(([key, label]) => (
        <View key={key} style={styles.field}><Text style={styles.label}>{label}</Text><Pressable accessibilityLabel={`Selecionar ${label}`} style={styles.dateButton} onPress={() => setDateField(key)}><Text>{form[key].toLocaleDateString('pt-BR')}</Text></Pressable></View>
      ))}
      {dateField && <DateTimePicker value={form[dateField]} mode="date" onChange={(_, date) => { setDateField(null); if (date) update(dateField, date); }} />}
      <Pressable accessibilityLabel="Selecionar foto do comprovante" style={styles.secondary} onPress={chooseReceipt}><Text>Adicionar comprovante</Text></Pressable>
      {form.receiptUri && <Image source={{ uri: form.receiptUri }} style={styles.preview} />}
      {!!error && <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
      <Pressable accessibilityLabel="Salvar corrida" disabled={saving} style={styles.save} onPress={save}><Text style={styles.saveText}>{saving ? 'Salvando...' : 'Salvar corrida'}</Text></Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({ container: { padding: 20 }, title: { fontSize: 26, fontWeight: '700', marginBottom: 20 }, field: { marginBottom: 14 }, label: { fontWeight: '600', marginBottom: 6 }, input: { borderColor: '#D1D5DB', borderRadius: 8, borderWidth: 1, padding: 12 }, dateButton: { backgroundColor: '#F3F4F6', borderRadius: 8, padding: 13 }, secondary: { alignItems: 'center', borderColor: '#2563EB', borderRadius: 8, borderWidth: 1, marginVertical: 8, padding: 13 }, preview: { borderRadius: 8, height: 140, marginBottom: 8, width: '100%' }, error: { color: '#B91C1C', marginVertical: 10 }, save: { alignItems: 'center', backgroundColor: '#2563EB', borderRadius: 8, marginTop: 8, padding: 14 }, saveText: { color: '#FFF', fontWeight: '700' } });
