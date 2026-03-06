import admin from 'firebase-admin';

// Check if Firebase app is already initialized to prevent errors during hot reloads
if (!admin.apps.length) {
    // Check if we have explicit environment variables (e.g., in Vercel production)
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Vercel sometimes escapes newlines in private keys, we need to unescape them
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
        });
    } else {
        // Fallback to default application credentials (e.g., local development with GOOGLE_APPLICATION_CREDENTIALS)
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
        });
    }
}

export const auth = admin.auth();
