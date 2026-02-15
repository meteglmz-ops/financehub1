import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "YOUR_FIREBASE_API_KEY_HERE",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "your-app.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "your-app.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY_HERE" &&
         !firebaseConfig.apiKey.includes("YOUR_") &&
         firebaseConfig.apiKey.length > 20;
};

let app = null;
let auth = null;
let googleProvider = null;

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    console.log('⚠️ Falling back to mock authentication');
  }
} else {
  console.log('⚠️ Firebase not configured. Using mock authentication mode.');
  console.log('ℹ️ To enable real Google Auth, add Firebase config to .env file');
}

export { auth, googleProvider, isFirebaseConfigured };
export default app;