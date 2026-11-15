'use client';
import { createContext, useContext, useState, useEffect } from 'react';

interface EntrepriseSession {
  id?: number;
  nom?: string;
  email?: string;
  secteur?: string;
  plan_abonnement?: string;
  pays?: string;
  devise?: string;
  symbole_devise?: string;
}

interface AuthContextType {
  token: string | null;
  entreprise: EntrepriseSession | null;
  inscriptionBrouillon: {
    nom: string;
    email: string;
    telephone: string;
  } | null;
  login: (token: string, entreprise: EntrepriseSession) => void;
  logout: () => void;
  setInscriptionBrouillon: (brouillon: AuthContextType['inscriptionBrouillon']) => void;
  effacerInscriptionBrouillon: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  entreprise: null,
  inscriptionBrouillon: null,
  login: () => {},
  logout: () => {},
  setInscriptionBrouillon: () => {},
  effacerInscriptionBrouillon: () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [entreprise, setEntreprise] = useState<EntrepriseSession | null>(null);
  const [inscriptionBrouillon, setInscriptionBrouillon] = useState<AuthContextType['inscriptionBrouillon']>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedEntreprise = localStorage.getItem('entreprise');
    if (savedToken) setToken(savedToken);
    if (savedEntreprise) setEntreprise(JSON.parse(savedEntreprise));
  }, []);

  const login = (token: string, entreprise: EntrepriseSession) => {
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

  const effacerInscriptionBrouillon = () => setInscriptionBrouillon(null);

  return (
    <AuthContext.Provider value={{
      token,
      entreprise,
      inscriptionBrouillon,
      login,
      logout,
      setInscriptionBrouillon,
      effacerInscriptionBrouillon
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);