// ============================================================
// FIREBASE CONFIG — You MUST replace these values with your own
// from the Firebase console. See DEPLOY_GUIDE.md for instructions.
// ============================================================
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCmqB4oXmcIlFetz4FaHI-y-8fjN277pG8",
  authDomain: "blindside-city.firebaseapp.com",
  projectId: "blindside-city",
  storageBucket: "blindside-city.firebasestorage.app",
  messagingSenderId: "712877849444",
  appId: "1:712877849444:web:93b32fccc789e38ec15871"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Single document that holds all league state
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
    if (snap.exists()) {
      callback(snap.data());
    }
  });
}

export { db };
