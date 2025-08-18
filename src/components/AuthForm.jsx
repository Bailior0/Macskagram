import React, {useState} from 'react';
import Button from '@enact/sandstone/Button';
import Input from '@enact/sandstone/Input';
import {signIn, signUp, resetPassword} from '../services/auth';

const ERRORS_HU = {
  'auth/invalid-email': 'Hibás email formátum.',
  'auth/user-not-found': 'Nincs ilyen felhasználó.',
  'auth/wrong-password': 'Hibás jelszó.',
  'auth/email-already-in-use': 'Ez az email már foglalt.',
  'auth/weak-password': 'Gyenge jelszó (legalább 6 karakter).'
};

const msgFromErr = (e) => ERRORS_HU[e?.code] || e?.message || 'Ismeretlen hiba';

export default function AuthForm() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const submit = async () => {
    setMsg('');
    setBusy(true);
    try {
      const e = email.trim();
      if (mode === 'signin') {
        await signIn(e, password);
      } else {
        await signUp(e, password);
      }
    } catch (err) {
      setMsg(msgFromErr(err));
    } finally {
      setBusy(false);
    }
  };

  const onReset = async () => {
    if (!email) return setMsg('Add meg az emailedet a jelszó-visszaállításhoz.');
    setBusy(true);
    try {
      await resetPassword(email.trim());
      setMsg('Elküldtük a jelszó-visszaállító emailt.');
    } catch (err) {
      setMsg(msgFromErr(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{display: 'grid', gap: 16, maxWidth: 560}}>
      <h2 style={{margin: 0}}>{mode === 'signin' ? 'Bejelentkezés' : 'Regisztráció'}</h2>
      <Input placeholder="Email" type="email" value={email} onChange={({value}) => setEmail(value)} />
      <Input placeholder="Jelszó" type="password" value={password} onChange={({value}) => setPassword(value)} />
      <div style={{display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap'}}>
        <Button onClick={submit} disabled={busy}>
          {mode === 'signin' ? 'Belépés' : 'Regisztráció'}
        </Button>
        <Button size="small" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} disabled={busy}>
          {mode === 'signin' ? 'Nincs fiókod? Regisztrálj' : 'Már van fiókod? Lépj be'}
        </Button>
        <Button size="small" onClick={onReset} disabled={busy}>Elfelejtett jelszó</Button>
      </div>
      {msg && <div aria-live="polite">{msg}</div>}
    </div>
  );
}