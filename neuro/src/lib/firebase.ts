import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCr0mGAdgU5WR6j6JptHF4iWsLnjXt-oVo",
  authDomain: "neurotrack-8c415.firebaseapp.com",
  projectId: "neurotrack-8c415",
  storageBucket: "neurotrack-8c415.firebasestorage.app",
  messagingSenderId: "596713499857",
  appId: "1:596713499857:web:50a1f224934ca0cf6e29f0",
  measurementId: "G-M8HMVSBYSX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);