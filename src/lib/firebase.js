import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyC4i7k5GMCf43zdxecw149WiwfQ0UgerOA",
  authDomain: "dandiyawebsite.firebaseapp.com",
  projectId: "dandiyawebsite",
  storageBucket: "dandiyawebsite.firebasestorage.app",
  messagingSenderId: "1034856825300",
  appId: "1:1034856825300:web:2e88d2cba7f7112366d641",
  measurementId: "G-EYQPN7N7P8"
};

// Initialize Firebase only once to prevent errors in Next.js hot-reloading
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export default app;
