/**
 * Firebase Admin SDK Singleton
 * Centralized Firebase Admin initialization for FCM
 * 
 * Configuration from environment variables:
 * - FIREBASE_PROJECT_ID
 * - FIREBASE_CLIENT_EMAIL  
 * - FIREBASE_PRIVATE_KEY
 */

import admin from 'firebase-admin';
import { Config, Log } from '../../Support/Facades/index.js';

let firebaseApp = null;
let isInitialized = false;

/**
 * Initialize Firebase Admin SDK
 * Safe to call multiple times - will only initialize once
 */
export function initializeFirebaseAdmin() {
  if (isInitialized) {
    return firebaseApp;
  }

  try {
    const projectId = Config.get('notification.fcm.project_id') || process.env.FIREBASE_PROJECT_ID;
    const clientEmail = Config.get('notification.fcm.client_email') || process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = Config.get('notification.fcm.private_key') || process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      Log.warning('Firebase Admin SDK not configured - FCM notifications disabled', {
        hasProjectId: !!projectId,
        hasClientEmail: !!clientEmail,
        hasPrivateKey: !!privateKey
      });
      return null;
    }

    // Handle escaped newlines in private key
    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: formattedPrivateKey,
      }),
    });

    isInitialized = true;
    Log.info('Firebase Admin SDK initialized successfully', { projectId });

    return firebaseApp;
  } catch (error) {
    Log.error('Failed to initialize Firebase Admin SDK', {
      error: error.message,
      stack: error.stack
    });
    return null;
  }
}

/**
 * Get Firebase Messaging instance
 */
export function getMessaging() {
  if (!isInitialized) {
    initializeFirebaseAdmin();
  }

  if (!firebaseApp) {
    return null;
  }

  return admin.messaging();
}

/**
 * Check if Firebase Admin is initialized
 */
export function isFirebaseInitialized() {
  return isInitialized && firebaseApp !== null;
}

export default {
  initialize: initializeFirebaseAdmin,
  getMessaging,
  isInitialized: isFirebaseInitialized
};
