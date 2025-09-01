import {auth, db} from './firebase';
import {
  addDoc, collection, onSnapshot, orderBy, query, serverTimestamp
} from 'firebase/firestore';

export async function addComment(mediaId, text) {
  const user = auth.currentUser;
  if (!user) throw new Error('Nincs bejelentkezve.');
  if (!text?.trim()) return;

  const col = collection(db, 'media', mediaId, 'comments');
  await addDoc(col, {
    uid: user.uid,
    text: text.trim(),
    createdAt: Date.now()
  });
}

export function subscribeComments(mediaId, cb) {
  const col = collection(db, 'media', mediaId, 'comments');
  const q = query(col, orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    const list = [];
    snap.forEach(d => list.push({id: d.id, ...d.data()}));
    cb(list);
  });
}
