import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "eric-s-web.firebaseapp.com",
  projectId: "eric-s-web",
  storageBucket: "eric-s-web.appspot.com",
  messagingSenderId: "297389906907",
  appId: "1:297389906907:web:dc27c906bd8f2eb16565fe",
  measurementId: "G-RBMSS743BT",
};

export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
