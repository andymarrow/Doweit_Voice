// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { FIREBASE_API_KEY } from "./constants";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: FIREBASE_API_KEY,
	authDomain: "cinematechat-6040e.firebaseapp.com",
	projectId: "cinematechat-6040e",
	storageBucket: "cinematechat-6040e.appspot.com",
	messagingSenderId: "1024890798511",
	appId: "1:1024890798511:web:78a6cebae6511788ee2f5a",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

