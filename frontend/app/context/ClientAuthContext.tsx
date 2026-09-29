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

  useEffect(() => {
    if (!clientToken) return;

    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    const listen = async () => {
      try {
        const { listenForForegroundNotifications } = await import('../firebase');
        const stopListening = await listenForForegroundNotifications((payload) => {
          if (!('Notification' in window) || Notification.permission !== 'granted') return;
          const data = payload.data || {};
          const title = data.title || 'E-Wallet';
          const options = {
            body: data.body || '',
            icon: data.icon || '/icon.svg',
            data
          };
          void navigator.serviceWorker.ready
            .then(registration => registration.showNotification(title, options))
            .catch(err => console.error('Erreur notification au premier plan:', err));
        });

        if (cancelled) stopListening?.();
        else if (stopListening) unsubscribe = stopListening;
      } catch (err) {
        console.error('Erreur écoute des notifications:', err);
      }
    };

    void listen();
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [clientToken]);

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