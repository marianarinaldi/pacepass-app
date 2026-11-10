import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../config/firebaseConfig';
import { scheduleKitReminder } from '../services/notificationService';
import { addRace } from '../services/raceService';
import theme from '../styles/theme';

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

  const openPicker = (field, mode, step = mode) => setPicker({ field, mode, step });

  const handlePickerValueChange = (_, selectedDate) => {
    const currentPicker = picker;
    if (!selectedDate || !currentPicker) return;

    if (currentPicker.step === 'date' && currentPicker.field === 'startDate') {
      if (Platform.OS === 'android') {
        update('startDate', selectedDate);
        setPicker({ field: 'startDate', mode: 'time', step: 'time' });
        return;
      }
    }

    if (currentPicker.step === 'time' && currentPicker.field === 'startDate') {
      const baseDate = form.startDate || new Date();
      const combinedDate = new Date(baseDate);
      combinedDate.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
      update('startDate', combinedDate);
      setPicker(null);
      return;
    }

    update(currentPicker.field, selectedDate);
    setPicker(null);
  };

  const dismissPicker = () => setPicker(null);

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
    const raceToSave = {
      name: form.name.trim(),
      distance: form.distance,
      raceDate: form.startDate.toISOString(),
      kitPickupStartDate: form.kitPickupStartDate.toISOString(),
      kitPickupEndDate: form.kitPickupEndDate.toISOString(),
      kitPickupLocation: form.kitPickupLocation.trim(),
      registrationPlatform: form.registrationPlatform.trim(),
      receiptUri: form.receiptUri,
      status: 'upcoming',
    };
    try {
      const savedRace = await addRace(auth.currentUser?.uid, raceToSave);
      let message = 'Prova adicionada ao PacePass.';
      try {
        const reminder = await scheduleKitReminder({ ...raceToSave, id: savedRace.id });
        if (!reminder.scheduled) {
          message += ' O lembrete não foi ativado porque a permissão foi recusada.';
        }
      } catch (notificationError) {
        message += ` ${notificationError.message}`;
      }
      Alert.alert('Sucesso', message, [
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
        <Text style={styles.intro}>Registre sua próxima conquista.</Text>

        <SectionTitle icon="flag" title="Dados da prova" />
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
          onPress={() => openPicker(
            'startDate',
            Platform.OS === 'android' ? 'date' : 'datetime',
            'date',
          )}
          value={formatDate(form.startDate)}
          icon="clock"
        />
        <SectionTitle icon="package" title="Janela do kit" />
        <DateField
          accessibilityLabel="Início da retirada do kit"
          error={errors.kitPickupStartDate}
          label="Início da retirada do kit *"
          onPress={() => openPicker('kitPickupStartDate', 'date')}
          value={formatDate(form.kitPickupStartDate)}
          icon="calendar"
        />
        <DateField
          accessibilityLabel="Fim da retirada do kit"
          error={errors.kitPickupEndDate}
          label="Fim da retirada do kit *"
          onPress={() => openPicker('kitPickupEndDate', 'date')}
          value={formatDate(form.kitPickupEndDate)}
          icon="calendar"
        />

        {picker && (
          <DateTimePicker
            mode={picker.mode}
            onDismiss={dismissPicker}
            onValueChange={handlePickerValueChange}
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
          icon="map-pin"
        />
        <TextField
          field="registrationPlatform"
          label="Plataforma de inscrição *"
          onChange={update}
          placeholder="Ex.: Ticket Sports"
          value={form.registrationPlatform}
          error={errors.registrationPlatform}
          icon="link"
        />

        <SectionTitle icon="image" title="Comprovante" />
        {form.receiptUri ? (
          <View style={styles.previewWrap}>
            <Image accessibilityLabel="Pré-visualização do comprovativo" source={{ uri: form.receiptUri }} style={styles.preview} />
            <View style={styles.previewActions}>
              <Text style={styles.previewLabel}>Comprovante anexado</Text>
              <View style={styles.previewButtons}>
                <Pressable accessibilityLabel="Trocar comprovativo" onPress={selectReceipt} style={styles.smallButton}>
                  <Feather color={theme.colors.primaryDark} name="refresh-cw" size={15} />
                  <Text style={styles.smallButtonText}>Trocar</Text>
                </Pressable>
                <Pressable accessibilityLabel="Remover comprovativo" onPress={() => update('receiptUri', null)} style={styles.removeButton}>
                  <Feather color={theme.colors.danger} name="trash-2" size={15} />
                  <Text style={styles.removeText}>Remover</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : (
          <Pressable accessibilityLabel="Adicionar comprovativo de inscrição" onPress={selectReceipt} style={styles.dropzone}>
            <View style={styles.uploadIcon}><Feather color={theme.colors.primary} name="upload-cloud" size={24} /></View>
            <Text style={styles.dropzoneTitle}>Adicione seu comprovante</Text>
            <Text style={styles.dropzoneText}>Tire uma foto ou escolha da galeria</Text>
          </Pressable>
        )}

        {!!errors.form && <Text accessibilityLiveRegion="polite" style={styles.error}>{errors.form}</Text>}
        <Pressable accessibilityLabel="Salvar prova" disabled={saving} onPress={save} style={[styles.saveButton, saving && styles.disabledButton]}>
          <Text style={styles.saveText}>{saving ? 'Salvando...' : 'Salvar prova'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ icon, title }) {
  return <View style={styles.sectionTitle}><Feather color={theme.colors.primaryDark} name={icon} size={17} /><Text style={styles.sectionText}>{title}</Text></View>;
}

function DateField({ accessibilityLabel, error, icon, label, onPress, value }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable accessibilityLabel={accessibilityLabel} onPress={onPress} style={styles.dateButton}>
        <Feather color={theme.colors.textMuted} name={icon} size={17} />
        <Text style={value.startsWith('Selecionar') ? styles.placeholder : styles.dateText}>{value}</Text>
      </Pressable>
      {!!error && <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
    </View>
  );
}

function TextField({ error, field, icon, label, onChange, placeholder, value }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <Feather color={theme.colors.textMuted} name={icon} size={17} />
        <TextInput
          accessibilityLabel={label.replace(' *', '')}
          onChangeText={(text) => onChange(field, text)}
          placeholder={placeholder}
          style={styles.input}
          value={value}
        />
      </View>
      {!!error && <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: theme.colors.background, flex: 1 },
  container: { padding: theme.spacing.lg },
  title: { color: theme.colors.text, ...theme.typography.h1 },
  intro: { color: theme.colors.textMuted, marginBottom: theme.spacing.lg, marginTop: 5 },
  sectionTitle: { alignItems: 'center', flexDirection: 'row', gap: 8, marginBottom: theme.spacing.md, marginTop: theme.spacing.sm },
  sectionText: { color: theme.colors.text, ...theme.typography.h3 },
  field: { marginBottom: theme.spacing.md },
  label: { color: theme.colors.text, ...theme.typography.caption, ...theme.typography.bold, marginBottom: 7 },
  inputWrap: { alignItems: 'center', backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radii.sm, borderWidth: 1, flexDirection: 'row', gap: 10, paddingHorizontal: 13 },
  input: { flex: 1, paddingVertical: 13 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderColor: theme.colors.border, borderRadius: theme.radii.pill, borderWidth: 1, paddingHorizontal: 18, paddingVertical: 10 },
  selectedChip: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { color: theme.colors.textMuted, fontWeight: '700' },
  selectedChipText: { color: theme.colors.white },
  dateButton: { alignItems: 'center', backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radii.sm, borderWidth: 1, flexDirection: 'row', gap: 10, padding: 13 },
  dateText: { color: theme.colors.text },
  placeholder: { color: theme.colors.textMuted },
  error: { color: theme.colors.danger, fontSize: 13, marginTop: 5 },
  dropzone: { alignItems: 'center', backgroundColor: theme.colors.surface, borderColor: theme.colors.primary, borderRadius: theme.radii.md, borderStyle: 'dashed', borderWidth: 1.5, marginBottom: theme.spacing.md, padding: theme.spacing.lg },
  uploadIcon: { alignItems: 'center', backgroundColor: theme.colors.primarySoft, borderRadius: theme.radii.pill, height: 48, justifyContent: 'center', marginBottom: 8, width: 48 },
  dropzoneTitle: { color: theme.colors.text, fontWeight: '800' },
  dropzoneText: { color: theme.colors.textMuted, fontSize: 13, marginTop: 4 },
  previewWrap: { backgroundColor: theme.colors.surface, borderRadius: theme.radii.md, marginBottom: theme.spacing.md, overflow: 'hidden' },
  preview: { height: 180, width: '100%' },
  previewActions: { padding: 12 },
  previewLabel: { color: theme.colors.text, fontWeight: '700' },
  previewButtons: { flexDirection: 'row', gap: 10, marginTop: 10 },
  smallButton: { alignItems: 'center', borderColor: theme.colors.border, borderRadius: theme.radii.sm, borderWidth: 1, flexDirection: 'row', gap: 5, padding: 8 },
  smallButtonText: { color: theme.colors.primaryDark, fontWeight: '700' },
  removeButton: { alignItems: 'center', borderColor: '#FECACA', borderRadius: theme.radii.sm, borderWidth: 1, flexDirection: 'row', gap: 5, padding: 8 },
  removeText: { color: theme.colors.danger, fontWeight: '700' },
  saveButton: { alignItems: 'center', backgroundColor: theme.colors.primary, borderRadius: theme.radii.sm, padding: 15 },
  disabledButton: { opacity: 0.6 },
  saveText: { color: theme.colors.white, fontWeight: '800' },
});
