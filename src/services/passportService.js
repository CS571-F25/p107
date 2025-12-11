import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

const POINTS_COLLECTION = 'mapPoints';

// Get all map points
export const getAllMapPoints = async () => {
  try {
    const q = collection(db, POINTS_COLLECTION);
    const snapshot = await getDocs(q);
    const points = [];
    snapshot.forEach(doc => {
      points.push({ id: doc.id, ...doc.data() });
    });
    return points;
  } catch (err) {
    console.error('Error getting map points:', err);
    throw err;
  }
};

// Get single map point
export const getMapPoint = async (pointId) => {
  try {
    const docRef = doc(db, POINTS_COLLECTION, pointId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (err) {
    console.error('Error getting map point:', err);
    throw err;
  }
};

// Create new map point
export const createMapPoint = async (pointData) => {
  try {
    const docRef = await addDoc(collection(db, POINTS_COLLECTION), {
      ...pointData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (err) {
    console.error('Error creating map point:', err);
    throw err;
  }
};

// Update map point
export const updateMapPoint = async (pointId, pointData) => {
  try {
    const docRef = doc(db, POINTS_COLLECTION, pointId);
    await updateDoc(docRef, {
      ...pointData,
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    console.error('Error updating map point:', err);
    throw err;
  }
};

// Delete map point
export const deleteMapPoint = async (pointId) => {
  try {
    const docRef = doc(db, POINTS_COLLECTION, pointId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting map point:', err);
    throw err;
  }
};
