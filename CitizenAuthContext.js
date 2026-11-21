import { createContext, useContext, useEffect, useState } from 'react';
import {
  clearCitizenSession,
  getCitizenToken,
  getCitizenUser,
  loginCitizen,
  registerCitizen,
  setCitizenSession
} from '../utils/api';

const CitizenAuthContext = createContext(null);

export function CitizenAuthProvider({ children }) {
  const [user, setUser] = useState(() => (
    getCitizenToken() ? getCitizenUser() : null
  ));

  useEffect(() => {
    function handleUnauthorized() {
      setUser(null);
    }
    window.addEventListener('credvault:citizen-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('credvault:citizen-unauthorized', handleUnauthorized);
  }, []);

  async function signIn(credentials) {
    const response = await loginCitizen(credentials);
    setCitizenSession(response.token, response.user);
    setUser(response.user);
    return response.user;
  }

  async function register(account) {
    const response = await registerCitizen(account);
    setCitizenSession(response.token, response.user);
    setUser(response.user);
    return response.user;
  }

  function signOut() {
    clearCitizenSession();
    setUser(null);
  }

  return (
    <CitizenAuthContext.Provider value={{ user, signIn, register, signOut }}>
      {children}
    </CitizenAuthContext.Provider>
  );
}

export function useCitizenAuth() {
  const context = useContext(CitizenAuthContext);
  if (!context) throw new Error('useCitizenAuth must be used within CitizenAuthProvider');
  return context;
}
