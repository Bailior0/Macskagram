import {db} from './firebase';
import {doc, setDoc, deleteDoc, getDoc, updateDoc, increment} from 'firebase/firestore';

export async function hasUserLiked(mediaId, uid) {
  const likeRef = doc(db, 'media', mediaId, 'likes', uid);
  const snap = await getDoc(likeRef);
  return snap.exists();
}

export async function toggleLike(mediaId, uid) {
  const likeRef = doc(db, 'media', mediaId, 'likes', uid);
  const mediaRef = doc(db, 'media', mediaId);
  const snap = await getDoc(likeRef);

  if (snap.exists()) {
    await deleteDoc(likeRef);
    await updateDoc(mediaRef, {likesCount: increment(-1)});
    return false;
  } else {
    await setDoc(likeRef, {uid, createdAt: Date.now()});
    await updateDoc(mediaRef, {likesCount: increment(1)});
    return true;
  }
}