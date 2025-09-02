import React, {useState, useEffect} from 'react';
import Button from '@enact/sandstone/Button';
import {useAuth} from './AuthProvider';

export default function HeaderBar() {
  const {user, signOut} = useAuth();
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(theme === 'light' ? 'light-theme' : 'dark-theme');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        marginBottom: 24,
        background: 'var(--header-bg)',
        color: 'var(--header-text)',
        padding: '12px 16px',
        borderRadius: 12
      }}
    >
      <span style={{fontSize: 36, fontWeight: 700}}>🐾 Macskagram</span>
      <span style={{opacity: 0.7}}>| Firebase + Enact demo</span>

      <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12}}>
        {/* Theme váltó gomb 🌞🌙 */}
        <Button
          size="small"
          onClick={toggleTheme}
          className="themed-button"
          style={{minWidth: 48, borderRadius: '50%'}}
        >
          {theme === 'dark' ? '🌞' : '🌙'}
        </Button>

        {user && <span style={{opacity: 0.8, fontSize: 18}}>{user.email}</span>}
        {user && (
          <Button size="small" onClick={signOut} className="themed-button">
            Kijelentkezés
          </Button>
        )}
      </div>
    </header>
  );
}
