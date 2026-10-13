import { initializeApp, getApps, getApp, App, cert } from "firebase-admin/app";
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

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
      // For development, use service key file if present, otherwise fall back to environment variables
      const serviceKeyPath = path.join(process.cwd(), 'service_key.json');
      let serviceKey: any = null;
      if (fs.existsSync(serviceKeyPath)) {
        try {
          serviceKey = JSON.parse(fs.readFileSync(serviceKeyPath, 'utf8'));
        } catch (e) {
          console.warn('Failed to parse service_key.json:', e);
        }
      }

      if (serviceKey) {
        app = initializeApp({
          credential: cert(serviceKey)
        });
      } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY && !process.env.FIREBASE_PRIVATE_KEY.includes('...')) {
        app = initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
        });
      } else {
        console.warn('Neither service_key.json nor complete FIREBASE_* environment variables were found. Firebase Admin operations will be unavailable.');
      }
    }
  } else {
    app = getApp();
  }

  if (!app) {
    throw new Error('Firebase Admin App failed to initialize. Please provide service_key.json or valid FIREBASE_* environment variables.');
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
