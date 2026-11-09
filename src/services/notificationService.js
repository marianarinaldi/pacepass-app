import * as Notifications from 'expo-notifications';

function getDate(value, field) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${field} inválida.`);
  }
  return date;
}

export async function scheduleKitReminder(race) {
  try {
    if (!race || typeof race !== 'object') {
      throw new Error('Dados da prova são obrigatórios.');
    }

    const pickupEndDate = getDate(
      race.kitPickupEndDate,
      'A data de encerramento da retirada do kit',
    );
    const reminderDate = new Date(pickupEndDate.getTime() - 24 * 60 * 60 * 1000);

    if (reminderDate <= new Date()) {
      throw new Error('A véspera do encerramento da retirada já passou.');
    }

    const permission = await Notifications.requestPermissionsAsync();
    if (!permission.granted) {
      return { scheduled: false, reason: 'permission-denied' };
    }

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Retire o kit de ${race.name || 'sua prova'}`,
        body: `A retirada termina amanhã em ${race.kitPickupLocation || 'local informado na prova'}.`,
        data: { raceId: race.id || null, type: 'kit-reminder' },
      },
      trigger: {
        date: reminderDate,
      },
    });

    return { scheduled: true, identifier, reminderDate };
  } catch (error) {
    throw new Error(`Não foi possível agendar o lembrete do kit: ${error.message}`);
  }
}
