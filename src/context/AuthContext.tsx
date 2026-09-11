import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '../firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

interface AuthCtx {
  uid: string | null;
  ready: boolean;
}

const AuthContext = createContext<AuthCtx>({ uid: null, ready: false });

function safeGetSession(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetSession(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {}
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [uid, setUid] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Safety fallback: Never leave the app stuck on "Loading Flip 7..."
    const safetyTimeout = setTimeout(() => {
      if (isMounted) {
        setReady((prev) => {
          if (!prev) {
            console.warn('[AuthContext] Auth init timeout reached, releasing ready state');
            // If we don't have a UID yet, assign fallback
            setUid((curr) => curr || safeGetSession('flip7_uid') || `user_${Date.now().toString(36)}`);
            return true;
          }
          return prev;
        });
      }
    }, 4000);

    // Check if we already have a cached session UID
    const existingSessionUid = safeGetSession('flip7_uid');
    if (existingSessionUid) {
      setUid(existingSessionUid);
    }

    // Subscribe to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;

      if (user) {
        safeSetSession('flip7_uid', user.uid);
        setUid(user.uid);
        setReady(true);
        clearTimeout(safetyTimeout);
      } else {
        // No authenticated user; sign in anonymously
        try {
          const cred = await signInAnonymously(auth);
          if (isMounted) {
            safeSetSession('flip7_uid', cred.user.uid);
            setUid(cred.user.uid);
            setReady(true);
            clearTimeout(safetyTimeout);
          }
        } catch (err) {
          console.error('[AuthContext] Anonymous sign-in failed:', err);
          if (isMounted) {
            const fallbackUid = safeGetSession('flip7_uid') || `guest_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
            safeSetSession('flip7_uid', fallbackUid);
            setUid(fallbackUid);
            setReady(true);
            clearTimeout(safetyTimeout);
          }
        }
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ uid, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
