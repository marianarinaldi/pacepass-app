import { db } from '../config/firebaseConfig';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

const racesCollection = (userId) => collection(db, 'users', userId, 'races');
const raceDocument = (userId, raceId) => doc(db, 'users', userId, 'races', raceId);

function assertIdentifier(value, field) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${field} é obrigatório.`);
  }
}

function errorMessage(error) {
  return error instanceof Error ? error.message : 'erro desconhecido';
}

export async function addRace(userId, raceData) {
  try {
    assertIdentifier(userId, 'O identificador do utilizador');
    if (!raceData || typeof raceData !== 'object') {
      throw new Error('Os dados da corrida são obrigatórios.');
    }

    const reference = await addDoc(racesCollection(userId), {
      ...raceData,
      createdAt: serverTimestamp(),
      isPickedUp: false,
    });

    return { id: reference.id, ...raceData, isPickedUp: false };
  } catch (error) {
    throw new Error(`Não foi possível adicionar a corrida: ${errorMessage(error)}`);
  }
}

export async function getUpcomingRaces(userId) {
  try {
    assertIdentifier(userId, 'O identificador do utilizador');
    const racesQuery = query(
      racesCollection(userId),
      where('raceDate', '>=', new Date().toISOString()),
      orderBy('raceDate', 'asc'),
    );
    const snapshot = await getDocs(racesQuery);
    return snapshot.docs.map((race) => ({ id: race.id, ...race.data() }));
  } catch (error) {
    throw new Error(`Não foi possível carregar as próximas corridas: ${errorMessage(error)}`);
  }
}

export async function markKitAsPickedUp(userId, raceId) {
  try {
    assertIdentifier(userId, 'O identificador do utilizador');
    assertIdentifier(raceId, 'O identificador da corrida');
    await updateDoc(raceDocument(userId, raceId), { isPickedUp: true });
    return { id: raceId, isPickedUp: true };
  } catch (error) {
    throw new Error(`Não foi possível marcar o kit como retirado: ${errorMessage(error)}`);
  }
}

export async function getRaceHistory(userId) {
  try {
    assertIdentifier(userId, 'O identificador do utilizador');
    const historyQuery = query(
      racesCollection(userId),
      where('status', '==', 'completed'),
      orderBy('raceDate', 'desc'),
    );
    const snapshot = await getDocs(historyQuery);
    return snapshot.docs.map((race) => ({ id: race.id, ...race.data() }));
  } catch (error) {
    throw new Error(`Não foi possível carregar o histórico de corridas: ${errorMessage(error)}`);
  }
}
