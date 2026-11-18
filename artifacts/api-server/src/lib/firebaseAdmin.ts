import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

const FIREBASE_ADMIN_APP_NAME = "motorsby-admin";
let cachedAuth: Auth | undefined;

export function getFirebaseAdminAuth(): Auth {
  if (cachedAuth) return cachedAuth;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not configured");
  }

  let serviceAccount: unknown;
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON must contain valid JSON");
  }

  const existingApp = getApps().find((app) => app.name === FIREBASE_ADMIN_APP_NAME);
  const app =
    existingApp ??
    initializeApp(
      { credential: cert(serviceAccount as Parameters<typeof cert>[0]) },
      FIREBASE_ADMIN_APP_NAME,
    );

  cachedAuth = getAuth(app);
  return cachedAuth;
}
