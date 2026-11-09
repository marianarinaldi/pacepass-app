import { auth, db } from '../config/firebaseConfig';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

const RACES_COLLECTION = 'races';

function currentUserId() {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('É necessário estar autenticado para gerenciar corridas.');
  }
  return userId;
}

function cleanText(value, field, maxLength = 120) {
  if (typeof value !== 'string') throw new Error(`${field} inválido.`);
  const clean = value.trim().replace(/[<>]/g, '');
  if (!clean || clean.length > maxLength) throw new Error(`${field} inválido.`);
  return clean;
}

function validateRace(race) {
  const name = cleanText(race.name, 'Nome da corrida');
  const location = cleanText(race.kitPickupLocation, 'Local de retirada');
  const distance = Number(race.distance);
  if (!Number.isFinite(distance) || distance <= 0 || distance > 1000) {
    throw new Error('A distância deve estar entre 0 e 1000 km.');
  }
  const startDate = new Date(race.startDate);
  const pickupStartDate = new Date(race.kitPickupStartDate);
  const pickupEndDate = new Date(race.kitPickupEndDate);
  if ([startDate, pickupStartDate, pickupEndDate].some((date) => Number.isNaN(date.getTime()))) {
    throw new Error('Informe datas válidas.');
  }
  if (pickupEndDate < pickupStartDate) {
    throw new Error('O fim da retirada deve ser posterior ao início.');
  }
  return {
    name,
    distance,
    startDate: startDate.toISOString(),
    kitPickupStartDate: pickupStartDate.toISOString(),
    kitPickupEndDate: pickupEndDate.toISOString(),
    kitPickupLocation: location,
    receiptUri: typeof race.receiptUri === 'string' ? race.receiptUri : null,
  };
}

export async function addRace(race) {
  try {
    const userId = currentUserId();
    const data = validateRace(race);
    const reference = await addDoc(collection(db, RACES_COLLECTION), {
      ...data,
      userId,
      kitPickedUp: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: reference.id, ...data, userId, kitPickedUp: false };
  } catch (error) {
    throw new Error(`Não foi possível adicionar a corrida: ${error.message}`);
  }
}

export async function getUpcomingRaces() {
  try {
    const userId = currentUserId();
    const racesQuery = query(
      collection(db, RACES_COLLECTION),
      where('userId', '==', userId),
      where('startDate', '>=', new Date().toISOString()),
      orderBy('startDate', 'asc'),
    );
    const snapshot = await getDocs(racesQuery);
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  } catch (error) {
    throw new Error(`Não foi possível carregar as corridas: ${error.message}`);
  }
}

export async function markKitAsPickedUp(raceId) {
  try {
    const userId = currentUserId();
    if (typeof raceId !== 'string' || !raceId.trim()) throw new Error('Corrida inválida.');
    const raceReference = doc(db, RACES_COLLECTION, raceId);
    await updateDoc(raceReference, {
      kitPickedUp: true,
      kitPickedUpAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      userId,
    });
    return { id: raceId, kitPickedUp: true };
  } catch (error) {
    throw new Error(`Não foi possível atualizar o kit: ${error.message}`);
  }
}

export async function updateRace(raceId, race) {
  try {
    const userId = currentUserId();
    const data = validateRace(race);
    await updateDoc(doc(db, RACES_COLLECTION, raceId), { ...data, userId, updatedAt: serverTimestamp() });
    return { id: raceId, ...data, userId };
  } catch (error) {
    throw new Error(`Não foi possível editar a corrida: ${error.message}`);
  }
}

export async function deleteRace(raceId) {
  try {
    currentUserId();
    if (typeof raceId !== 'string' || !raceId.trim()) throw new Error('Corrida inválida.');
    await deleteDoc(doc(db, RACES_COLLECTION, raceId));
  } catch (error) {
    throw new Error(`Não foi possível excluir a corrida: ${error.message}`);
  }
}
