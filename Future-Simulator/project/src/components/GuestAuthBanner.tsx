interface GuestAuthBannerProps {
  onEmailSignIn: () => void;
}

export function GuestAuthBanner({ onEmailSignIn }: GuestAuthBannerProps) {
  return (
    <div className="card mb-6 p-5">
      <p className="text-sm font-medium text-app-text">Save simulations to your account</p>
      <p className="mt-1 text-xs text-app-muted">
        Sign in to sync runs across devices. You are currently a guest.
      </p>
      <button type="button" onClick={onEmailSignIn} className="btn-secondary mt-4 py-2">
        Sign in with email
      </button>
    </div>
  );
}
