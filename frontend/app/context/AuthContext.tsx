'use client';
import { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  token: string | null;
  entreprise: any | null;
  login: (token: string, entreprise: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  entreprise: null,
  login: () => {},
  logout: () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [entreprise, setEntreprise] = useState<any | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedEntreprise = localStorage.getItem('entreprise');
    if (savedToken) setToken(savedToken);
    if (savedEntreprise) setEntreprise(JSON.parse(savedEntreprise));
  }, []);

  const login = (token: string, entreprise: any) => {
    localStorage.setItem('token', token);
    localStorage.setItem('entreprise', JSON.stringify(entreprise));
    setToken(token);
    setEntreprise(entreprise);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('entreprise');
    setToken(null);
    setEntreprise(null);
  };

  return (
    <AuthContext.Provider value={{ token, entreprise, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);