import {db} from './firebase';
import {doc, getDoc, runTransaction, serverTimestamp} from 'firebase/firestore';

/**
 * Lájk váltása (toggle) tranzakcióval:
 * - ha a user már lájkolt -> töröljük a like doksit és csökkentjük a likesCount-ot
 * - ha még nem -> létrehozzuk a like doksit és növeljük a likesCount-ot
 */
export async function toggleLike(imageId, uid) {
  const likeDocRef = doc(db, 'likes', `${imageId}_${uid}`);
  const imageDocRef = doc(db, 'images', imageId);

  await runTransaction(db, async (tx) => {
    const [likeSnap, imageSnap] = await Promise.all([
      tx.get(likeDocRef),
      tx.get(imageDocRef)
    ]);

    if (!imageSnap.exists()) {
      throw new Error('A kép nem létezik (images doc hiányzik).');
    }

    const current = imageSnap.data();
    let newCount = (current.likesCount || 0);

    if (likeSnap.exists()) {
      tx.delete(likeDocRef);
      newCount = Math.max(newCount - 1, 0);
    } else {
      tx.set(likeDocRef, {
        imageId,
        uid,
        createdAt: serverTimestamp()
      });
      newCount = newCount + 1;
    }

    tx.update(imageDocRef, {likesCount: newCount});
  });
}

/** True, ha a user már lájkolta az adott képet */
export async function hasUserLiked(imageId, uid) {
  const likeDocRef = doc(db, 'likes', `${imageId}_${uid}`);
  const snap = await getDoc(likeDocRef);
  return snap.exists();
}
