import { Navigate, useLocation } from 'react-router-dom';
import { useCitizenAuth } from '../context/CitizenAuthContext';

export default function CitizenProtectedRoute({ children }) {
  const { user } = useCitizenAuth();
  const location = useLocation();

  return user
    ? children
    : <Navigate to="/login" replace state={{ from: location }} />;
}
