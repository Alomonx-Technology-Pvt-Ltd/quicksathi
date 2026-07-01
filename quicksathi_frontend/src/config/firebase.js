// Firebase configuration
// Replace these values with your Firebase project credentials
// Get them from: https://console.firebase.google.com → Project Settings → Web App

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "quicksathi-XXXXX.firebaseapp.com",
  projectId: "quicksathi-XXXXX",
  storageBucket: "quicksathi-XXXXX.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:XXXXXXXXXXXXXXXX",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
