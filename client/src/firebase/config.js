// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCWWaDK0hUfV-ZZNt8cLMzBBrOYW21aNCk",
  authDomain: "text-to-audio-c5928.firebaseapp.com",
  projectId: "text-to-audio-c5928",
  storageBucket: "text-to-audio-c5928.firebasestorage.app",
  messagingSenderId: "870769614136",
  appId: "1:870769614136:web:f948685215f041793d35cd",
  measurementId: "G-0LBM03BBD9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);