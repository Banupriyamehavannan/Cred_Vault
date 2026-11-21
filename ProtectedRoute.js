import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAdminToken } from '../utils/api';

export default function ProtectedRoute({ children }) {
  const [authenticated, setAuthenticated] = useState(Boolean(getAdminToken()));

  useEffect(() => {
    function handleUnauthorized() {
      setAuthenticated(false);
    }
    window.addEventListener('credvault:admin-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('credvault:admin-unauthorized', handleUnauthorized);
  }, []);

  return authenticated ? children : <Navigate to="/admin/login" replace />;
}
