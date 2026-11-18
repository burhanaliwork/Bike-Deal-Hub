import { useSyncExternalStore } from "react";
import type { ShowroomSummary } from "@workspace/api-client-react";

const KEY = "motorsby_auth";

export interface StoredAuth {
  token: string;
  username: string;
  role: string; // 'admin' | 'showroom'
  showroom: ShowroomSummary | null;
}

const listeners = new Set<() => void>();
let cached: StoredAuth | null | undefined;

function read(): StoredAuth | null {
  if (cached !== undefined) return cached;
  try {
    const raw = localStorage.getItem(KEY);
    cached = raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    cached = null;
  }
  return cached;
}

export function getStoredAuth(): StoredAuth | null {
  return read();
}

export function setStoredAuth(auth: StoredAuth) {
  localStorage.setItem(KEY, JSON.stringify(auth));
  cached = auth;
  listeners.forEach((l) => l());
}

export function clearStoredAuth() {
  localStorage.removeItem(KEY);
  cached = null;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAccountAuth(): StoredAuth | null {
  return useSyncExternalStore(subscribe, read);
}
