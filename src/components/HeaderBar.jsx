import React from 'react';
import Button from '@enact/sandstone/Button';
import {useAuth} from './AuthProvider';

export default function HeaderBar() {
  const {user, signOut} = useAuth();
  return (
    <header style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24}}>
      <span style={{fontSize: 36, fontWeight: 700}}>🐾 Macskagram</span>
      <span style={{opacity: 0.7}}>| Firebase + Enact demo</span>
      <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12}}>
        {user && <span style={{opacity: 0.8, fontSize: 18}}>{user.email}</span>}
        {user && <Button size="small" onClick={signOut}>Kijelentkezés</Button>}
      </div>
    </header>
  );
}