// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDYgDm4ndTV1nCFVIsRX5zlBFRnGNxsGjw",
  authDomain: "rmclothing-35f16.firebaseapp.com",
  projectId: "rmclothing-35f16",
  storageBucket: "rmclothing-35f16.firebasestorage.app",
  messagingSenderId: "420319341557",
  appId: "1:420319341557:web:43001c7ba8d27c1c74cebc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;