import admin from 'firebase-admin';

// Check if Firebase app is already initialized to prevent errors during hot reloads
if (!admin.apps.length) {
    admin.initializeApp({
        // In a real production app, use actual service account credentials.
        // For development with Firebase Authentication, standard initialization
        // often falls back on GOOGLE_APPLICATION_CREDENTIALS if set, or can be 
        // explicitly configured here if provided.
        credential: admin.credential.applicationDefault(),
    });
}

export const auth = admin.auth();
