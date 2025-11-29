// src/firestore.ts
import admin from "firebase-admin";

let initialized = false;

export function getFirestore() {
  if (!initialized) {
    const projectId = process.env.FIREBASE_PROJECT_ID || "local-todo-dev";

    // When using emulator for dev, you do NOT need a real service account.
    // firebase-admin will work with only a projectId when FIRESTORE_EMULATOR_HOST is set.
    if (process.env.FIRESTORE_EMULATOR_HOST) {
      console.error(
        `[firestore] Using emulator at ${process.env.FIRESTORE_EMULATOR_HOST} (projectId=${projectId})`
      );

      admin.initializeApp({
        projectId,
      });
    } else {
      // Production/real use: service account
      if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
        console.error(
          "Missing FIREBASE_SERVICE_ACCOUNT env var (base64-encoded JSON service account)"
        );
        process.exit(1);
      }

      const decoded = JSON.parse(
        Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64").toString()
      );

      admin.initializeApp({
        credential: admin.credential.cert(decoded),
        projectId: decoded.project_id || projectId,
      });
    }

    initialized = true;
  }

  return admin.firestore();
}
