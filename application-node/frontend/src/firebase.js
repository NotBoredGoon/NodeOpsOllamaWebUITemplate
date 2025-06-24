import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';


let app;
let auth;

// This function is called from the main App component.
export const initializeFirebase = async () => {
    if (app) {
        return { app, auth };
    }

    try {
        const response = await fetch('http://localhost:8080/api/config/firebase');
        if (!response.ok) {
            throw new Error(`Failed to fetch Firebase config: ${response.statusText}`);
        }
        const firebaseConfig = await response.json();

        if (!firebaseConfig.apiKey) {
            throw new Error("Firebase config fetched from server is invalid.");
        }

        // const firebaseConfig = {
        //     apiKey: process.env.API_KEY,
        //     authDomain: process.env.AUTH_DOMAIN,
        //     projectId: process.env.PROJECT_ID,
        //     storageBucket: process.env.STORAGE_BUCKET,
        //     messagingSenderId: process.env.MESSAGING_SENDER_ID,
        //     appId: process.env.APP_ID,
        // }

        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        
        console.log("Firebase initialized successfully.");
        return { app, auth };

    } catch (error) {
        console.error("FATAL: Could not initialize Firebase.", error);
        return { app: null, auth: null };
    }
};

export { auth }; 