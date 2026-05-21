import { useState, type FormEvent } from 'react';
import { Loader2, UserPlus } from 'lucide-react';
import { AuthShell } from '../components/AuthShell';
import { useAuth } from '../contexts/AuthContext';

interface RegisterPageProps {
  onGoLogin: () => void;
}

export function RegisterPage({ onGoLogin }: RegisterPageProps) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const message = await signUp(email.trim(), password);
    setLoading(false);

    if (message) {
      setError(message);
      return;
    }

    setSuccess(
      'Account created. Check your email to confirm, then sign in.'
    );
  };

  return (
    <AuthShell
      title="Create account"
      subtitle="Register to sync your future simulations across devices."
      footer={
        <>
          <span className="text-app-muted">Already have an account? </span>
          <button
            type="button"
            onClick={onGoLogin}
            className="font-medium text-app-accent hover:underline"
          >
            Sign in
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input"
            placeholder="At least 6 characters"
          />
        </label>

        <label className="block space-y-2">
          <span className="field-label">Confirm password</span>
          <input
            type="password"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="field-input"
            placeholder="Repeat password"
          />
        </label>

        {error && (
          <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            {success}
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
            <UserPlus className="h-4 w-4" />
          )}
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
}
