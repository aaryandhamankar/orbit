import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCPy6qORSX9b-ZCt-7aSmEGQOpYe-7Wryg",
    authDomain: "orbit-1501.firebaseapp.com",
    projectId: "orbit-1501",
    storageBucket: "orbit-1501.firebasestorage.app",
    messagingSenderId: "301538395015",
    appId: "1:301538395015:web:718b6c413400b2cb1b0922",
    measurementId: "G-J8X74CNGNV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let analytics;
try {
    analytics = getAnalytics(app);
} catch (error) {
    console.warn("Firebase Analytics failed to initialize (likely blocked by client):", error);
    analytics = null;
}

export { app, analytics, auth, db };
