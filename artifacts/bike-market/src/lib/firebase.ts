import { getApps, initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBeQu05RdxZIs4TKEd8n6qwSkWoT_gDXOI",
  authDomain: "motorsby.firebaseapp.com",
  projectId: "motorsby",
  storageBucket: "motorsby.firebasestorage.app",
  messagingSenderId: "1029397630065",
  appId: "1:1029397630065:web:8e502ca88c765a85601fd0",
};

const firebaseApp =
  getApps().find((app) => app.name === "motorsby-web") ??
  initializeApp(firebaseConfig, "motorsby-web");

export const firebaseAuth = getAuth(firebaseApp);

let resolveInitialAuthState: () => void = () => {};
const initialAuthStateReady = new Promise<void>((resolve) => {
  resolveInitialAuthState = resolve;
});
let initialAuthStateResolved = false;

onAuthStateChanged(firebaseAuth, () => {
  if (initialAuthStateResolved) return;
  initialAuthStateResolved = true;
  resolveInitialAuthState();
});

export async function getFirebaseIdToken(): Promise<string | null> {
  await initialAuthStateReady;
  return firebaseAuth.currentUser?.getIdToken() ?? null;
}
