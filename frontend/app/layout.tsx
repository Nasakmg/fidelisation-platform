import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './context/AuthContext';
import { ClientAuthProvider } from './context/ClientAuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FidélisationPro',
  description: 'Votre carte de fidélité digitale',
  manifest: '/manifest.json',
  themeColor: '#EAB308',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FidélisationPro',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#EAB308" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FidélisationPro" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ClientAuthProvider>
            {children}
          </ClientAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}