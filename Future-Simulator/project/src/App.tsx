import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabaseConfigured } from './lib/supabase';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { SimulatorApp } from './pages/SimulatorApp';

type AuthView = 'login' | 'register';
type AppView = AuthView | 'simulator';

function AppRoutes() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<AppView>('login');
  const [guestMode, setGuestMode] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-bg text-app-muted">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (user || guestMode) {
    return (
      <BrowserRouter>
        <SimulatorApp
          onSignIn={() => {
            setGuestMode(false);
            setView('login');
          }}
          onSignedOut={() => {
            setGuestMode(false);
            setView('login');
          }}
        />
      </BrowserRouter>
    );
  }

  if (view === 'register') {
    return <RegisterPage onGoLogin={() => setView('login')} />;
  }

  return (
    <LoginPage
      onGoRegister={() => setView('register')}
      onGuest={() => {
        setGuestMode(true);
        setView('simulator');
      }}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      {supabaseConfigured ? (
        <AppRoutes />
      ) : (
        <BrowserRouter>
          <SimulatorApp onSignIn={() => {}} onSignedOut={() => {}} />
        </BrowserRouter>
      )}
    </AuthProvider>
  );
}

export default App;
