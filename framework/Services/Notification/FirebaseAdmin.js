/**
 * Firebase Admin SDK Singleton
 * Centralized Firebase Admin initialization for FCM
 * 
 * Configuration options (in priority order):
 * 1. FIREBASE_SERVICE_ACCOUNT_PATH - path to service account JSON file
 * 2. Environment variables: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';
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
    // Option 1: Load from service account file (preferred)
    const serviceAccountPath = Config.get('notification.fcm.service_account_path') || process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    
    if (serviceAccountPath) {
      // Use PROJECT_ROOT if available, otherwise use process.cwd()
      const projectRoot = process.env.PROJECT_ROOT || process.cwd();
      
      // Resolve from project root if relative, use as-is if absolute
      const fullPath = serviceAccountPath.startsWith('/') 
        ? serviceAccountPath 
        : resolve(projectRoot, serviceAccountPath);
      const serviceAccount = JSON.parse(readFileSync(fullPath, 'utf8'));
      
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });

      isInitialized = true;
      Log.info('Firebase Admin SDK initialized from service account file', { 
        projectId: serviceAccount.project_id,
        path: fullPath 
      });
      return firebaseApp;
    }

    // Option 2: Load from environment variables
    const projectId = Config.get('notification.fcm.project_id') || process.env.FIREBASE_PROJECT_ID;
    const clientEmail = Config.get('notification.fcm.client_email') || process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = Config.get('notification.fcm.private_key') || process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      Log.warning('Firebase Admin SDK not configured - FCM notifications disabled');
      return null;
    }

    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: formattedPrivateKey,
      }),
    });

    isInitialized = true;
    Log.info('Firebase Admin SDK initialized from environment variables', { projectId });
    return firebaseApp;
  } catch (error) {
    Log.error('Failed to initialize Firebase Admin SDK', {
      error: error.message
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
