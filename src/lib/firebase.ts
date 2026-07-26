import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCciKoFb5QVqLdDHFmAcRL8tj0vmghi_n8",
  authDomain: "PredicTX-49412.firebaseapp.com",
  projectId: "PredicTX-49412",
  storageBucket: "PredicTX-49412.firebasestorage.app",
  messagingSenderId: "775270446709",
  appId: "1:775270446709:web:e74797435e4c73cb236a3c",
  measurementId: "G-7WZ777JZG7",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence).catch(console.error);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});