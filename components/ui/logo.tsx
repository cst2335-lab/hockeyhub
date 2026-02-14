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

const HH_BLUE = '#2563eb';
const HH_BLUE_BRIGHT = '#3b82f6';
const HH_SKY = '#38bdf8';

export function Logo({ size = 'md', showText = true, light = false, className }: LogoProps) {
  const iconSizes = { sm: 40, md: 48, lg: 96 };
  const iconSize = iconSizes[size];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-3',
        size === 'lg' && 'flex-col gap-6',
        className
      )}
    >
      {/* GG icon - bright blue rounded box */}
      <div
        className={cn(
          'inline-flex items-center justify-center font-black text-white shrink-0',
          'bg-gradient-to-br shadow-lg ring-1 ring-white/20',
          'transition-transform duration-200 hover:-translate-y-0.5',
          size === 'sm' && 'h-10 w-10 rounded-xl text-base',
          size === 'md' && 'h-12 w-12 rounded-2xl text-xl',
          size === 'lg' && 'h-24 w-24 rounded-3xl text-4xl shadow-2xl'
        )}
        style={{
          background: `linear-gradient(135deg, ${HH_BLUE} 0%, ${HH_BLUE_BRIGHT} 50%, ${HH_SKY} 100%)`,
          boxShadow: `0 8px 24px rgba(37, 99, 235, 0.4)`,
        }}
        aria-hidden
      >
        GG
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
