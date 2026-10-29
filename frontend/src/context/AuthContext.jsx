import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin } from '../api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

function isTokenExpired(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=')));
    return decoded.exp * 1000 < Date.now();
  } catch {
    return false;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => {
    const t = localStorage.getItem('token');
    if (t && isTokenExpired(t)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
    return t;
  });
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!token;

  const login = async (username, password) => {
    setLoading(true);
    try {
      const data = await apiLogin(username, password);
      localStorage.setItem('token', data.token);
      const userData = { username };
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(data.token);
      setUser(userData);
      return true;
    } catch {
      toast.error('Usuário ou senha inválidos');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
