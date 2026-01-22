import { initializeApp, getApps, getApp, App, cert } from "firebase-admin/app";
import { getFirestore } from 'firebase-admin/firestore';

let app: App | null = null;
let adminDb: any = null;

function initializeFirebaseAdmin() {
  if (app) return { app, adminDb };

  if (getApps().length === 0) {
    // For production, use environment variables
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
        throw new Error('Missing Firebase environment variables for production');
      }
      
      app = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      // For development, use service key file
      try {
        const serviceKey = require("@/service_key.json");
        app = initializeApp({
          credential: cert(serviceKey)
        });
      } catch (error) {
        console.warn('Service key file not found, Firebase admin will not be available');
        throw error;
      }
    }
  } else {
    app = getApp();
  }

  adminDb = getFirestore(app);
  return { app, adminDb };
}

// Export functions that initialize on demand
export function getAdminApp() {
  const { app } = initializeFirebaseAdmin();
  return app;
}

export function getAdminDb() {
  const { adminDb } = initializeFirebaseAdmin();
  return adminDb;
}

// For backward compatibility
export { getAdminApp as adminApp, getAdminDb as adminDb };
