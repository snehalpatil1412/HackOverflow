// Import the functions you need from the SDKs you need
// firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import "firebase/auth";

// import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const auth = firebase.auth();
const auth = getAuth(app);

const db = getDatabase(app);

// Get a reference to the database
export const database = getDatabase(app);
export { auth };
export const googleProvider = new GoogleAuthProvider();
export { db };
// const app = initializeApp(firebaseConfig);

// export { auth };
