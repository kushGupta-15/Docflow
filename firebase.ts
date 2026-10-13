// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration loaded from environment variables with production defaults
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBbvt-qAMv4UrjpSFxTgfcGFXj9u8tmPKI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "docflow-39430.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "docflow-39430",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "docflow-39430.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "445951191716",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:445951191716:web:b7de41eb8a4919a679d431",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-RYP0XP3JK7"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

const db = getFirestore(app);

export { db }
