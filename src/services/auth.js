import {auth} from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  inMemoryPersistence,
  sendPasswordResetEmail
} from 'firebase/auth';

export async function ensureAuthPersistence() {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (e) {
    console.warn('Local persistence nem elérhető, inMemory-re esünk vissza.', e);
    await setPersistence(auth, inMemoryPersistence);
  }
}

export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export function signUp(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function signOut() {
  return fbSignOut(auth);
}

export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}
