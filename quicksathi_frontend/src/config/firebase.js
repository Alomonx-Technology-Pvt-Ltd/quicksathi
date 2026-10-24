// Firebase configuration
// To enable Firebase auth (Google login), create a .env file in the frontend root
// and fill in your Firebase credentials. See .env.example for the required variables.
//
// Get your credentials from:
// https://console.firebase.google.com → Project Settings → Web App

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDlvRX_oR0Ac4G7MXx4CAqp0wovDo6H5g0",
  authDomain: "quicksathi-bc041.firebaseapp.com",
  projectId: "quicksathi-bc041",
  storageBucket: "quicksathi-bc041.firebasestorage.app",
  messagingSenderId: "389265941380",
  appId: "1:389265941380:web:5d026d2c2ca294301073d1",
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
};

// Only initialize Firebase if real credentials are provided
const hasValidConfig = Boolean(
  firebaseConfig.apiKey &&
  !firebaseConfig.apiKey.startsWith("AIzaSyXXX")
);

let app = null;
let auth = null;
let googleProvider = null;

if (hasValidConfig) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    console.log("✅ Firebase initialized successfully");
  } catch (error) {
    console.warn("Firebase initialization failed:", error.message);
  }
} else {
  console.info("ℹ️ Firebase not configured. Add VITE_FIREBASE_* vars to .env to enable Google login.");
}

export { auth, googleProvider, RecaptchaVerifier, signInWithPhoneNumber };
export default app;
