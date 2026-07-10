// Firebase configuration
// To enable Firebase auth (Google login), create a .env file in the frontend root
// and fill in your Firebase credentials. See .env.example for the required variables.
//
// Get your credentials from:
// https://console.firebase.google.com → Project Settings → Web App

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

// Only initialize Firebase if real credentials are provided
const hasValidConfig = firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("AIzaSyXXX");

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

export { auth, googleProvider };
export default app;
