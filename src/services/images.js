import {auth, db, storage} from './firebase';
import {
  collection, addDoc, query, orderBy, limit, startAfter,
  getDocs
} from 'firebase/firestore';
import {ref, uploadBytesResumable, getDownloadURL} from 'firebase/storage';

const PAGE_SIZE = 12;

export async function uploadImage(file, caption = '') {
  const user = auth.currentUser;
  if (!user) throw new Error('Nincs bejelentkezve (auth).');

  const storagePath = `images/${user.uid}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, storagePath);

  const task = uploadBytesResumable(storageRef, file, {contentType: file.type});
  await new Promise((resolve, reject) => {
    task.on('state_changed', () => {}, reject, resolve);
  });

  const url = await getDownloadURL(storageRef);

  const docRef = await addDoc(collection(db, 'images'), {
    url,
    caption,
    ownerId: user.uid,
    createdAt: Date.now(),
    storagePath,
    likesCount: 0
  });

  return {id: docRef.id, url, caption, ownerId: user.uid, createdAt: Date.now(), storagePath, likesCount: 0};
}

export async function fetchImagesPage({after = null, pageSize = PAGE_SIZE} = {}) {
  let q = query(collection(db, 'images'), orderBy('createdAt', 'desc'), limit(pageSize));
  if (after) {
    q = query(collection(db, 'images'), orderBy('createdAt', 'desc'), startAfter(after), limit(pageSize));
  }
  const snap = await getDocs(q);
  const items = [];
  snap.forEach(d => items.push({id: d.id, ...d.data()}));
  const last = snap.docs[snap.docs.length - 1] ?? null;
  return {items, lastDoc: last};
}
