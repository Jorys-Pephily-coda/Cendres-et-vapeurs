import { Navigate } from 'react-router-dom';

function AuthMiddleware({ children }: { children: React.ReactNode }) {
  const connected = sessionStorage.getItem('connected');

  if (connected !== 'true') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default AuthMiddleware;