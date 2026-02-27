import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '../firebase';
import { signInAnonymously } from 'firebase/auth';

interface AuthCtx {
  uid: string | null;
  ready: boolean;
}

const AuthContext = createContext<AuthCtx>({ uid: null, ready: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [uid, setUid] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function initAuth() {
      // Reuse this tab's UID if already assigned in this session
      const storedUid = sessionStorage.getItem('daxden_uid');
      const storedToken = sessionStorage.getItem('daxden_token');

      if (storedUid && storedToken) {
        setUid(storedUid);
        setReady(true);
        return;
      }

      // Force a fresh anonymous sign-in for this tab
      try {
        await auth.signOut();
      } catch (_) {}

      const result = await signInAnonymously(auth);
      const newUid = result.user.uid;
      const token = await result.user.getIdToken();

      sessionStorage.setItem('daxden_uid', newUid);
      sessionStorage.setItem('daxden_token', token);

      setUid(newUid);
      setReady(true);
    }

    initAuth();
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
