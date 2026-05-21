import { Link } from 'react-router-dom';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
  asLink?: boolean;
}

const SIZES = {
  sm: { box: 'h-8 w-8', img: 32 },
  md: { box: 'h-10 w-10', img: 40 },
  lg: { box: 'h-12 w-12', img: 48 },
};

function LogoMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="40" height="40" rx="10" fill="url(#logoBg)" />
      <path
        d="M9 27 Q16 11 20 17 T31 12"
        stroke="url(#logoPath)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="9" cy="27" r="3" fill="#0d9488" />
      <circle cx="20" cy="17" r="3.5" fill="#0891b2" />
      <circle cx="31" cy="12" r="3" fill="#38bdf8" />
      <defs>
        <linearGradient id="logoBg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e8ecef" />
          <stop offset="1" stopColor="#dde3e8" />
        </linearGradient>
        <linearGradient
          id="logoPath"
          x1="9"
          y1="27"
          x2="31"
          y2="12"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0d9488" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function AppLogo({
  size = 'md',
  showWordmark = true,
  className = '',
  asLink = false,
}: AppLogoProps) {
  const { box, img } = SIZES[size];

  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className={`${box} logo-glow shrink-0 overflow-hidden rounded-[10px] ring-1 ring-white/80 transition duration-300 hover:shadow-glow-md`}>
        <LogoMark size={img} />
      </span>
      {showWordmark && (
        <span className="min-w-0">
          <span className="block text-sm font-semibold leading-tight tracking-tight text-app-text">
            Future Simulator
          </span>
          <span className="block text-[11px] text-app-muted">Explore your paths</span>
        </span>
      )}
    </span>
  );

  if (asLink) {
    return (
      <Link to="/" className="rounded-lg transition hover:opacity-90" aria-label="Home">
        {content}
      </Link>
    );
  }

  return content;
}
