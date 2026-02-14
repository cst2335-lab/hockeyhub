'use client';

import { cn } from '@/lib/utils';

type LogoProps = {
  /** Size variant: sm (icon only), md (icon + text), lg (hero) */
  size?: 'sm' | 'md' | 'lg';
  /** Show "GoGoHockey" text alongside the icon */
  showText?: boolean;
  /** Use light text for dark backgrounds (e.g. hero) */
  light?: boolean;
  className?: string;
};

const GOGO_PRIMARY = '#0E4877';
const GOGO_SECONDARY = '#64BEF0';

/** Clean "GO" mark - sporty, bold, uses GoGoHockey brand colors */
function LogoIcon({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const dims = { sm: 40, md: 48, lg: 96 };
  const d = dims[size];

  return (
    <svg
      width={d}
      height={d}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden
    >
      <defs>
        <linearGradient id="logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={GOGO_PRIMARY} />
          <stop offset="100%" stopColor={GOGO_SECONDARY} />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="10" fill="url(#logo-bg)" />
      <text
        x="24"
        y="28"
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        fontWeight="800"
        fontSize="15"
        letterSpacing="-0.8"
      >
        GO
      </text>
    </svg>
  );
}

export function Logo({ size = 'md', showText = true, light = false, className }: LogoProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-3',
        size === 'lg' && 'flex-col gap-6',
        className
      )}
    >
      {/* Icon with hover lift */}
      <div
        className={cn(
          'inline-flex items-center justify-center shrink-0 transition-transform duration-200 hover:-translate-y-0.5',
          size === 'sm' && '[&_svg]:drop-shadow-md',
          size === 'md' && '[&_svg]:drop-shadow-lg',
          size === 'lg' && '[&_svg]:drop-shadow-xl'
        )}
        aria-hidden
      >
        <LogoIcon size={size} />
      </div>
      {showText && (
        <span
          className={cn(
            'font-extrabold tracking-tight',
            light
              ? 'text-white drop-shadow-md'
              : 'bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-sky-600 dark:from-sky-100 dark:to-sky-300',
            size === 'sm' && 'text-lg',
            size === 'md' && 'text-2xl',
            size === 'lg' && 'text-5xl sm:text-6xl md:text-7xl'
          )}
        >
          GoGoHockey
        </span>
      )}
    </div>
  );
}
