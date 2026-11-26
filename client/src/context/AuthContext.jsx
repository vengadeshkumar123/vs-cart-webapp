import { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const stored = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(stored);

  const save = (data) => {
    const u = { _id: data._id, name: data.name, email: data.email, isAdmin: data.isAdmin };
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
  };

  const login = useCallback(async (email, password) => {
    save(await api('/auth/login', { method: 'POST', body: { email, password } }));
  }, []);

  const register = useCallback(async (name, email, password) => {
    save(await api('/auth/register', { method: 'POST', body: { name, email, password } }));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}
