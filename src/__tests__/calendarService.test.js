jest.mock('expo-calendar', () => ({
  EntityTypes: { EVENT: 'event' },
  createEventAsync: jest.fn(),
  getCalendarsAsync: jest.fn(),
  getDefaultCalendarAsync: jest.fn(),
  requestCalendarPermissionsAsync: jest.fn(),
}));

import * as Calendar from 'expo-calendar';
import { addRaceToDeviceCalendar } from '../services/calendarService';

describe('calendarService', () => {
  const race = {
    id: 'race-1',
    name: 'Corrida PacePass',
    raceDate: '2030-05-10T08:00:00.000Z',
    distance: '10k',
    kitPickupLocation: 'Centro de convenções',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('cria evento no calendário padrão com os dados da prova', async () => {
    Calendar.requestCalendarPermissionsAsync.mockResolvedValue({
      status: 'granted',
    });
    Calendar.getDefaultCalendarAsync.mockResolvedValue({
      id: 'calendar-1',
      allowsModifications: true,
    });
    Calendar.createEventAsync.mockResolvedValue('event-1');

    await expect(addRaceToDeviceCalendar(race)).resolves.toEqual({
      added: true,
      eventId: 'event-1',
      calendarId: 'calendar-1',
    });

    expect(Calendar.createEventAsync).toHaveBeenCalledWith(
      'calendar-1',
      expect.objectContaining({
        title: 'Corrida PacePass',
        location: 'Centro de convenções',
        startDate: new Date(race.raceDate),
      }),
    );
  });

  it('não cria evento quando a permissão é negada', async () => {
    Calendar.requestCalendarPermissionsAsync.mockResolvedValue({
      status: 'denied',
    });

    await expect(addRaceToDeviceCalendar(race)).resolves.toEqual({
      added: false,
      reason: 'permission-denied',
    });
    expect(Calendar.createEventAsync).not.toHaveBeenCalled();
  });

  it('retorna erro claro quando não há calendário editável', async () => {
    Calendar.requestCalendarPermissionsAsync.mockResolvedValue({
      status: 'granted',
    });
    Calendar.getDefaultCalendarAsync.mockResolvedValue(null);
    Calendar.getCalendarsAsync.mockResolvedValue([]);

    await expect(addRaceToDeviceCalendar(race)).rejects.toThrow(
      'Nenhum calendário disponível para adicionar eventos.',
    );
  });
});
