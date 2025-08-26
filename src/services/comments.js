import { db, auth } from './firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  onSnapshot,
  limit
} from 'firebase/firestore';

/**
 * addComment(imageId, text)
 * - hozzáad egy kommentet az images/{imageId}/comments alá
 * - csak bejelentkezett user írhat
 */
export async function addComment(imageId, text) {
  const user = auth.currentUser;
  if (!user) throw new Error('Nincs bejelentkezve (auth).');

  const colRef = collection(db, 'images', imageId, 'comments');
  const docRef = await addDoc(colRef, {
    text,
    uid: user.uid,
    displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'Anon'),
    createdAt: serverTimestamp()
  });

  // Visszaadunk egy egyszerű objektumot (optimista UI-hoz is használható)
  return {
    id: docRef.id,
    text,
    uid: user.uid,
    displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'Anon'),
    createdAt: new Date().toISOString()
  };
}

/**
 * fetchComments(imageId)
 * - egyszeri lekérés (asc időrend) – használható inicializálásra
 */
export async function fetchComments(imageId, maxCount = 200) {
  const colRef = collection(db, 'images', imageId, 'comments');
  const q = query(colRef, orderBy('createdAt', 'asc'), limit(maxCount));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * subscribeComments(imageId, cb, limitCount)
 * - real-time feliratkozás; cb kapja a komment tömböt (asc rendezés)
 * - visszatér egy unsubscribe függvénnyel
 */
export function subscribeComments(imageId, cb, limitCount = 500) {
  const colRef = collection(db, 'images', imageId, 'comments');
  const q = query(colRef, orderBy('createdAt', 'asc'), limit(limitCount));
  const unsub = onSnapshot(q, snap => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    cb(items);
  }, (err) => {
    console.warn('subscribeComments hiba', err);
  });
  return unsub;
}
