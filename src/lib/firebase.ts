import { getApps, initializeApp } from "firebase/app";
import { doc, getFirestore, onSnapshot, setDoc } from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged,
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { writable, type Readable, derived } from "svelte/store";

const firebaseConfig = {
  apiKey: "AIzaSyDnJHbXvYPHjjlKdLjh8kf3OucOE8iW6no",
  authDomain: "rehamdiva-a8819.firebaseapp.com",
  projectId: "rehamdiva-a8819",
  storageBucket: "rehamdiva-a8819.appspot.com",
  messagingSenderId: "913924175735",
  appId: "1:913924175735:web:a058d2c5da78b87cfbd372",
};

// Initialize Firebase
export const app = getApps().length
  ? getApps()[0]
  : initializeApp(firebaseConfig);
export const db = getFirestore();
export const auth = getAuth();

// User store
function userStore() {
  let unsubscribe: () => void;

  if (!auth || !globalThis.window) {
    console.warn("Auth is not initialized or not in browser");
    const { subscribe } = writable<User | null>(null);
    return { subscribe };
  }

  const { subscribe } = writable(auth?.currentUser ?? null, (set) => {
    unsubscribe = onAuthStateChanged(auth, (user) => {
      set(user);
    });

    return () => unsubscribe();
  });

  return { subscribe };
}

export const user = userStore();

// User data interface
export interface UserData {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  watchedVideos: number[];
}

// Document store
function docStore<T>(path: string) {
  let unsubscribe: () => void;

  const docRef = doc(db, path);

  const { subscribe } = writable<T | null>(null, (set) => {
    unsubscribe = onSnapshot(docRef, (snapshot) => {
      set((snapshot.data() as T) ?? null);
    });

    return () => unsubscribe();
  });

  return {
    subscribe,
    ref: docRef,
    id: docRef.id,
  };
}

// User data store
export const userData = writable<UserData | null>(null);

// Update the onAuthStateChanged listener
onAuthStateChanged(auth, (firebaseUser) => {
  if (firebaseUser) {
    const userDocRef = doc(db, "users", firebaseUser.uid);
    onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        userData.set({
          id: snapshot.id, // This is the user's ID
          fullName: data.fullName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          watchedVideos: data.watchedVideos,
        });
      } else {
        console.log("No such document!");
        userData.set(null);
      }
    });
  } else {
    userData.set(null);
  }
});

// Email/Password Registration
export async function registerWithEmailAndPassword(
  email: string,
  password: string,
  fullName: string,
  phoneNumber: string
) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Store user data in Firestore
    const newUserData: UserData = {
      id: user.uid,
      fullName,
      email,
      phoneNumber,
      watchedVideos: [],
    };
    await setDoc(doc(db, "users", user.uid), newUserData);

    return user;
  } catch (error) {
    console.error("Error registering new user:", error);
    throw error;
  }
}

// Email/Password Sign In
export async function signInWithCredentials(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
}

// Password Reset
export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("Password reset email sent successfully");
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}
