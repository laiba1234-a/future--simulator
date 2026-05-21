import { LogOut } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { useScrollToTopOnChange } from '../../hooks/useScrollToTopOnChange';
import { AppLogo } from '../brand/AppLogo';
import { JourneyPath } from '../visuals/JourneyPath';
import { useAuth } from '../../contexts/AuthContext';
import { supabaseConfigured } from '../../lib/supabase';
import { AppContainer } from './AppContainer';

interface AppShellProps {
  onSignIn: () => void;
  onSignedOut?: () => void;
}

export function AppShell({ onSignIn, onSignedOut }: AppShellProps) {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();

  useScrollToTopOnChange(pathname);

  const handleSignOut = async () => {
    await signOut();
    onSignedOut?.();
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col text-app-text">
      <header className="glass-panel sticky top-0 z-40 w-full">
        <AppContainer>
          <div className="flex items-center justify-between gap-4 py-3">
            <AppLogo asLink size="md" />

            <div className="flex items-center gap-2">
              <span className="hidden max-w-[180px] truncate text-xs text-app-muted sm:inline">
                {user ? user.email : supabaseConfigured ? 'Guest' : 'Local'}
              </span>
              {user ? (
                <button type="button" onClick={handleSignOut} className="btn-ghost">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              ) : (
                <button type="button" onClick={onSignIn} className="btn-secondary py-2">
                  Sign in
                </button>
              )}
            </div>
          </div>
        </AppContainer>

        <div className="nav-ribbon border-t border-white/40">
          <AppContainer className="py-1.5">
            <JourneyPath />
          </AppContainer>
        </div>
      </header>

      <main className="relative z-10 w-full flex-1 py-6">
        <AppContainer>
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </AppContainer>
      </main>
    </div>
  );
}
