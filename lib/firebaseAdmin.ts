import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, Timestamp, type Firestore } from 'firebase-admin/firestore';
import { FirestoreTimestamp } from '@/types/game';

function getAdminApp(): App {
  const existing = getApps();
  if (existing.length > 0) {
    return existing[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.'
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

let cachedDb: Firestore | undefined;
function getDb(): Firestore {
  if (!cachedDb) {
    cachedDb = getFirestore(getAdminApp());
  }
  return cachedDb;
}

// Lazily initialized: reading the Firebase admin credentials (and throwing if
// they're missing) only happens the first time a route handler actually
// touches Firestore — not at module-import time. That matters because
// Next.js imports every route module during `next build`'s "collecting page
// data" step, which would otherwise fail a build that has no .env.local yet
// (e.g. before Amy has created the Firebase project).
export const adminDb: Firestore = new Proxy({} as Firestore, {
  get(_target, prop, receiver) {
    const db = getDb();
    const value = Reflect.get(db as object, prop, receiver);
    return typeof value === 'function' ? value.bind(db) : value;
  },
});

function serializeTimestamp(value: unknown): FirestoreTimestamp | unknown {
  if (value instanceof Timestamp) {
    return { seconds: value.seconds, nanoseconds: value.nanoseconds };
  }
  return value;
}

// Firestore Admin Timestamp instances don't serialize to useful JSON on their
// own, so convert the known timestamp fields to plain objects before a route
// hands a document back to the client.
export function serializeGame<T extends Record<string, unknown>>(data: T): T {
  return {
    ...data,
    createdAt: serializeTimestamp(data.createdAt),
    lastActivity: serializeTimestamp(data.lastActivity),
  };
}
