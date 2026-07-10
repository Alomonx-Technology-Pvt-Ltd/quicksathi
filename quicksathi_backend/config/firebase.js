import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load the service account key
const serviceAccountPath = resolve(__dirname, "firebase-service-account.json");

let firebaseApp = null;
let firebaseAuth = null;

try {
  let credential;
  let projectId;

  // 1. Try to read from environment variables (Production/Vercel)
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    projectId = process.env.FIREBASE_PROJECT_ID;
    credential = cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Replace literal '\n' strings from the .env file with actual newlines
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
  } 
  // 2. Fall back to local file if env vars are missing (Local Development)
  else {
    const serviceAccountPath = resolve(__dirname, "firebase-service-account.json");
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));
    projectId = serviceAccount.project_id;
    credential = cert(serviceAccount);
  }

  firebaseApp = initializeApp({
    credential,
    projectId,
  });

  firebaseAuth = getAuth(firebaseApp);
  console.log("✅ Firebase Admin SDK initialized successfully");
} catch (error) {
  console.error("❌ Firebase Admin SDK initialization failed:", error.message);
  console.info("   Make sure you have FIREBASE env vars set OR config/firebase-service-account.json exists.");
}

export { firebaseAuth };
export default firebaseApp;

