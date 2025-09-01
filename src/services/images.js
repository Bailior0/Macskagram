import {auth, db, storage} from './firebase';
import {
  collection, addDoc, query, orderBy, limit, startAfter,
  getDocs, deleteDoc, doc
} from 'firebase/firestore';
import {ref, uploadBytesResumable, getDownloadURL, deleteObject} from 'firebase/storage';

const PAGE_SIZE = 12;

export async function uploadMedia(file, caption = '') {
  const user = auth.currentUser;
  if (!user) throw new Error('Nincs bejelentkezve (auth).');

  const isVideo = file.type.startsWith('video/');
  const folder = isVideo ? 'videos' : 'images';

  const storagePath = `${folder}/${user.uid}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, storagePath);

  const task = uploadBytesResumable(storageRef, file, {contentType: file.type});
  await new Promise((resolve, reject) => {
    task.on('state_changed', () => {}, reject, resolve);
  });

  const url = await getDownloadURL(storageRef);

  const docRef = await addDoc(collection(db, 'media'), {
    url,
    caption,
    ownerId: user.uid,
    createdAt: Date.now(),
    storagePath,
    likesCount: 0,
    type: isVideo ? 'video' : 'image'
  });

  return {
    id: docRef.id,
    url,
    caption,
    ownerId: user.uid,
    createdAt: Date.now(),
    storagePath,
    likesCount: 0,
    type: isVideo ? 'video' : 'image'
  };
}

export async function fetchMediaPage({after = null, pageSize = PAGE_SIZE} = {}) {
  let q = query(collection(db, 'media'), orderBy('createdAt', 'desc'), limit(pageSize));
  if (after) {
    q = query(collection(db, 'media'), orderBy('createdAt', 'desc'), startAfter(after), limit(pageSize));
  }
  const snap = await getDocs(q);
  const items = [];
  snap.forEach(d => items.push({id: d.id, ...d.data()}));
  const last = snap.docs[snap.docs.length - 1] ?? null;
  return {items, lastDoc: last};
}

export async function deleteMedia(id, storagePath) {
  const user = auth.currentUser;
  if (!user) throw new Error('Nincs bejelentkezve.');
  if (!id || !storagePath) throw new Error('Hiányzó paraméterek.');

  await deleteDoc(doc(db, 'media', id));
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
}
