import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAXXhTMv3tUGgGBj7TbaLHDjfymjj16zpM",
    authDomain: "kelly-trading-os.firebaseapp.com",
    projectId: "kelly-trading-os",
    storageBucket: "kelly-trading-os.firebasestorage.app",
    messagingSenderId: "86878857364",
    appId: "1:86878857364:web:158508d3bfe65e93a62c81",
    measurementId: "G-Z5WWPXTFZM"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
