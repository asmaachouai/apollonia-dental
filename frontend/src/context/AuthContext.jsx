import { createContext, useContext, useState } from 'react';
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('apollonia_user') || 'null'); }
    catch { return null; }
  });
  const login  = (data) => { localStorage.setItem('apollonia_user', JSON.stringify(data)); setUser(data); };
  const logout = ()     => { localStorage.removeItem('apollonia_user'); setUser(null); };
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
