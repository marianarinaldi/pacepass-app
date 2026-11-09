import { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addRaceToDeviceCalendar } from '../services/calendarService';

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Data indisponível'
    : date.toLocaleString('pt-BR');
}

export default function RaceDetailScreen({ route }) {
  const { race } = route.params;
  const [calendarState, setCalendarState] = useState('idle');
  const [calendarMessage, setCalendarMessage] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);

  const addToCalendar = async () => {
    setCalendarState('loading');
    setCalendarMessage('');
    try {
      const result = await addRaceToDeviceCalendar(race);
      if (!result.added) {
        setCalendarState('error');
        setCalendarMessage('Permissão de calendário não concedida.');
        return;
      }
      setCalendarState('success');
      setCalendarMessage('Prova adicionada ao calendário do telemóvel.');
    } catch (error) {
      setCalendarState('error');
      setCalendarMessage(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text accessibilityRole="header" style={styles.title}>{race.name}</Text>
        <View style={styles.summary}>
          <Detail label="Distância" value={race.distance ? `${race.distance}` : 'Não informada'} />
          <Detail label="Largada" value={formatDate(race.raceDate || race.startDate)} />
          <Detail label="Retirada do kit" value={`${formatDate(race.kitPickupStartDate)} até ${formatDate(race.kitPickupEndDate)}`} />
          <Detail label="Local de retirada" value={race.kitPickupLocation || 'Não informado'} />
          <Detail label="Plataforma de inscrição" value={race.registrationPlatform || 'Não informada'} />
          <Detail label="Status do kit" value={race.isPickedUp || race.kitPickedUp ? 'Kit retirado' : 'Kit pendente'} />
        </View>

        {race.receiptUri && (
          <Pressable accessibilityLabel="Abrir comprovativo em ecrã inteiro" onPress={() => setPreviewVisible(true)}>
            <Text style={styles.sectionTitle}>Comprovativo de inscrição</Text>
            <Image accessibilityLabel="Foto do comprovativo" source={{ uri: race.receiptUri }} style={styles.receipt} />
            <Text style={styles.previewHint}>Toque para ampliar</Text>
          </Pressable>
        )}

        <Pressable
          accessibilityLabel="Adicionar ao Calendário do Telemóvel"
          disabled={calendarState === 'loading' || calendarState === 'success'}
          onPress={addToCalendar}
          style={[styles.calendarButton, calendarState === 'success' && styles.successButton]}
        >
          <Text style={styles.calendarButtonText}>
            {calendarState === 'loading'
              ? 'Adicionando...'
              : calendarState === 'success'
                ? 'Adicionado ao calendário'
                : 'Adicionar ao Calendário do Telemóvel'}
          </Text>
        </Pressable>
        {!!calendarMessage && (
          <Text accessibilityLiveRegion="polite" style={calendarState === 'error' ? styles.error : styles.successMessage}>
            {calendarMessage}
          </Text>
        )}
      </ScrollView>

      <Modal animationType="fade" transparent={false} visible={previewVisible} onRequestClose={() => setPreviewVisible(false)}>
        <View style={styles.fullscreen}>
          <Pressable accessibilityLabel="Fechar comprovativo" onPress={() => setPreviewVisible(false)} style={styles.closeButton}>
            <Text style={styles.closeText}>Fechar</Text>
          </Pressable>
          <Image resizeMode="contain" source={{ uri: race.receiptUri }} style={styles.fullscreenImage} />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Detail({ label, value }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F8FAFC', flex: 1 },
  container: { padding: 20 },
  title: { color: '#0F172A', fontSize: 28, fontWeight: '800', marginBottom: 20 },
  summary: { backgroundColor: '#FFF', borderRadius: 12, marginBottom: 20, padding: 16 },
  detail: { borderBottomColor: '#E2E8F0', borderBottomWidth: 1, paddingVertical: 11 },
  detailLabel: { color: '#475569', fontSize: 13, fontWeight: '700' },
  detailValue: { color: '#0F172A', fontSize: 16, marginTop: 4 },
  sectionTitle: { color: '#0F172A', fontSize: 18, fontWeight: '800', marginBottom: 10 },
  receipt: { backgroundColor: '#E2E8F0', borderRadius: 10, height: 220, width: '100%' },
  previewHint: { color: '#475569', marginVertical: 8, textAlign: 'center' },
  calendarButton: { alignItems: 'center', backgroundColor: '#1D4ED8', borderRadius: 9, marginTop: 12, padding: 15 },
  successButton: { backgroundColor: '#15803D' },
  calendarButtonText: { color: '#FFF', fontWeight: '800', textAlign: 'center' },
  successMessage: { color: '#166534', marginTop: 10, textAlign: 'center' },
  error: { color: '#B91C1C', marginTop: 10, textAlign: 'center' },
  fullscreen: { alignItems: 'center', backgroundColor: '#000', flex: 1, justifyContent: 'center' },
  fullscreenImage: { height: '85%', width: '100%' },
  closeButton: { padding: 16, position: 'absolute', right: 12, top: 40, zIndex: 1 },
  closeText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
