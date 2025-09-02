import React from 'react';
import Spinner from '@enact/sandstone/Spinner';
import {useAuth} from './AuthProvider';
import AuthForm from './AuthForm';

export default function AuthGate({children}) {
  const {user, loading} = useAuth();
  if (loading) return <div style={
	  {display: 'flex', justifyContent: 'center', padding: 24}
	}><Spinner /></div>;
  if (!user) return <AuthForm />;
  return children;
}
