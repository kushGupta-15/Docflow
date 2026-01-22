// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAYYL8OyatRuZ1guioy2aTLpZIspcscPek",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "notion-clone-3ebc9.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "notion-clone-3ebc9",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "notion-clone-3ebc9.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1012339309206",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1012339309206:web:cf05b8bfc7d7a5e062a0b7",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-18RDK8NTWG"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

const db = getFirestore(app);

export { db }
