import { initializeApp, getApps, getApp, App, cert } from "firebase-admin/app";
import { getFirestore } from 'firebase-admin/firestore';

let app: App;

if (getApps().length === 0) {
  // For production, use environment variables
  if (process.env.NODE_ENV === 'production') {
    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    // For development, use service key file
    const serviceKey = require("@/service_key.json");
    app = initializeApp({
      credential: cert(serviceKey)
    });
  }
} else {
  app = getApp();
}

const adminDb = getFirestore(app);

export { app as adminApp, adminDb };
