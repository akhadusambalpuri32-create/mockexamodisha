import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import {
  initializeFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocFromServer,
  setLogLevel
} from "firebase/firestore";
import firebaseConfigDefault from "../firebase-applet-config.json";

// We check local storage for custom overridden credentials (allows Vercel users to change project dynamically)
let firebaseConfig: any = { ...firebaseConfigDefault };

const customConfigStr = typeof window !== "undefined" ? window.localStorage.getItem("kalinga_user_firebase_config") : null;
if (customConfigStr) {
  try {
    const customConfig = JSON.parse(customConfigStr);
    if (customConfig && typeof customConfig === "object" && customConfig.apiKey) {
      console.log("🔥 Using custom Firebase configuration from Local Storage:", customConfig.projectId);
      firebaseConfig = { ...firebaseConfig, ...customConfig };
    }
  } catch (e) {
    console.error("Failed to parse custom Firebase config from local storage:", e);
  }
} else {
  // Check Vite client-side environment variables as alternative fallback
  const metaEnv = (import.meta as any).env || {};
  const envApiKey = metaEnv.VITE_FIREBASE_API_KEY;
  if (envApiKey) {
    console.log("🔥 Using custom Firebase configuration from Environment Variables:", metaEnv.VITE_FIREBASE_PROJECT_ID);
    firebaseConfig = {
      apiKey: envApiKey,
      authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || `${metaEnv.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: metaEnv.VITE_FIREBASE_PROJECT_ID,
      storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || `${metaEnv.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
      messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: metaEnv.VITE_FIREBASE_APP_ID,
      measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID || "",
      firestoreDatabaseId: metaEnv.VITE_FIREBASE_DATABASE_ID || metaEnv.VITE_FIREBASE_FIRESTORE_DATABASE_ID || firebaseConfigDefault.firestoreDatabaseId
    };
  }
}

// Initialize the App
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== "(default)")
  ? initializeFirestore(app, { experimentalForceLongPolling: true }, firebaseConfig.firestoreDatabaseId)
  : initializeFirestore(app, { experimentalForceLongPolling: true });
export const auth = getAuth(app);

// Suppress benign internal gRPC idle stream cancellation messages in the console
setLogLevel("error");

// Authentication Providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Standard Firebase Enum and Interfaces for detailed diagnosis
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

// Security mandated error-wrapping route
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Policy Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Function to validate Firestore connection on boot up as requested in rules
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Please check your Firebase configuration: Client is offline.");
    }
  }
}

// Export auth primitives
export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc
};
