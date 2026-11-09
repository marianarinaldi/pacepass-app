import * as Calendar from 'expo-calendar';

function getDate(value, field) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${field} inválida.`);
  }
  return date;
}

async function getWritableCalendar() {
  if (Calendar.getDefaultCalendarAsync) {
    const defaultCalendar = await Calendar.getDefaultCalendarAsync();
    if (defaultCalendar && defaultCalendar.allowsModifications !== false) {
      return defaultCalendar;
    }
  }

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const writableCalendar = calendars.find((calendar) => calendar.allowsModifications !== false);
  if (!writableCalendar) {
    throw new Error('Nenhum calendário disponível para adicionar eventos.');
  }
  return writableCalendar;
}

export async function addRaceToDeviceCalendar(race) {
  try {
    if (!race || typeof race !== 'object') {
      throw new Error('Dados da prova são obrigatórios.');
    }

    const startDate = getDate(race.raceDate || race.startDate, 'A data da largada');
    const permission = await Calendar.requestCalendarPermissionsAsync();
    if (permission.status !== 'granted') {
      return { added: false, reason: 'permission-denied' };
    }

    const calendar = await getWritableCalendar();
    const eventId = await Calendar.createEventAsync(calendar.id, {
      title: race.name || 'Prova PacePass',
      startDate,
      endDate: new Date(startDate.getTime() + 60 * 60 * 1000),
      location: race.location || race.kitPickupLocation || '',
      notes: race.distance ? `Distância: ${race.distance}` : undefined,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    return { added: true, eventId, calendarId: calendar.id };
  } catch (error) {
    throw new Error(`Não foi possível adicionar a prova ao calendário: ${error.message}`);
  }
}
