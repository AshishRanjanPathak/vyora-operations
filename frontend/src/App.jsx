import React from 'react';
import { Toaster } from './components/ui/sonner.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { AppRouter } from './routes/AppRouter.jsx';

export default function App() {
  return (
    <AuthProvider>
      <Toaster richColors position="top-right" closeButton expand={false} />
      <AppRouter />
    </AuthProvider>
  );
}