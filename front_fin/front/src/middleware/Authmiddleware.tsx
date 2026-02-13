import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AuthMiddleware({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/refresh/', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur refresh token:', error);
      return false;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        let response = await fetch('http://localhost:8000/api/auth/me/', {
          credentials: 'include',
        });
        
        if (response.status === 401) {
          const refreshed = await refreshAccessToken();
          
          if (refreshed) {
            response = await fetch('http://localhost:8000/api/auth/me/', {
              credentials: 'include',
            });
          }
        }
        
        if (response.status === 200) {
          const data = await response.json();
          setUser(data);
          setIsAuthenticated(true);
        } else {
          sessionStorage.clear();
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Erreur vérification auth:', error);
        sessionStorage.clear();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [setUser]);

  if (isChecking) {
    return <div>Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default AuthMiddleware;

