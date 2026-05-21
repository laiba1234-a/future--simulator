import { useState, type FormEvent } from 'react';
import { Loader2, LogIn } from 'lucide-react';
import { AuthShell } from '../components/AuthShell';
import { useAuth } from '../contexts/AuthContext';

interface LoginPageProps {
  onGoRegister: () => void;
  onGuest: () => void;
}

export function LoginPage({ onGoRegister, onGuest }: LoginPageProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const message = await signIn(email.trim(), password);
    setLoading(false);
    if (message) setError(message);
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to save simulations to your account."
      footer={
        <>
          <span className="text-app-muted">No account? </span>
          <button
            type="button"
            onClick={onGoRegister}
            className="font-medium text-app-accent hover:underline"
          >
            Create one
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block space-y-2">
          <span className="field-label">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field-input"
            placeholder="you@example.com"
          />
        </label>

        <label className="block space-y-2">
          <span className="field-label">Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input"
            placeholder="••••••••"
          />
        </label>

        {error && (
          <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogIn className="h-4 w-4" />
          )}
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <button
          type="button"
          onClick={onGuest}
          className="w-full text-sm text-app-muted transition hover:text-app-text"
        >
          Continue as guest
        </button>
      </form>
    </AuthShell>
  );
}
