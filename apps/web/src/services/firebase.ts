import { initializeApp, FirebaseOptions } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { NewsArticle } from '../types';

const apiKey = (import.meta as { env?: Record<string, string> }).env?.VITE_FIREBASE_API_KEY || '';

const firebaseConfig: FirebaseOptions = {
  apiKey,
  authDomain: 'device-streaming-ccab91bb.firebaseapp.com',
  projectId: 'device-streaming-ccab91bb',
  storageBucket: 'device-streaming-ccab91bb.firebasestorage.app',
  messagingSenderId: '100841671094',
  appId: '1:100841671094:web:7ce6f2e80bfd61ad315917',
};

const app = apiKey ? initializeApp(firebaseConfig) : null;

export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: Array<{
      providerId?: string | null;
      email?: string | null;
    }>;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid ?? null,
      email: auth?.currentUser?.email ?? null,
      emailVerified: auth?.currentUser?.emailVerified ?? null,
      isAnonymous: auth?.currentUser?.isAnonymous ?? null,
      tenantId: auth?.currentUser?.tenantId ?? null,
      providerInfo: auth?.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) ?? [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
  return errInfo;
}

export async function testConnection(): Promise<boolean> {
  if (!db) return false;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection check: Client currently offline, cached operations available.');
    }
    return false;
  }
}

if (typeof window !== 'undefined' && db) {
  testConnection().catch(() => {});
}

export async function loginWithGoogle(): Promise<User | null> {
  if (!auth) return null;
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign In Error:', error);
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Google Sign Out Error:', error);
  }
}

export async function saveBookmarkToFirestore(userId: string, article: NewsArticle): Promise<void> {
  if (!db) return;
  const cleanId = (article.id ?? '').replace(/[^a-zA-Z0-9_\-]/g, '_');
  const path = `users/${userId}/bookmarks/${cleanId}`;
  try {
    await setDoc(doc(db, 'users', userId, 'bookmarks', cleanId), {
      articleId: cleanId,
      userId,
      title: (article.title || '').slice(0, 390),
      category: article.category || 'all',
      source: (article.source || '').slice(0, 95),
      savedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function removeBookmarkFromFirestore(userId: string, articleId: string): Promise<void> {
  if (!db) return;
  const cleanId = (articleId ?? '').replace(/[^a-zA-Z0-9_\-]/g, '_');
  const path = `users/${userId}/bookmarks/${cleanId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'bookmarks', cleanId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}