import { initializeApp } from 'firebase/app';
import { CONTESTANTS, TRIBE_COLORS } from './gameData.js';
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

// ── League state helpers (leagues/{leagueId}) ──
function leagueDoc(leagueId) {
  return doc(db, 'leagues', leagueId);
}

export async function loadState(leagueId = 'main') {
  const snap = await getDoc(leagueDoc(leagueId));
  return snap.exists() ? snap.data() : null;
}

export async function saveStateToDB(state, leagueId = 'main') {
  await setDoc(leagueDoc(leagueId), state);
}

export function subscribeToState(callback, leagueId = 'main') {
  return onSnapshot(leagueDoc(leagueId), (snap) => {
    if (snap.exists()) callback(snap.data());
  });
}

// ── League management helpers ──

// Generate a random 6-character alphanumeric invite code
function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Create a brand-new league. Returns the new leagueId.
export async function createLeague(uid, displayName, leagueName, initialState) {
  const leagueId = Math.random().toString(36).substring(2, 10);
  const inviteCode = generateInviteCode();

  // Write invite code lookup doc
  await setDoc(doc(db, 'inviteCodes', inviteCode), { leagueId });

  // Write the league document — seed cast and tribe colors from game defaults
  await setDoc(leagueDoc(leagueId), {
    ...initialState,
    leagueName,
    commissioners: [uid],
    inviteCode,
    users: { [uid]: { displayName } },
    contestants: CONTESTANTS,
    tribeColors: TRIBE_COLORS,
  });

  // Add league to the user's profile (setDoc+merge works even if `leagues` field is missing)
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  const existing = userSnap.exists() ? (userSnap.data().leagues || []) : [];
  const alreadyIn = existing.some(l => l.id === leagueId);
  if (!alreadyIn) {
    await setDoc(userRef, {
      leagues: [...existing, { id: leagueId, name: leagueName, role: 'commissioner' }],
    }, { merge: true });
  }

  return leagueId;
}

// Join a league via invite code. Returns the leagueId or null if invalid.
export async function joinLeagueByCode(uid, displayName, inviteCode) {
  const codeDoc = doc(db, 'inviteCodes', inviteCode.toUpperCase());
  const codeSnap = await getDoc(codeDoc);
  if (!codeSnap.exists()) return null;

  const { leagueId } = codeSnap.data();
  const leagueSnap = await getDoc(leagueDoc(leagueId));
  if (!leagueSnap.exists()) return null;

  const leagueData = leagueSnap.data();

  // Add user to league's users map (merge so existing keys aren't wiped)
  await setDoc(leagueDoc(leagueId), {
    users: { ...leagueData.users, [uid]: { displayName } },
  }, { merge: true });

  // Add league to user's profile (setDoc+merge works even if `leagues` field is missing)
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  const existing = userSnap.exists() ? (userSnap.data().leagues || []) : [];
  const alreadyIn = existing.some(l => l.id === leagueId);
  if (!alreadyIn) {
    await setDoc(userRef, {
      leagues: [...existing, { id: leagueId, name: leagueData.leagueName, role: 'member' }],
    }, { merge: true });
  }

  return leagueId;
}

// Regenerate the invite code for a league (commissioner only). Returns new code.
export async function regenerateInviteCode(leagueId, oldCode) {
  const newCode = generateInviteCode();
  // Remove old code doc if present
  if (oldCode) {
    await setDoc(doc(db, 'inviteCodes', oldCode), { leagueId: '__revoked__' });
  }
  await setDoc(doc(db, 'inviteCodes', newCode), { leagueId });
  await setDoc(leagueDoc(leagueId), { inviteCode: newCode }, { merge: true });
  return newCode;
}

// Get the list of leagues stored on a user profile (may be undefined for legacy users)
export async function getUserLeagues(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data().leagues || []) : [];
}

// ── Draft helpers (leagues/{leagueId}/draft/state) ──

function draftDoc(leagueId) {
  return doc(db, 'leagues', leagueId, 'draft', 'state');
}

export function subscribeToDraft(leagueId, callback) {
  return onSnapshot(draftDoc(leagueId), (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
}

export async function startDraft(leagueId, { order, timerSeconds, picksPerPlayer }) {
  await setDoc(draftDoc(leagueId), {
    status: 'active',
    order,           // full snake pick sequence e.g. [uid1,uid2,uid2,uid1] for 2 players 2 picks each
    currentPick: 0,
    picks: [],
    timerSeconds,
    picksPerPlayer,
    startedAt: Date.now(),
    lastPickAt: Date.now(),
  });
}

export async function makeDraftPick(leagueId, draftState, userId, contestantName) {
  const pick = {
    userId,
    contestant: contestantName,
    pickNumber: draftState.currentPick,
    timestamp: Date.now(),
  };
  const picks = [...draftState.picks, pick];
  const currentPick = draftState.currentPick + 1;
  const done = currentPick >= draftState.order.length;
  await setDoc(draftDoc(leagueId), {
    ...draftState,
    picks,
    currentPick,
    lastPickAt: Date.now(),
    status: done ? 'completed' : 'active',
  });
  return done;
}

export async function resetDraft(leagueId) {
  await setDoc(draftDoc(leagueId), { status: 'reset' });
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
