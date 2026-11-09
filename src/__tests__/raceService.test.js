jest.mock('../config/firebaseConfig', () => ({ db: {} }));

jest.mock('firebase/firestore', () => ({
  addDoc: jest.fn(),
  collection: jest.fn((...parts) => parts.slice(1).join('/')),
  doc: jest.fn((...parts) => parts.slice(1).join('/')),
  getDocs: jest.fn(),
  orderBy: jest.fn((field, direction) => ({ field, direction })),
  query: jest.fn((...constraints) => ({ constraints })),
  serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP'),
  updateDoc: jest.fn(),
  where: jest.fn((field, operator, value) => ({ field, operator, value })),
}));

import { addDoc, getDocs, updateDoc } from 'firebase/firestore';
import {
  addRace,
  getRaceHistory,
  getUpcomingRaces,
  markKitAsPickedUp,
} from '../services/raceService';

const userId = 'user-123';
const raceData = {
  name: 'Corrida PacePass',
  raceDate: '2030-05-10T08:00:00.000Z',
  distance: 10,
};

describe('raceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adiciona uma corrida com timestamp e kit pendente', async () => {
    addDoc.mockResolvedValue({ id: 'race-1' });

    await expect(addRace(userId, raceData)).resolves.toMatchObject({
      id: 'race-1',
      ...raceData,
      isPickedUp: false,
    });
    expect(addDoc).toHaveBeenCalledWith(
      'users/user-123/races',
      { ...raceData, createdAt: 'SERVER_TIMESTAMP', isPickedUp: false },
    );
  });

  it('consulta próximas corridas ordenadas por raceDate', async () => {
    getDocs.mockResolvedValue({
      docs: [{ id: 'race-1', data: () => raceData }],
    });

    await expect(getUpcomingRaces(userId)).resolves.toEqual([
      { id: 'race-1', ...raceData },
    ]);
    expect(getDocs).toHaveBeenCalledTimes(1);
  });

  it('marca o kit da corrida como retirado', async () => {
    updateDoc.mockResolvedValue(undefined);

    await expect(markKitAsPickedUp(userId, 'race-1')).resolves.toEqual({
      id: 'race-1',
      isPickedUp: true,
    });
    expect(updateDoc).toHaveBeenCalledWith(
      'users/user-123/races/race-1',
      { isPickedUp: true },
    );
  });

  it('consulta apenas corridas com status completed', async () => {
    getDocs.mockResolvedValue({
      docs: [{ id: 'race-2', data: () => ({ ...raceData, status: 'completed' }) }],
    });

    await expect(getRaceHistory(userId)).resolves.toEqual([
      { id: 'race-2', ...raceData, status: 'completed' },
    ]);
  });

  it('converte falhas de rede em mensagens claras', async () => {
    getDocs.mockRejectedValue(new Error('network unavailable'));

    await expect(getUpcomingRaces(userId)).rejects.toThrow(
      'Não foi possível carregar as próximas corridas: network unavailable',
    );
  });
});
