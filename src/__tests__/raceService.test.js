jest.mock('../config/firebaseConfig', () => ({
  auth: { currentUser: { uid: 'user-1' } },
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  addDoc: jest.fn(async () => ({ id: 'race-1' })),
  collection: jest.fn(() => 'races'),
  deleteDoc: jest.fn(async () => undefined),
  doc: jest.fn(() => 'race-ref'),
  getDocs: jest.fn(async () => ({ docs: [{ id: 'race-1', data: () => ({ name: 'Corrida' }) }] })),
  orderBy: jest.fn(),
  query: jest.fn(),
  serverTimestamp: jest.fn(() => 'timestamp'),
  updateDoc: jest.fn(async () => undefined),
  where: jest.fn(),
}));

import { addDoc, getDocs, updateDoc } from 'firebase/firestore';
import { addRace, getUpcomingRaces, markKitAsPickedUp } from '../services/raceService';

const validRace = {
  name: '  Corrida da Cidade ',
  distance: '10',
  startDate: '2030-01-02T10:00:00.000Z',
  kitPickupStartDate: '2030-01-01T10:00:00.000Z',
  kitPickupEndDate: '2030-01-02T10:00:00.000Z',
  kitPickupLocation: 'Centro de convenções',
};

describe('raceService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('valida, sanitiza e adiciona uma corrida', async () => {
    const result = await addRace(validRace);
    expect(addDoc).toHaveBeenCalled();
    expect(result).toMatchObject({ id: 'race-1', name: 'Corrida da Cidade', distance: 10, kitPickedUp: false });
  });

  it('carrega somente as corridas futuras do usuário', async () => {
    await expect(getUpcomingRaces()).resolves.toEqual([{ id: 'race-1', name: 'Corrida' }]);
    expect(getDocs).toHaveBeenCalledTimes(1);
  });

  it('marca o kit como retirado', async () => {
    await expect(markKitAsPickedUp('race-1')).resolves.toEqual({ id: 'race-1', kitPickedUp: true });
    expect(updateDoc).toHaveBeenCalledTimes(1);
  });

  it('rejeita datas de retirada inconsistentes', async () => {
    await expect(addRace({ ...validRace, kitPickupEndDate: '2029-01-01' })).rejects.toThrow('fim da retirada');
  });
});
