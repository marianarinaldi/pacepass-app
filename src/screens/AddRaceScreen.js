import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../config/firebaseConfig';
import { addRace } from '../services/raceService';

const DISTANCES = ['5k', '10k', '21k', '42k'];
const initialForm = {
  name: '',
  distance: '',
  startDate: null,
  kitPickupStartDate: null,
  kitPickupEndDate: null,
  kitPickupLocation: '',
  registrationPlatform: '',
  receiptUri: null,
};

function formatDate(value) {
  return value ? value.toLocaleString('pt-BR') : 'Selecionar data e hora';
}

export default function AddRaceScreen({ navigation }) {
  const [form, setForm] = useState(initialForm);
  const [picker, setPicker] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Informe o nome da prova.';
    if (!form.distance) nextErrors.distance = 'Selecione uma distância.';
    if (!form.startDate) nextErrors.startDate = 'Informe a data e hora da largada.';
    if (!form.kitPickupStartDate) nextErrors.kitPickupStartDate = 'Informe o início da retirada.';
    if (!form.kitPickupEndDate) nextErrors.kitPickupEndDate = 'Informe o fim da retirada.';
    if (!form.kitPickupLocation.trim()) nextErrors.kitPickupLocation = 'Informe o local de retirada.';
    if (!form.registrationPlatform.trim()) nextErrors.registrationPlatform = 'Informe a plataforma de inscrição.';

    if (form.kitPickupStartDate && form.kitPickupEndDate
      && form.kitPickupEndDate < form.kitPickupStartDate) {
      nextErrors.kitPickupEndDate = 'O fim da retirada deve ser posterior ao início.';
    }
    if (form.startDate && form.kitPickupEndDate
      && form.kitPickupEndDate > form.startDate) {
      nextErrors.kitPickupEndDate = 'A retirada deve terminar até a data da prova.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const openPicker = (field, mode) => setPicker({ field, mode });

  const handlePickerChange = (_, selectedDate) => {
    const currentPicker = picker;
    setPicker(null);
    if (selectedDate && currentPicker) update(currentPicker.field, selectedDate);
  };

  const selectReceipt = () => {
    Alert.alert('Comprovativo de inscrição', 'Escolha uma opção', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Câmara', onPress: takePhoto },
      { text: 'Galeria', onPress: chooseFromGallery },
    ]);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setErrors({ form: 'Permissão para usar a câmara não concedida.' });
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) update('receiptUri', result.assets[0].uri);
  };

  const chooseFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setErrors({ form: 'Permissão para acessar a galeria não concedida.' });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled) update('receiptUri', result.assets[0].uri);
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await addRace(auth.currentUser?.uid, {
        name: form.name.trim(),
        distance: form.distance,
        raceDate: form.startDate.toISOString(),
        kitPickupStartDate: form.kitPickupStartDate.toISOString(),
        kitPickupEndDate: form.kitPickupEndDate.toISOString(),
        kitPickupLocation: form.kitPickupLocation.trim(),
        registrationPlatform: form.registrationPlatform.trim(),
        receiptUri: form.receiptUri,
        status: 'upcoming',
      });
      Alert.alert('Sucesso', 'Prova adicionada ao PacePass.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setSaving(false);
    }
  };

  const fieldError = (field) => errors[field] && (
    <Text accessibilityLiveRegion="polite" style={styles.error}>{errors[field]}</Text>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text accessibilityRole="header" style={styles.title}>Nova prova</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Nome da prova *</Text>
          <TextInput
            accessibilityLabel="Nome da Prova"
            autoCapitalize="sentences"
            onChangeText={(value) => update('name', value)}
            placeholder="Ex.: Corrida de Brasília"
            style={styles.input}
            value={form.name}
          />
          {fieldError('name')}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Distância *</Text>
          <View style={styles.chips}>
            {DISTANCES.map((distance) => (
              <Pressable
                accessibilityLabel={`Distância ${distance}`}
                accessibilityRole="radio"
                accessibilityState={{ selected: form.distance === distance }}
                key={distance}
                onPress={() => update('distance', distance)}
                style={[styles.chip, form.distance === distance && styles.selectedChip]}
              >
                <Text style={[styles.chipText, form.distance === distance && styles.selectedChipText]}>
                  {distance}
                </Text>
              </Pressable>
            ))}
          </View>
          {fieldError('distance')}
        </View>

        <DateField
          accessibilityLabel="Data e hora da largada"
          error={errors.startDate}
          label="Data/hora da largada *"
          onPress={() => openPicker('startDate', 'datetime')}
          value={formatDate(form.startDate)}
        />
        <DateField
          accessibilityLabel="Início da retirada do kit"
          error={errors.kitPickupStartDate}
          label="Início da retirada do kit *"
          onPress={() => openPicker('kitPickupStartDate', 'date')}
          value={formatDate(form.kitPickupStartDate)}
        />
        <DateField
          accessibilityLabel="Fim da retirada do kit"
          error={errors.kitPickupEndDate}
          label="Fim da retirada do kit *"
          onPress={() => openPicker('kitPickupEndDate', 'date')}
          value={formatDate(form.kitPickupEndDate)}
        />

        {picker && (
          <DateTimePicker
            mode={picker.mode}
            onChange={handlePickerChange}
            value={form[picker.field] || new Date()}
          />
        )}

        <TextField
          field="kitPickupLocation"
          label="Local de retirada do kit *"
          onChange={update}
          placeholder="Ex.: Shopping principal"
          value={form.kitPickupLocation}
          error={errors.kitPickupLocation}
        />
        <TextField
          field="registrationPlatform"
          label="Plataforma de inscrição *"
          onChange={update}
          placeholder="Ex.: Ticket Sports"
          value={form.registrationPlatform}
          error={errors.registrationPlatform}
        />

        <Pressable accessibilityLabel="Adicionar comprovativo de inscrição" onPress={selectReceipt} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Adicionar comprovativo</Text>
        </Pressable>
        {form.receiptUri && <Image accessibilityLabel="Pré-visualização do comprovativo" source={{ uri: form.receiptUri }} style={styles.preview} />}

        {!!errors.form && <Text accessibilityLiveRegion="polite" style={styles.error}>{errors.form}</Text>}
        <Pressable accessibilityLabel="Salvar prova" disabled={saving} onPress={save} style={[styles.saveButton, saving && styles.disabledButton]}>
          <Text style={styles.saveText}>{saving ? 'Salvando...' : 'Salvar prova'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function DateField({ accessibilityLabel, error, label, onPress, value }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable accessibilityLabel={accessibilityLabel} onPress={onPress} style={styles.dateButton}>
        <Text style={value.startsWith('Selecionar') ? styles.placeholder : styles.dateText}>{value}</Text>
      </Pressable>
      {!!error && <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
    </View>
  );
}

function TextField({ error, field, label, onChange, placeholder, value }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label.replace(' *', '')}
        onChangeText={(text) => onChange(field, text)}
        placeholder={placeholder}
        style={styles.input}
        value={value}
      />
      {!!error && <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F8FAFC', flex: 1 },
  container: { padding: 20 },
  title: { color: '#111827', fontSize: 28, fontWeight: '700', marginBottom: 22 },
  field: { marginBottom: 16 },
  label: { color: '#1F2937', fontSize: 15, fontWeight: '600', marginBottom: 7 },
  input: { backgroundColor: '#FFF', borderColor: '#CBD5E1', borderRadius: 8, borderWidth: 1, padding: 13 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderColor: '#2563EB', borderRadius: 18, borderWidth: 1, paddingHorizontal: 18, paddingVertical: 10 },
  selectedChip: { backgroundColor: '#2563EB' },
  chipText: { color: '#1D4ED8', fontWeight: '700' },
  selectedChipText: { color: '#FFF' },
  dateButton: { backgroundColor: '#FFF', borderColor: '#CBD5E1', borderRadius: 8, borderWidth: 1, padding: 13 },
  dateText: { color: '#111827' },
  placeholder: { color: '#64748B' },
  error: { color: '#B91C1C', fontSize: 13, marginTop: 5 },
  secondaryButton: { alignItems: 'center', borderColor: '#2563EB', borderRadius: 8, borderWidth: 1, marginBottom: 12, padding: 13 },
  secondaryButtonText: { color: '#1D4ED8', fontWeight: '700' },
  preview: { borderRadius: 8, height: 160, marginBottom: 12, width: '100%' },
  saveButton: { alignItems: 'center', backgroundColor: '#2563EB', borderRadius: 8, padding: 15 },
  disabledButton: { opacity: 0.6 },
  saveText: { color: '#FFF', fontWeight: '700' },
});
