// ============================================================
// FIREBASE CONFIG — You MUST replace these values with your own
// from the Firebase console. See DEPLOY_GUIDE.md for instructions.
// ============================================================
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_AUTH_DOMAIN_HERE",
  projectId: "PASTE_YOUR_PROJECT_ID_HERE",
  storageBucket: "PASTE_YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "PASTE_YOUR_SENDER_ID_HERE",
  appId: "PASTE_YOUR_APP_ID_HERE"
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
