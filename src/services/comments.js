import {db} from './firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';

/** Új komment hozzáadása egy képhez */
export async function addComment(imageId, uid, text) {
  const commentsRef = collection(db, 'images', imageId, 'comments');
  await addDoc(commentsRef, {
    uid,
    text,
    createdAt: serverTimestamp()
  });
}

/** Feliratkozás kommentekre (real-time stream) */
export function subscribeComments(imageId, cb, limitCount = 10) {
  const commentsRef = collection(db, 'images', imageId, 'comments');
  const q = query(commentsRef, orderBy('createdAt', 'desc'), limit(limitCount));
  return onSnapshot(q, snap => {
    const items = snap.docs.map(d => ({id: d.id, ...d.data()}));
    cb(items);
  });
}
