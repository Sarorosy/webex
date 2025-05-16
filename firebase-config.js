// src/firebase-config.js

import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: "AIzaSyDwenDeM3il8TIiFMUPb0GpyjMGUn1eC_U",
    authDomain: "dove0101.firebaseapp.com",
    projectId: "dove0101",
    storageBucket: "dove0101.firebasestorage.app",
    messagingSenderId: "206783732985",
    appId: "1:206783732985:web:f3e029c1664a39ee169628",
    measurementId: "G-BZYDVEXFP1"
  };



const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

