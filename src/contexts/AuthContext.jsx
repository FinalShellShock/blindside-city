import { createContext, useContext, useState, useEffect } from "react";
import {
  subscribeToAuth,
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signOut,
  getUserProfile,
  createUserProfile,
  updateUserProfile,
} from "../firebase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(undefined); // undefined = still loading
  const [userProfile, setUserProfile] = useState(null);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsub = subscribeToAuth(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const profile = await getUserProfile(fbUser.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
    });
    return unsub;
  }, []);

  // Create a new account with email + password
  async function signUp(email, password, displayName, legacyUsername = null) {
    const cred = await signUpWithEmail(email, password);
    const profile = {
      displayName,
      email,
      leagues: [],
      createdAt: new Date().toISOString(),
      seasonProgress: {},
      ...(legacyUsername ? { migratedFrom: legacyUsername } : {}),
    };
    await createUserProfile(cred.user.uid, profile);
    setUserProfile(profile);
    return cred;
  }

  // Sign in with email + password
  async function signIn(email, password) {
    const cred = await signInWithEmail(email, password);
    const profile = await getUserProfile(cred.user.uid);
    setUserProfile(profile);
    return cred;
  }

  // Sign in with Google
  async function signInGoogle(displayName = null, legacyUsername = null) {
    const cred = await signInWithGoogle();
    let profile = await getUserProfile(cred.user.uid);
    // First time Google sign-in — create profile
    if (!profile) {
      profile = {
        displayName: displayName || cred.user.displayName || cred.user.email,
        email: cred.user.email,
        leagues: [],
        createdAt: new Date().toISOString(),
        seasonProgress: {},
        ...(legacyUsername ? { migratedFrom: legacyUsername } : {}),
      };
      await createUserProfile(cred.user.uid, profile);
    }
    setUserProfile(profile);
    return cred;
  }

  async function updateProfile(updates) {
    if (!firebaseUser) return;
    await updateUserProfile(firebaseUser.uid, updates);
    setUserProfile(prev => ({ ...prev, ...updates }));
  }

  async function logOut() {
    await signOut();
    setFirebaseUser(null);
    setUserProfile(null);
  }

  const loading = firebaseUser === undefined;

  return (
    <AuthContext.Provider value={{
      firebaseUser,
      userProfile,
      loading,
      signUp,
      signIn,
      signInGoogle,
      logOut,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
