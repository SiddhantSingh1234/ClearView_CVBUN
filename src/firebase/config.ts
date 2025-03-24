import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAnui44VrmjT55QDuPDseH0oCC9AJKkKYw",
  authDomain: "clearview-bf384.firebaseapp.com",
  projectId: "clearview-bf384",
  storageBucket: "clearview-bf384.firebasestorage.app",
  messagingSenderId: "814222614594",
  appId: "1:814222614594:web:69153dd96a000d7b8acddb",
  measurementId: "G-HE89ELDPB5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);