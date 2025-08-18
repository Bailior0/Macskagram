import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {ensureAuthPersistence, watchAuth, signOut as doSignOut} from '../services/auth';

const AuthContext = createContext({user: null, loading: true, signOut: () => {}});

export function AuthProvider({children}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub = null;
    (async () => {
      await ensureAuthPersistence();
      unsub = watchAuth(u => {
        setUser(u);
        setLoading(false);
      });
    })();
    return () => { if (typeof unsub === 'function') unsub(); };
  }, []);

  const value = useMemo(() => ({user, loading, signOut: doSignOut}), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}