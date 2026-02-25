import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCmqB4oXmcIlFetz4FaHI-y-8fjN277pG8",
  authDomain: "blindside-city.firebaseapp.com",
  projectId: "blindside-city",
  storageBucket: "blindside-city.firebasestorage.app",
  messagingSenderId: "712877849444",
  appId: "1:712877849444:web:93b32fccc789e38ec15871"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

// ── Legacy Firestore helpers (Blindside City — leagues/main) ──
const STATE_DOC = doc(db, 'leagues', 'main');

export async function loadState() {
  const snap = await getDoc(STATE_DOC);
  return snap.exists() ? snap.data() : null;
}

export async function saveStateToDB(state) {
  await setDoc(STATE_DOC, state);
}

export function subscribeToState(callback) {
  return onSnapshot(STATE_DOC, (snap) => {
    if (snap.exists()) callback(snap.data());
  });
}

// ── Firebase Auth helpers ──
export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function signUpWithEmail(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function signOut() {
  return firebaseSignOut(auth);
}

// ── User profile helpers (users/ collection) ──
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export async function createUserProfile(uid, data) {
  await setDoc(doc(db, 'users', uid), data);
}

export async function updateUserProfile(uid, data) {
  await setDoc(doc(db, 'users', uid), data, { merge: true });
}
