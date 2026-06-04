'use client';
import { createContext, useContext, useState, useEffect } from 'react';

interface ClientAuthContextType {
  clientToken: string | null;
  client: any | null;
  clientLogin: (token: string, client: any) => void;
  clientLogout: () => void;
}

const ClientAuthContext = createContext<ClientAuthContextType>({
  clientToken: null,
  client: null,
  clientLogin: () => {},
  clientLogout: () => {}
});

export const ClientAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [clientToken, setClientToken] = useState<string | null>(null);
  const [client, setClient] = useState<any | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('client_token');
    const savedClient = localStorage.getItem('client_data');
    if (savedToken) setClientToken(savedToken);
    if (savedClient) setClient(JSON.parse(savedClient));
  }, []);

  const clientLogin = (token: string, client: any) => {
    localStorage.setItem('client_token', token);
    localStorage.setItem('client_data', JSON.stringify(client));
    setClientToken(token);
    setClient(client);
  };

  const clientLogout = () => {
    localStorage.removeItem('client_token');
    localStorage.removeItem('client_data');
    setClientToken(null);
    setClient(null);
  };

  return (
    <ClientAuthContext.Provider value={{ clientToken, client, clientLogin, clientLogout }}>
      {children}
    </ClientAuthContext.Provider>
  );
};

export const useClientAuth = () => useContext(ClientAuthContext);