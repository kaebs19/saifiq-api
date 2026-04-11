const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let firebaseApp = null;

const initFirebase = () => {
  if (firebaseApp) return firebaseApp;

  const serviceAccountPath = path.resolve(
    process.env.FIREBASE_SERVICE_ACCOUNT || './firebase-service-account.json'
  );

  if (!fs.existsSync(serviceAccountPath)) {
    console.warn('⚠️ Firebase service account not found, push notifications disabled');
    return null;
  }

  const serviceAccount = require(serviceAccountPath);

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log('✅ Firebase initialized');
  return firebaseApp;
};

const getMessaging = () => {
  if (!firebaseApp) return null;
  return admin.messaging();
};

module.exports = { initFirebase, getMessaging };
